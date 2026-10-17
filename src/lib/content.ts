import type { ConceptId, EmotionId, Mood, Palette } from './scene';
import { T } from './scene';

/* ---------------------------------------------------------------- EMOTIONS */

export interface Emotion {
  id: EmotionId;
  label: string;
  /** one-sentence function of the emotion */
  line: string;
  felt: string;
  asks: string;
  mood: Mood;
  palette: Palette;
}

const m = (o: Partial<Mood>): Mood => ({
  turb: 0.06,
  jitter: 0,
  speed: 1,
  expand: 0,
  fall: 0,
  swirl: 0.05,
  pull: 0,
  pulse: 0,
  size: 1,
  bright: 1,
  ...o,
});

export const EMOTIONS: Emotion[] = [
  {
    id: 'fear',
    label: 'Fear',
    line: 'An alarm that predicts harm. It narrows attention and readies the body — vital when the threat is real, exhausting when it is only imagined.',
    felt: 'Chest, breath, gut',
    asks: 'Is this danger present, or remembered?',
    mood: m({ turb: 0.6, jitter: 0.85, speed: 2.3, expand: -0.12, swirl: 0.3, size: 0.9, bright: 0.95 }),
    palette: { a: '#162a78', b: '#5f80ff', c: '#d4e4ff' },
  },
  {
    id: 'love',
    label: 'Love',
    line: 'Attachment made felt. It tunes attention toward another person and makes closeness register as safety.',
    felt: 'Warmth, chest, face',
    asks: 'Who do you move toward without effort?',
    mood: m({ turb: 0.09, speed: 0.7, expand: 0.05, pull: 0.12, pulse: 1, size: 1.15, bright: 1.15 }),
    palette: { a: '#52186f', b: '#c566ff', c: '#ffdcf2' },
  },
  {
    id: 'anger',
    label: 'Anger',
    line: 'A response to perceived violation or obstruction. It mobilizes energy; what matters is where you direct it.',
    felt: 'Jaw, hands, heat',
    asks: 'What boundary was crossed?',
    mood: m({ turb: 0.78, jitter: 0.2, speed: 2.7, expand: 0.22, swirl: 0.5, pulse: 0.5, bright: 1.2 }),
    palette: { a: '#59101f', b: '#f0475c', c: '#ffd5c8' },
  },
  {
    id: 'grief',
    label: 'Grief',
    line: 'The cost of having loved. Less a problem to solve than a process the mind needs time to complete.',
    felt: 'Throat, weight, fatigue',
    asks: 'What are you still carrying for them?',
    mood: m({ turb: 0.05, speed: 0.35, fall: 1, size: 0.95, bright: 0.78 }),
    palette: { a: '#0f1a3d', b: '#3c5d9f', c: '#9fb4dc' },
  },
  {
    id: 'joy',
    label: 'Joy',
    line: 'It broadens attention and builds connection. It tends to arrive as a by-product of engagement, not as a target.',
    felt: 'Lightness, chest, smile',
    asks: 'What were you absorbed in when it arrived?',
    mood: m({ turb: 0.26, speed: 1.6, expand: 0.32, fall: -0.5, swirl: 0.35, size: 1.2, bright: 1.3 }),
    palette: { a: '#3a2fd2', b: '#7fabff', c: '#fff1c4' },
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    line: 'Fear of what might happen. The mind rehearses the future to protect you, then struggles to stop.',
    felt: 'Stomach, shoulders, racing thoughts',
    asks: 'What am I trying to control?',
    mood: m({ turb: 0.32, jitter: 1, speed: 3, expand: -0.05, swirl: 0.65, size: 0.85 }),
    palette: { a: '#26286e', b: '#9181ff', c: '#d9d6ff' },
  },
  {
    id: 'desire',
    label: 'Desire',
    line: 'Wanting is its own system, distinct from liking. It pulls you toward a reward before you know it will satisfy.',
    felt: 'Pull, pulse, attention',
    asks: 'Do I want this — or what it promises?',
    mood: m({ turb: 0.15, speed: 1.2, swirl: 1.15, pull: 0.5, pulse: 0.3, bright: 1.2 }),
    palette: { a: '#4a0f5c', b: '#f2429a', c: '#ffc9e7' },
  },
  {
    id: 'shame',
    label: 'Shame',
    line: 'The feeling that you are wrong, not merely that you did something wrong. It makes people hide; connection is what dissolves it.',
    felt: 'Face, stomach, collapse',
    asks: 'Whose voice is this, really?',
    mood: m({ turb: 0.04, speed: 0.5, expand: -0.35, fall: 0.25, pull: 0.35, size: 0.8, bright: 0.58 }),
    palette: { a: '#1a1032', b: '#4c3c80', c: '#8f80c0' },
  },
  {
    id: 'hope',
    label: 'Hope',
    line: 'Not optimism, but the belief that a path exists and that you can act on it.',
    felt: 'Lift, openness, breath',
    asks: 'What is one step that is actually in reach?',
    mood: m({ turb: 0.1, speed: 0.9, expand: 0.12, fall: -0.75, size: 1.1, bright: 1.25 }),
    palette: { a: '#363a9c', b: '#8eb2ff', c: '#ffe8b0' },
  },
];

