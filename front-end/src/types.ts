export interface Landmark {
  x: number; y: number; z: number; visibility: number
}

export interface CoachingCue {
  text: string
  lang: 'hi' | 'en'
  source: 'llm' | 'rule'
}

export interface SarvamExchange {
  question: string; reply: string; timestamp: number
}

export interface DeviceStatus {
  arduino: boolean; phone: boolean; npu: boolean; cloud: boolean
}

export interface Metrics {
  elbow: number; knee: number
  head: 'over front knee' | 'falling away' | '-'
}

export interface BatData {
  swing: number; wrist: number; wristRate: number; impact: 0 | 1
}

export type SessionPhase = 'startup' | 'tracking' | 'shot_detected' | 'qa_active' | 'report'
export type LLMStatus    = 'idle' | 'thinking' | 'replied'

export interface WSFrame {
  keypoints:       Landmark[] | null
  metrics:         Metrics
  bat:             BatData
  coaching:        CoachingCue | null
  devices:         DeviceStatus
  sarvam:          SarvamExchange | null
  phase:           SessionPhase
  llmStatus:       LLMStatus
  pendingQuestion: string | null
}

export interface Player {
  id: string; name: string; age: number
  hand: 'right' | 'left'
  skillLevel: 'Beginner' | 'Amateur' | 'Club' | 'Semi-Pro'
  avatarIndex: number
  createdAt: number; sessionIds: string[]
}

export interface Shot {
  id: string; shotNumber: number; timestamp: number
  elbow: number; knee: number; head: string
  swingSpeed: number; wristSnap: number
  coaching: CoachingCue; isGoodShot: boolean
}

export interface CloudReport {
  mostCommonFlaw: string; mostCommonFlawDetail: string
  improvement: string; improvementDetail: string
  drillRecommendation: string; rating: number
  rawText: string; generatedAt: number
  avgElbow: number; avgKnee: number; avgSwing: number
  firstShotElbow: number; lastShotElbow: number
}

export interface Session {
  id: string; playerId: string; date: string
  startTime: number; endTime: number
  shots: Shot[]; cloudReport: CloudReport | null; recordingKey: string | null
}
