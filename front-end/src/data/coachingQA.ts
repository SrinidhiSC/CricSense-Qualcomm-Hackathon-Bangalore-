// Predefined coaching Q&A.
// To swap in a real LLM, replace getResponse() body with a fetch to the LLM endpoint.
// The function signature stays identical — no other code needs to change.

export interface QAPair {
  keywords: string[]
  question: string   // shown as a suggestion chip
  answer: string
}

export const QA_PAIRS: QAPair[] = [
  {
    keywords: ['elbow', 'front arm', 'arm angle'],
    question: 'What is the ideal elbow angle?',
    answer:
      'Your front elbow should stay between 100°–130° through the shot. Below 100° you lose your swing arc; above 130° the arm locks and bleeds power. Keep a soft, relaxed bend at setup and let it drive through naturally on contact.',
  },
  {
    keywords: ['knee', 'knee bend', 'front leg', 'leg position'],
    question: 'How much should I bend my front knee?',
    answer:
      'Front knee should sit at 140°–160° through the ball. Think "soft landing" — not locked straight, not collapsing. A stable knee transfers weight from back foot to front cleanly and keeps your head level through impact.',
  },
  {
    keywords: ['head', 'head position', 'head still', 'eyes'],
    question: 'Why does my head fall away?',
    answer:
      'Head falling away usually means your weight stays on the back foot while the ball arrives. Cue: lead with the chin toward the ball, not the hands. Your nose should finish over or just behind the front knee after impact.',
  },
  {
    keywords: ['stance', 'setup', 'guard', 'position'],
    question: 'How should I set up my stance?',
    answer:
      'Feet shoulder-width apart, front shoulder pointing at the bowler, weight evenly split. Bend both knees slightly — it keeps you athletic and lets you move quickly in either direction. Hold the bat lightly at the top of the grip.',
  },
  {
    keywords: ['grip', 'bat grip', 'hold', 'handle'],
    question: 'How should I grip the bat?',
    answer:
      'V-shapes of both thumbs and forefingers should point between the outside edge and the splice. Top hand controls direction — keep it firm. Bottom hand generates power at impact but should stay relaxed until the moment of contact.',
  },
  {
    keywords: ['footwork', 'foot', 'movement', 'step'],
    question: 'How do I improve my footwork?',
    answer:
      'First move is always front foot or back foot — commit early. Against full deliveries, drive the front foot toward the pitch of the ball. Against short balls, pivot and rock back quickly. Shadow-practice 50 movements a day without a ball.',
  },
  {
    keywords: ['drive', 'cover drive', 'straight drive', 'off drive'],
    question: 'How do I play a better cover drive?',
    answer:
      'Head over the ball, front knee over front toe, bat swing high to low then through. Keep the face closed slightly at contact — open face sends it in the air. The power comes from weight transfer, not arm muscle.',
  },
  {
    keywords: ['pull shot', 'pull', 'short ball', 'bouncer', 'short pitch'],
    question: 'How do I play the pull shot?',
    answer:
      'Pick up length early — if it is short, rock back fast. Get inside the line, roll the wrists over to keep it down, and swing hard through the line. Do not hook at the ball — pull it in front of square. Practice against throw-downs first.',
  },
  {
    keywords: ['defense', 'defend', 'defensive', 'block'],
    question: 'How do I tighten my defense?',
    answer:
      'Soft hands are the key — grip pressure drops at impact so the ball dies in front of you. Keep the face of the bat angled down toward the pitch. Watch the ball all the way onto the bat face. Your front arm controls the angle.',
  },
  {
    keywords: ['sweep', 'sweep shot', 'spin', 'spinner'],
    question: 'How do I play spin better?',
    answer:
      'Get forward early to kill the spin. Use your pad as a second line of defense. For sweep shots, get the front knee down close to the pitch. For drives against spin, reach out to the pitch of the ball — do not let it turn into you.',
  },
  {
    keywords: ['timing', 'timing the ball', 'middle', 'sweet spot'],
    question: 'How do I improve my timing?',
    answer:
      'Timing comes from still head + correct contact point. The contact point for drives is just in front of the front pad. Wait for the ball to come to you — most mistimed shots are played too early. Soft bottom hand until the moment of contact.',
  },
  {
    keywords: ['swing speed', 'bat speed', 'power', 'hitting'],
    question: 'How do I increase bat speed?',
    answer:
      'Bat speed comes from a full arm extension and wrist snap at the point of contact — not from tensing up before the ball arrives. Keep your grip loose at setup, and uncoil fast only at the last moment. Core rotation drives bat speed more than arm strength.',
  },
  {
    keywords: ['wrist', 'wrist snap', 'roll', 'wrist rotation'],
    question: 'When should I snap my wrists?',
    answer:
      'Wrist snap should happen at or just after contact, not before. Turning early opens the face and gets you caught at cover. For on-side shots, roll the wrists over at contact to keep it along the ground. For off-side drives, keep the wrists firm through the ball.',
  },
  {
    keywords: ['concentration', 'focus', 'mental', 'pressure', 'nerves'],
    question: 'How do I stay focused at the crease?',
    answer:
      'Between balls: look away, reset, breathe. At the bowler\'s mark: narrow your focus to the ball in the hand. Watch the seam from the moment of release. Treat every ball as the first ball — do not think about the previous shot. One ball at a time.',
  },
  {
    keywords: ['score', 'development score', 'rating', 'progress'],
    question: 'What does my development score mean?',
    answer:
      'Your development score is a composite of technique, fitness, discipline, match awareness, and mental strength. A score of 72 means you are performing well above average for your category. Focus on the lowest sub-score first — for you, that is mental strength at 65.',
  },
  {
    keywords: ['practice', 'drill', 'training', 'net'],
    question: 'What should I practice in nets?',
    answer:
      'Prioritise quality over quantity. 20 focused drives with correct footwork beats 100 casual swings. Set a specific goal each session — today fix the knee collapse, not everything at once. Film yourself from mid-off to check head position after impact.',
  },
  {
    keywords: ['improve', 'get better', 'weakness', 'flaw'],
    question: 'What is my biggest area to improve?',
    answer:
      'Based on your session data, short-pitched bowling is the current priority. Your instinct is to half-commit — either duck fully or get on top of the bounce and pull decisively. Hesitation is the real problem, not technique. Add short-ball drills twice a week.',
  },
  {
    keywords: ['hello', 'hi', 'help', 'who are you', 'what can you do'],
    question: 'What can you help me with?',
    answer:
      'I am your CricSense coaching assistant. Ask me about technique — elbow angle, knee bend, footwork, shot selection — or about your training goals and development score. I am here to help you improve, one ball at a time.',
  },
]

const DEFAULT_ANSWER =
  'That is a great question. For the most accurate answer, speak to your coach directly during a live session. I can help best with technique questions — elbow, knee, footwork, shot selection, or mental game.'

// ── Core response function ────────────────────────────────────────────────────
// SWAP POINT: replace the body of this function with a fetch() to your LLM.
// Keep the signature: (question: string) => Promise<string>

export async function getResponse(question: string): Promise<string> {
  // Simulate a short thinking delay
  await new Promise(r => setTimeout(r, 600 + Math.random() * 500))

  const q = question.toLowerCase()
  const match = QA_PAIRS.find(pair =>
    pair.keywords.some(k => q.includes(k))
  )
  return match?.answer ?? DEFAULT_ANSWER
}

// Suggestion chips shown before the user types
export const SUGGESTIONS = [
  'What is the ideal elbow angle?',
  'How do I improve my footwork?',
  'How do I play the pull shot?',
  'How do I stay focused at the crease?',
  'What should I practice in nets?',
]