/* ------------------------------------------------------------- INNER WORLD */

export interface Concept {
  id: ConceptId;
  label: string;
  line: string;
  prompt: string;
  /** morph target to show */
  target: number;
  mood: Mood;
  palette: Palette;
  /** neural arc activity 0..1 */
  neural: number;
  /** extra rotation speed */
  spin: number;
  /** scale multiplier on top of the keyframe */
  scale: number;
}

export const CONCEPTS: Concept[] = [
  {
    id: 'thoughts',
    label: 'Thoughts',
    line: 'The running commentary. Most of it arrives uninvited, and most of it repeats.',
    prompt: 'Which thought have you repeated most today?',
    target: T.BRAIN,
    mood: m({ turb: 0.1, jitter: 0.25, speed: 1.6 }),
    palette: { a: '#2a20b0', b: '#7a5cff', c: '#bfd2ff' },
    neural: 1,
    spin: 0.08,
    scale: 1,
  },
  {
    id: 'emotions',
    label: 'Emotions',
    line: 'Fast, bodily and informative. They color perception before language arrives.',
    prompt: 'Where in your body is the feeling right now?',
    target: T.FIELD,
    mood: m({ turb: 0.28, speed: 1.2, swirl: 0.4 }),
    palette: { a: '#4a1c8c', b: '#b36bff', c: '#ffd5f4' },
    neural: 0,
    spin: 0,
    scale: 0.62,
  },
  {
    id: 'memories',
    label: 'Memories',
    line: 'Layers that are rebuilt, slightly differently, every time you visit them.',
    prompt: 'What memory feels vivid — and how sure are you of its details?',
    target: T.STRATA,
    mood: m({ turb: 0.05, speed: 0.6, fall: 0.15 }),
    palette: { a: '#1d2e86', b: '#5f8dff', c: '#c7dcff' },
    neural: 0,
    spin: 0.1,
    scale: 0.95,
  },
  {
    id: 'beliefs',
    label: 'Beliefs',
    line: 'The scaffolding you rarely inspect. It decides what counts as evidence.',
    prompt: 'What do you assume is simply true?',
    target: T.LATTICE,
    mood: m({ turb: 0.012, speed: 0.4, size: 0.9 }),
    palette: { a: '#1f2a9a', b: '#7694ff', c: '#e1e9ff' },
    neural: 0,
    spin: 0.14,
    scale: 0.95,
  },
  {
    id: 'identity',
    label: 'Identity',
    line: 'The story that holds the rest together — edited more often than you think.',
    prompt: 'Which part of your story would you rewrite?',
    target: T.HEAD,
    mood: m({ turb: 0.05, speed: 0.8, pulse: 0.2 }),
    palette: { a: '#34209c', b: '#9a78ff', c: '#e3d9ff' },
    neural: 0,
    spin: 0,
    scale: 0.82,
  },
  {
    id: 'desire',
    label: 'Desire',
    line: 'The pull beneath your choices — often older, and louder, than your reasons.',
    prompt: 'What have you been moving toward without deciding to?',
    target: T.VORTEX,
    mood: m({ turb: 0.1, speed: 1.4, swirl: 0.9, pull: 0.25 }),
    palette: { a: '#4a1070', b: '#e04bd0', c: '#ffd0f2' },
    neural: 0,
    spin: 0,
    scale: 1,
  },
];

/* -------------------------------------------------------------- PSYCHOLOGY */

