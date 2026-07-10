import type { WSFrame, Landmark, SessionPhase } from '../types'

// Batting stance: 33 landmarks normalized 0-1 in a 640x480 view
function battingStanceLandmarks(): Landmark[] {
  // Simplified landmark positions for a right-handed batsman in a side-on stance
  const base: [number, number][] = [
    [0.50, 0.08],  // 0  nose
    [0.51, 0.07],  // 1  left eye inner
    [0.52, 0.07],  // 2  left eye
    [0.53, 0.07],  // 3  left eye outer
    [0.48, 0.07],  // 4  right eye inner
    [0.47, 0.07],  // 5  right eye
    [0.46, 0.07],  // 6  right eye outer
    [0.53, 0.09],  // 7  left ear
    [0.46, 0.09],  // 8  right ear
    [0.51, 0.11],  // 9  mouth left
    [0.49, 0.11],  // 10 mouth right
    [0.58, 0.22],  // 11 left shoulder
    [0.42, 0.22],  // 12 right shoulder
    [0.65, 0.38],  // 13 left elbow
    [0.35, 0.35],  // 14 right elbow
    [0.68, 0.52],  // 15 left wrist
    [0.38, 0.50],  // 16 right wrist
    [0.70, 0.55],  // 17 left pinky
    [0.39, 0.53],  // 18 right pinky
    [0.69, 0.54],  // 19 left index
    [0.38, 0.52],  // 20 right index
    [0.70, 0.54],  // 21 left thumb
    [0.37, 0.52],  // 22 right thumb
    [0.56, 0.54],  // 23 left hip
    [0.44, 0.54],  // 24 right hip
    [0.54, 0.72],  // 25 left knee
    [0.42, 0.70],  // 26 right knee
    [0.53, 0.88],  // 27 left ankle
    [0.43, 0.88],  // 28 right ankle
    [0.53, 0.92],  // 29 left heel
    [0.44, 0.92],  // 30 right heel
    [0.54, 0.96],  // 31 left foot index
    [0.44, 0.96],  // 32 right foot index
  ]
  return base.map(([x, y]) => ({
    x: x + (Math.random() - 0.5) * 0.008,
    y: y + (Math.random() - 0.5) * 0.008,
    z: 0,
    visibility: 0.85 + Math.random() * 0.15,
  }))
}

function impactLandmarks(): Landmark[] {
  // Bat swing follow-through — left arm extended
  const base: [number, number][] = [
    [0.50, 0.08],  // 0  nose
    [0.51, 0.07],  // 1-10 face
    [0.52, 0.07], [0.53, 0.07], [0.48, 0.07],
    [0.47, 0.07], [0.46, 0.07], [0.53, 0.09],
    [0.46, 0.09], [0.51, 0.11], [0.49, 0.11],
    [0.60, 0.21],  // 11 left shoulder
    [0.42, 0.22],  // 12 right shoulder
    [0.72, 0.30],  // 13 left elbow (raised)
    [0.36, 0.33],  // 14 right elbow
    [0.78, 0.20],  // 15 left wrist (follow-through)
    [0.36, 0.48],  // 16 right wrist
    [0.80, 0.22], [0.37, 0.51], [0.79, 0.21], [0.36, 0.50],
    [0.80, 0.21], [0.35, 0.50],
    [0.56, 0.54],  // 23 left hip
    [0.44, 0.54],  // 24 right hip
    [0.58, 0.70],  // 25 left knee (weight shifted)
    [0.40, 0.72],  // 26 right knee
    [0.60, 0.88],  // 27 left ankle
    [0.40, 0.88],  // 28 right ankle
    [0.60, 0.92], [0.40, 0.92], [0.61, 0.96], [0.40, 0.96],
  ]
  return base.map(([x, y]) => ({
    x: x + (Math.random() - 0.5) * 0.005,
    y: y + (Math.random() - 0.5) * 0.005,
    z: 0,
    visibility: 0.9 + Math.random() * 0.1,
  }))
}

const COACHING_CUES = [
  { text: 'कोहनी ऊँची रखें — बल्ले को सीधा नीचे लाएं', lang: 'hi' as const, source: 'rule' as const },
  { text: 'घुटना मोड़ें और संतुलन बनाए रखें', lang: 'hi' as const, source: 'llm'  as const },
  { text: 'Front foot forward — commit to the drive', lang: 'en' as const, source: 'rule' as const },
  { text: 'Watch the ball all the way to the bat face', lang: 'en' as const, source: 'llm'  as const },
  { text: 'Elbow angle 115° — approaching ideal range', lang: 'en' as const, source: 'rule' as const },
]

let shotCounter = 0

export function buildMockFrame(phase: SessionPhase): WSFrame {
  const isImpact = phase === 'shot_detected'

  if (isImpact) shotCounter++

  return {
    keypoints: phase === 'startup' ? null : (isImpact ? impactLandmarks() : battingStanceLandmarks()),
    metrics: {
      elbow: isImpact ? 112 + Math.random() * 10 : 118 + Math.random() * 8,
      knee:  isImpact ? 148 + Math.random() * 8  : 152 + Math.random() * 6,
      head:  Math.random() > 0.15 ? 'over front knee' : 'falling away',
    },
    bat: {
      swing:     isImpact ? 85 + Math.random() * 20 : 0.3 + Math.random() * 1.2,
      wrist:     isImpact ? 35 + Math.random() * 15 : 5  + Math.random() * 5,
      wristRate: isImpact ? 420 + Math.random() * 80 : 40 + Math.random() * 20,
      impact:    isImpact ? 1 : 0,
    },
    coaching: phase === 'qa_active'
      ? COACHING_CUES[Math.floor(Math.random() * COACHING_CUES.length)]
      : null,
    devices: { arduino: true, phone: true, npu: true, cloud: phase !== 'startup' },
    sarvam: null,
    phase,
    llmStatus: phase === 'qa_active' ? 'replied' : 'idle',
    pendingQuestion: null,
  }
}

export function getShotCount() { return shotCounter }
export function resetShotCount() { shotCounter = 0 }
