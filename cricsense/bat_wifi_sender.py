#!/usr/bin/env python3
# bat_wifi_sender.py — runs on Arduino UNO Q (QRB2210 Linux/Debian side)
#
# HOW TO DEPLOY via Arduino App Lab (~2 minutes, no Linux knowledge needed):
#
#   The Arduino UNO Q comes with Debian Linux AND Arduino App Lab PRE-INSTALLED.
#   You do not set up Linux. You just open a browser.
#
#   Step 1: Connect Arduino UNO Q to laptop via USB-C
#   Step 2: Open browser on laptop → go to  http://arduino.local
#           (Arduino App Lab opens — a Python editor running ON the Arduino)
#   Step 3: In App Lab UI → find WiFi settings → connect to event WiFi
#           (enter SSID + password, one click)
#   Step 4: Paste this entire file into the App Lab editor
#   Step 5: Change LAPTOP_IP below to your laptop's WiFi IP (run `ipconfig` on laptop)
#   Step 6: Click Run in App Lab
#   Step 7: DISCONNECT the USB-C cable
#   Step 8: Connect a power bank to the Arduino USB-C port instead
#   Step 9: Tape Arduino + power bank + MPU-6050 to bat handle
#           Arduino is now fully wireless — no cable to laptop
#
# To autostart on every power-on (so you don't need App Lab during demo):
#   In App Lab → find "autostart" or "run on boot" option and enable it
#   OR: App Lab usually has a checkbox "Run on startup" next to the Run button
#
# WHAT THIS DOES:
#   Reads JSON lines from the STM32 Arduino side via the internal serial bridge
#   (/dev/ttySTM32 or /dev/ttyS0 — the pipe between QRB2210 and STM32).
#   Sends each line as a UDP packet to the laptop at 200Hz.

import socket
import serial
import time

# ─── CONFIGURE THESE ────────────────────────────────────────────────────────
LAPTOP_IP   = "192.168.1.42"   # ❓ run `ipconfig` on laptop → WiFi IPv4 address
LAPTOP_PORT = 9999             # must match BAT_UDP_PORT in config.py
BAUD        = 500000           # must match bat_sensor.ino Serial.begin()

# Internal serial bridge: STM32 → QRB2210
# Common paths on Arduino UNO Q — try these in order:
BRIDGE_PORTS = ["/dev/ttySTM32", "/dev/ttyS0", "/dev/ttyAMA0", "/dev/ttyUSB0"]
# ────────────────────────────────────────────────────────────────────────────


def find_bridge_port():
    """Try each known bridge port until one opens."""
    import os
    for port in BRIDGE_PORTS:
        if os.path.exists(port):
            try:
                s = serial.Serial(port, BAUD, timeout=0.5)
                print(f"[bat_wifi_sender] Bridge found: {port}")
                return s
            except Exception:
                continue
    raise RuntimeError(
        "Could not open STM32 bridge port. "
        f"Tried: {BRIDGE_PORTS}. "
        "Confirm port name with: ls /dev/tty*"
    )


def main():
    # UDP socket — no connection handshake, fire-and-forget
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    dest = (LAPTOP_IP, LAPTOP_PORT)

    bridge = find_bridge_port()
    print(f"[bat_wifi_sender] Streaming to {LAPTOP_IP}:{LAPTOP_PORT}")

    consecutive_errors = 0
    while True:
        try:
            line = bridge.readline().decode("utf-8", errors="ignore").strip()
            if line.startswith("{"):
                # Send raw JSON bytes as one UDP packet
                sock.sendto(line.encode("utf-8"), dest)
                consecutive_errors = 0
        except serial.SerialException:
            consecutive_errors += 1
            if consecutive_errors > 20:
                print("[bat_wifi_sender] Bridge lost — retrying in 2s")
                time.sleep(2)
                try:
                    bridge.close()
                except Exception:
                    pass
                bridge = find_bridge_port()
                consecutive_errors = 0
        except Exception:
            pass   # never crash — keep streaming


if __name__ == "__main__":
    main()