export interface Topic {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  detail: string;
  term: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'biases',
    title: 'Cognitive Biases',
    kicker: 'Shortcuts',
    summary: 'Mental shortcuts that save effort and cost accuracy.',
    detail:
      'The mind cannot process everything, so it filters. Confirmation bias, anchoring and the availability heuristic are recurring patterns in that filtering. Naming them does not remove them — but it gives you a pause in which to ask: what would change my mind?',
    term: 'Confirmation bias',
  },
  {
    id: 'attachment',
    title: 'Attachment',
    kicker: 'Closeness',
    summary: 'The templates for closeness we learn in early relationships.',
    detail:
      'Work by John Bowlby and Mary Ainsworth showed how early caregiving shapes expectations about safety and support. Attachment styles describe tendencies rather than destiny; relationships and reflection can shift them over time.',
    term: 'Secure base',
  },
  {
    id: 'regulation',
    title: 'Emotional Regulation',
    kicker: 'Shaping feeling',
    summary: 'Not suppressing feelings, but shaping how they unfold.',
    detail:
      'James Gross’s process model separates strategies by when they act. Reframing a situation early tends to work better over time than suppressing a feeling once it has surged. Simply naming an emotion can also lower its intensity.',
    term: 'Reappraisal',
  },
  {
    id: 'awareness',
    title: 'Self-Awareness',
    kicker: 'Seeing clearly',
    summary: 'Seeing yourself as you are — and as others experience you.',
    detail:
      'Self-awareness has an inner side (knowing your values, patterns and reactions) and an outer side (knowing how you land). Some research suggests that asking “what is happening?” is more useful than asking “why am I like this?”, which can slide into rumination.',
    term: 'Metacognition',
  },
  {
    id: 'personality',
    title: 'Personality',
    kicker: 'Patterns',
    summary: 'Stable patterns that are more flexible than they look.',
    detail:
      'The Big Five — openness, conscientiousness, extraversion, agreeableness and emotional stability — is the most widely supported trait model. Traits are relatively stable, yet shift gradually across adulthood, and they describe tendencies, not boxes.',
    term: 'Big Five',
  },
  {
    id: 'memory',
    title: 'Memory',
    kicker: 'Reconstruction',
    summary: 'Not a recording, but a reconstruction.',
    detail:
      'Each act of recall rebuilds a memory from fragments, and may subtly rewrite it before it is stored again. Vividness and confidence are poor guides to accuracy — which is why two honest people can remember the same evening differently.',
    term: 'Reconsolidation',
  },
  {
    id: 'motivation',
    title: 'Motivation',
    kicker: 'Why we move',
    summary: 'The gap between what you want and what you do.',
    detail:
      'Self-determination theory points to three needs that sustain motivation: autonomy, competence and relatedness. Pressure can produce action, but meaning tends to produce persistence.',
    term: 'Self-determination',
  },
  {
    id: 'behavior',
    title: 'Human Behavior',
    kicker: 'Context',
    summary: 'Context writes more of the script than we admit.',
    detail:
      'We tend to explain other people’s actions by their character and our own by our circumstances — the fundamental attribution error. Environments, norms and habits shape behavior more than intention alone does.',
    term: 'Situational influence',
  },
];

/* ------------------------------------------------------------ CONSCIOUSNESS */

export interface Stage {
  at: number;
  kicker: string;
  title: string;
  body: string;
}

export const AWARENESS_STAGES: Stage[] = [
  {
    at: 0,
    kicker: '01 — The surface',
    title: 'This is what you notice.',
    body: 'A narrow beam of attention: the sentence you are reading, a sound, a worry. It feels like the whole of the mind.',
  },
  {
    at: 0.34,
    kicker: '02 — Beneath it',
    title: 'And this is what runs without you.',
    body: 'Perception, language, habit, balance, memory consolidation and emotional appraisal all operate before — and often without — awareness.',
  },
  {
    at: 0.68,
    kicker: '03 — The whole',
    title: 'Most of your mind is working out of sight.',
    body: 'Neuroscientists disagree on exact proportions, and the popular “95%” figure is a simplification. The consistent finding is the direction: far more happens outside awareness than within it.',
  },
];

/* ----------------------------------------------------------------- SPIRIT */

