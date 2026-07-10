# tests/test_angles.py — proves the angle math is correct
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from angles import angle


def test_right_angle():
    assert abs(angle((0, 1), (0, 0), (1, 0)) - 90) < 1e-6, "L-shape should be 90°"


def test_straight_line():
    assert abs(angle((0, 1), (0, 0), (0, -1)) - 180) < 1e-6, "Straight line should be 180°"


def test_acute():
    result = angle((1, 0), (0, 0), (0, 1))
    assert 44 < result < 46, f"Expected ~45°, got {result}"


def test_degenerate():
    # Coincident points should return 0, not raise
    assert angle((0, 0), (0, 0), (1, 1)) == 0.0


if __name__ == "__main__":
    test_right_angle()
    test_straight_line()
    test_acute()
    test_degenerate()
    print("All angle tests passed ✓")
