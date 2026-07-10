// API service for backend communication
import { API_URL } from './config'

export interface Player {
    id: string
    name: string
    age: number
    hand: 'right' | 'left'
    skillLevel: 'Beginner' | 'Amateur' | 'Club' | 'Semi-Pro'
    avatarIndex: number
    createdAt: number
    sessionIds: string[]
}

export interface PlayerStats {
    totalSessions: number
    totalShots: number
    avgElbow: number
    avgKnee: number
    bestSwingSpeed: number
    lastSessionDate: string | null
    avgRating: number
}

// Player API
export const PlayerAPI = {
    async create(data: {
        name: string
        age: number
        hand: 'right' | 'left'
        skillLevel: 'Beginner' | 'Amateur' | 'Club' | 'Semi-Pro'
        avatarIndex: number
    }): Promise<Player> {
        const res = await fetch(`${API_URL}/api/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to create player')
        return res.json()
    },

    async getAll(): Promise<Player[]> {
        const res = await fetch(`${API_URL}/api/players`)
        if (!res.ok) throw new Error('Failed to fetch players')
        return res.json()
    },

    async getById(id: string): Promise<Player> {
        const res = await fetch(`${API_URL}/api/players/${id}`)
        if (!res.ok) throw new Error('Player not found')
        return res.json()
    },

    async getStats(id: string): Promise<PlayerStats> {
        const res = await fetch(`${API_URL}/api/players/${id}/stats`)
        if (!res.ok) throw new Error('Failed to fetch stats')
        return res.json()
    },

    async update(id: string, data: Partial<Player>): Promise<Player> {
        const res = await fetch(`${API_URL}/api/players/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update player')
        return res.json()
    },

    async delete(id: string): Promise<void> {
        const res = await fetch(`${API_URL}/api/players/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to delete player')
    },
}

// Session API
export const SessionAPI = {
    async start(playerId: string) {
        const res = await fetch(`${API_URL}/api/sessions/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerId }),
        })
        if (!res.ok) throw new Error('Failed to start session')
        return res.json()
    },

    async end(sessionId: string) {
        const res = await fetch(`${API_URL}/api/sessions/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        })
        if (!res.ok) throw new Error('Failed to end session')
        return res.json()
    },

    async getAll(playerId?: string) {
        const url = playerId
            ? `${API_URL}/api/sessions?playerId=${playerId}`
            : `${API_URL}/api/sessions`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch sessions')
        return res.json()
    },

    async getById(id: string) {
        const res = await fetch(`${API_URL}/api/sessions/${id}`)
        if (!res.ok) throw new Error('Session not found')
        return res.json()
    },
}

// Health check
export const HealthAPI = {
    async check() {
        const res = await fetch(`${API_URL}/api/health`)
        if (!res.ok) throw new Error('Backend is down')
        return res.json()
    },
}
