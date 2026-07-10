export const API_URL  = import.meta.env.VITE_API_URL  ?? 'http://localhost:5000'
export const WS_URL   = import.meta.env.VITE_WS_URL   ?? 'ws://localhost:8766'
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

export const ELBOW_IDEAL = { min: 100, max: 130 }
export const KNEE_IDEAL  = { min: 140, max: 160 }