export const PRESENCE_WORDS = [
  { word: 'Presence', line: 'Noticing this moment without editing it.' },
  { word: 'Meaning', line: 'What makes effort feel worth giving.' },
  { word: 'Connection', line: 'The sense of belonging to something beyond yourself.' },
  { word: 'Stillness', line: 'Attention settling, rather than being pushed.' },
  { word: 'Reflection', line: 'Turning experience into understanding.' },
  { word: 'Self-discovery', line: 'Learning what is yours, and what was handed to you.' },
];

/* --------------------------------------------------------------- ARTICLES */

export type ArticleCategory =
  | 'Psychology'
  | 'Emotions'
  | 'Relationships'
  | 'Self-awareness'
  | 'Consciousness'
  | 'Human behavior';

export interface Article {
  slug: string;
  category: ArticleCategory;
  title: string;
  dek: string;
  minutes: number;
  tint: string;
  body: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'a-good-story',
    category: 'Psychology',
    title: 'Why your mind prefers a good story to the truth',
    dek: 'Confirmation bias is not a flaw in thinking so much as a feature of how thinking saves energy.',
    minutes: 7,
    tint: '#6f5cff',
    body: [
      'Imagine you have just formed an opinion about a colleague. Over the next week, which of their actions will you notice? Almost certainly the ones that fit. The meeting they ran late to becomes evidence; the three they ran well fade quietly into the background.',
      'This is confirmation bias: the tendency to search for, interpret and remember information in ways that support what we already believe. It is among the best-documented patterns in psychology, and it appears in scientists, jurors and doctors as readily as anyone else.',
      'Why would a mind work this way? One answer is efficiency. Evaluating every claim from scratch is expensive. A belief works like a filter — it lets the mind skip the questions it has already answered. The cost is that the filter is blind to its own edges.',
      'Knowing the name of the bias does not switch it off. What helps is structure: deliberately looking for the strongest version of the opposing view, writing down what evidence would change your mind before you look at the data, and asking someone who disagrees to describe your position back to you.',
      'The aim is not to become a neutral machine. It is to make your story-making visible, so that you hold your conclusions a little more loosely and a little more honestly.',
    ],
  },
  {
    slug: 'name-it',
    category: 'Emotions',
    title: 'Name it to tame it: the case for emotional granularity',
    dek: 'People who can tell one unpleasant feeling from another often handle all of them better.',
    minutes: 6,
    tint: '#b46bff',
    body: [
      '“I feel bad” is a surprisingly low-resolution description. Behind it might be disappointment, resentment, loneliness, or fatigue — each of which suggests a different response.',
      'Researchers use the term emotional granularity for the ability to distinguish between emotional states with precision. Lisa Feldman Barrett and colleagues have found that people with higher granularity tend to cope more flexibly with stress, and are less likely to reach for blunt strategies when they feel bad.',
      'A related line of research on affect labeling suggests that putting a feeling into words can reduce its intensity, and brain-imaging studies have linked this to changes in activity in regions involved in emotional reactivity. The effect is modest, not magical, but it is reliable enough to be useful.',
      'A practical habit: when a strong feeling arrives, try to find three words for it before you act. Not “stressed”, but “stretched, behind, and worried about letting someone down”. The finer the description, the more clearly the next step tends to show itself.',
      'Vocabulary is not the point. Attention is. Naming is a way of turning toward a feeling instead of being carried by it.',
    ],
  },
  {
    slug: 'architecture-of-attachment',
    category: 'Relationships',
    title: 'The quiet architecture of attachment',
    dek: 'How early relationships leave a blueprint for closeness — and why it can be redrawn.',
    minutes: 8,
    tint: '#5f8dff',
    body: [
      'In the mid-twentieth century, John Bowlby proposed that infants are born with a need to stay close to caregivers, and that the quality of that care teaches the child what to expect from closeness. Mary Ainsworth’s later observations of infants separated briefly from their mothers gave the theory its first empirical shape.',
      'In adulthood, researchers describe tendencies rather than types: some people feel comfortable depending on others and being depended on; some worry about being left; some keep intimacy at arm’s length to feel safe. Most people sit somewhere between them, and shift depending on the relationship.',
      'The important finding for adults is that these patterns are not fixed. Consistent, responsive relationships — with partners, friends, therapists — can move people toward greater security, sometimes called “earned security”. Insight helps, but experience does most of the work.',
      'A useful question in close relationships is not “what is wrong with them?” or “what is wrong with me?” but “what does this situation feel like it is asking of me — and where have I learned to answer that way?”',
      'Understanding your pattern is not a verdict. It is a map of where you learned to protect yourself, and therefore of where there is room to try something different.',
    ],
  },
  {
    slug: 'ask-what',
    category: 'Self-awareness',
    title: 'Ask “what”, not “why”',
    dek: 'A small change of question can turn self-examination from rumination into insight.',
    minutes: 5,
    tint: '#8d7bff',
    body: [
      'Many of us assume that self-awareness means asking “why”: why did I react like that, why do I always do this? It feels like depth. Yet the research of organizational psychologist Tasha Eurich and others suggests it often leads in circles.',
      'The trouble is that we are not good at reading our own motives. Asking “why” invites a plausible story, and the first plausible story is rarely the most accurate. Worse, it can slide into rumination — a loop of self-criticism that feels like thinking.',
      '“What” questions behave differently. What was happening just before I felt that? What am I feeling in my body? What would I like to be true by the end of this week? They point toward observable things and toward action.',
      'This is not a rule against reflection. Sometimes “why” is the right question, particularly with someone you trust or a good therapist. But when you notice yourself circling, try switching the word and see what changes.',
      'Self-awareness is less about arriving at a verdict on yourself than about getting better at noticing what is actually going on, while it is going on.',
    ],
  },
  {
    slug: 'while-you-arent-looking',
    category: 'Consciousness',
    title: 'What your brain does while you are not paying attention',
    dek: 'Awareness is the visible tip of a great deal of quiet computation.',
    minutes: 9,
    tint: '#6a8cff',
    body: [
      'Read this sentence and notice what you did not have to do: decode the shapes of the letters, retrieve the meaning of the words, hold the beginning of the sentence while you reached the end. All of that happened without instruction.',
      'Much of what the brain does — regulating breathing and heartbeat, stabilizing your balance, predicting the next syllable of someone’s speech, tagging a face as familiar — happens outside awareness. Experiments on priming, blindsight and subliminal perception suggest that some information influences behavior even when we cannot report having seen it.',
      'Estimates of how much of mental life is unconscious vary and are sometimes overstated. The commonly quoted figure of 95% is a rhetorical simplification rather than a measurement. The robust conclusion is qualitative: conscious experience is a small, selective part of a much larger process.',
      'Why would a brain keep us in the dark about its own workings? Plausibly because awareness is expensive and limited. Reserving it for novelty, conflict and decisions lets everything else run on well-practiced routines.',
      'There is an invitation in that fact. If so much of the mind is out of view, then paying attention — to a feeling, a habit, a pattern — is not a trivial act. It is how the invisible becomes something you can work with.',
    ],
  },
  {
    slug: 'context-is-the-author',
    category: 'Human behavior',
    title: 'Context is the quiet author of your behavior',
    dek: 'We explain others by their character and ourselves by our circumstances. Both are partly wrong.',
    minutes: 6,
    tint: '#9b86ff',
    body: [
      'When a stranger cuts you off in traffic, you probably think they are reckless. When you do the same, you were late, distracted, or the other driver was in your blind spot. Social psychologists call this asymmetry the fundamental attribution error.',
      'It is a useful reminder that behavior is a product of both the person and the situation — and that we systematically under-count the situation when we look at other people. Lighting, noise, fatigue, norms and what is easy to do all shape what people do.',
      'This has practical consequences. If you want to change a behavior, redesigning the environment is often more effective than demanding more willpower: put the book where the phone used to be, make the desired action the default, remove a step from the thing you want to do.',
      'It also has an ethical edge. Extending to others the same context you extend to yourself is a small act of accuracy as much as kindness.',
      'None of this removes responsibility. It simply puts it in a more realistic place — in how we shape the conditions we live in, as well as the choices we make inside them.',
    ],
  },
];

/* ----------------------------------------------------------------- NAV */

export const NAV_ITEMS = [
  { label: 'Explore', href: '#intro' },
  { label: 'Emotions', href: '#emotions' },
  { label: 'Psychology', href: '#psychology' },
  { label: 'Consciousness', href: '#consciousness' },
  { label: 'Articles', href: '#articles' },
  { label: 'About', href: '#about' },
] as const;
