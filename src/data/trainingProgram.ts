export type TrainingForm = 'Running' | 'Swimming' | 'Ski erg' | 'Strength';

export interface WorkoutBlock {
  title: string;
  items?: string[];
}

export interface WorkoutOption {
  id: string;
  name: string;
  purpose: string;
  plan: string;
  blocks?: WorkoutBlock[];
  note?: string;
  volume: string;
  // Training hours used by the volume chart (running converted from km at 5:00 min/km,
  // using the midpoint of the volume range). Kept as static data since the free-text
  // volume ranges (e.g. "10-14 km", "~90-95 min") aren't reliably parseable.
  hours: number;
}

export interface TrainingSlot {
  id: string;
  day: string;
  form: TrainingForm;
  optional: boolean;
  defaultOption: string;
  options: WorkoutOption[];
}

const strengthOptions: WorkoutOption[] = [
  {
    id: 'a',
    name: 'A: Running rehab/prehab',
    purpose: 'Rehab/prehab',
    plan: 'Build calf, hip and single-leg strength to keep you injury-free.',
    blocks: [
      { title: 'Warm-up (5 min): easy jog or bike, bodyweight squats, leg swings.' },
      {
        title: 'Block 1, 3 rounds (~9 min), run as a circuit with 30-45 s rest between rounds:',
        items: [
          'Single-leg calf raise on box, heavy and slow: 10-15',
          'Seated calf raise, heavy and slow: 10-15',
          'Explosive calf raises: fast until the burn builds',
        ],
      },
      {
        title: 'Block 2, 3 rounds (~14 min), 60-75 s rest between rounds:',
        items: [
          'Bulgarian split squat with kettlebell: 8-10 per leg',
          'Single-leg Romanian deadlift with kettlebell: 8-10 per leg',
          'Single-leg elevated-foot hip thrust: 8-10 per leg',
        ],
      },
    ],
    volume: '~30 min',
    hours: 0.5,
  },
  {
    id: 'b',
    name: 'B: "Incredible Hulk"',
    purpose: 'Full-body strength',
    plan: 'Full-body functional strength and conditioning.',
    blocks: [
      { title: 'Warm-up (5 min): light barbell work, hip hinges, a few practice cleans.' },
      {
        title: 'AMRAP 20 min, 5 reps each:',
        items: ['Deadlift', 'Hang power clean', 'Front squat', 'Push press', 'Back squat'],
      },
    ],
    note: "Use one barbell and a weight you can do every lift with, so you don't stop to reload. Allow about 3 min for setup and cooldown.",
    volume: '~28 min',
    hours: 0.47,
  },
  {
    id: 'c',
    name: 'C: Muscle-up preparation',
    purpose: 'Muscle-up prep',
    plan: 'Build the explosive pull, transition and dip strength for one muscle-up.',
    blocks: [
      {
        title:
          'Warm-up (5 min): scapular pull-ups ×10, shoulder dislocates ×10, dead hang 2×20 s, a few easy pull-ups and dips.',
      },
      {
        title: 'Block 1, 4 sets (~9 min), rest 90 s:',
        items: ['High pull-ups, explosive, bar to lower chest: 3-5'],
      },
      {
        title: 'Block 2, 3 rounds (~12 min), rest 60-90 s between rounds:',
        items: [
          "Straight-bar dips (parallel dips if you can't do 5-8 yet): 6-8",
          'Low-bar transition drill: 4-6',
          'Weighted pull-ups, start at 5-10 kg: 4-6',
        ],
      },
      {
        title: 'Block 3, 2 rounds (~5 min), minimal rest:',
        items: ['False-grip hang: 20-30 s', 'Chest-to-bar rows: 8-10', 'Hanging leg raises: 10-12'],
      },
    ],
    note: 'First session: add about 3-5 min to test your max parallel dips before Block 2, which brings it to the top of your window. If you need more time, cut Block 3 to one round.',
    volume: '~33 min',
    hours: 0.55,
  },
];

const easyFillerRun: WorkoutOption = {
  id: 'easy',
  name: 'Easy-paced run',
  purpose: 'Distance',
  plan: "Easy-paced run — added as needed to reach the week's volume target",
  volume: '0-8 km',
  hours: 0,
};

// One repeating base week. The structure (day, form, purpose) stays fixed; for each
// session you pick the workout that fits from its options.
export const trainingSlots: TrainingSlot[] = [
  {
    id: 'mon-run',
    day: 'Mon',
    form: 'Running',
    optional: false,
    defaultOption: '6x6',
    options: [
      { id: '6x6', name: '6x6 min threshold, 60s rest', purpose: 'Threshold', plan: 'Monday intervals with MIK — 6x6 min threshold, 1 min rest', volume: '10-14 km', hours: 1.0 },
      { id: 'waves', name: 'Threshold waves 6x (3+2 min)', purpose: 'Threshold', plan: 'Monday intervals with MIK — Threshold waves: 6x (3 min sub-threshold + 2 min over threshold), no rest', volume: '10-14 km', hours: 1.0 },
      { id: 'zatopek', name: 'Zátopek 15-20x400m, 45s rest', purpose: 'VO2max/speed', plan: 'Monday intervals with MIK — Zátopek session: 15-20x400m, 45s rest', volume: '10-13 km', hours: 0.96 },
      { id: '1000s', name: '6-8x1000m, 90s rest', purpose: 'Threshold', plan: 'Monday intervals with MIK — 6-8x1000m, 90s rest', volume: '11-14 km', hours: 1.04 },
      { id: 'max-tribute', name: 'Max tribute 4-3-2-1-0.5-0.5 km', purpose: 'VO2max/endurance', plan: 'Monday intervals with MIK — Max tribute: 4-3-2-1-0.5-0.5 km, 90s rest', volume: '12-14 km', hours: 1.08 },
    ],
  },
  {
    id: 'tue-ski',
    day: 'Tue',
    form: 'Ski erg',
    optional: false,
    defaultOption: 'tolkes',
    options: [
      { id: 'tolkes', name: 'Tolkes VO2max 7x (2+1 min)', purpose: 'VO2max', plan: 'Tolkes VO2max: 7x (2 min at LT2, resistance 4-7 + 1 min active recovery, resistance 1)', volume: '30-35 min', hours: 0.54 },
      { id: '6x6', name: '6x6 min threshold, 2 min rest', purpose: 'Threshold', plan: '6x6 min, 2 min active rest', volume: '45-50 min', hours: 0.79 },
      { id: 'otillo', name: 'ÖTILLÖ Sprint Göteborg simulation', purpose: 'Race simulation', plan: 'ÖTILLÖ Sprint Göteborg simulation — ski erg for time (matching swim leg times, rounded to the nearest half minute), rest capped at 3 min: 6:00→rest 0:53 | 4:00→0:45 | 2:00→3:00 | 2:00→1:48 | 7:00→1:18 | 2:30→1:10 | 5:00→2:50 | 5:30→3:00 | 6:00→3:00 | 5:00→3:00 | 5:30→3:00 | 5:00→0:56 | 0:30→0:04 | 0:30→0:12 | 7:00→1:27 | 2:00→0:55 | 1:00 (last, straight into cool-down). + 5 min warm-up and 5 min cool-down.', volume: '~90-95 min (67 min ski erg + ~27 min rest)', hours: 1.54 },
      { id: 'pyramid', name: 'Pyramid 1-2-3-4-3-2-1 min', purpose: 'Threshold/VO2max', plan: 'Pyramid: 1-2-3-4-3-2-1 min hard, equal rest', volume: '~40 min', hours: 0.67 },
      { id: '8x3', name: '8x3 min threshold, 90s rest', purpose: 'Threshold', plan: '8x3 min threshold, 90s rest', volume: '~40 min', hours: 0.67 },
    ],
  },
  { id: 'tue-strength', day: 'Tue', form: 'Strength', optional: false, defaultOption: 'a', options: strengthOptions },
  {
    id: 'tue-swim',
    day: 'Tue',
    form: 'Swimming',
    optional: true,
    defaultOption: 'speed',
    options: [
      { id: 'speed', name: '16x50m speed', purpose: 'Speed', plan: '200m warm-up swim, 6x50m technique drills (catch-up, fingertip drag), 20s rest, main set: 16x50m at high pace with 20s rest, 100m cool-down swim', volume: '45 min', hours: 0.75 },
    ],
  },
  {
    id: 'wed-run',
    day: 'Wed',
    form: 'Running',
    optional: false,
    defaultOption: 'easy',
    options: [{ id: 'easy', name: 'Easy-paced run', purpose: 'Distance', plan: 'Easy-paced run', volume: '8-10 km', hours: 0.75 }],
  },
  {
    id: 'wed-swim',
    day: 'Wed',
    form: 'Swimming',
    optional: false,
    defaultOption: 'endurance',
    options: [
      { id: 'endurance', name: '1500m continuous', purpose: 'Endurance', plan: '200m warm-up swim, 6x50m technique drills (catch-up, fingertip drag), 20s rest, main set: 1500m continuous swim at steady pace, 100m cool-down swim', volume: '45 min', hours: 0.75 },
    ],
  },
  {
    id: 'thu-run',
    day: 'Thu',
    form: 'Running',
    optional: false,
    defaultOption: 'mik',
    options: [
      { id: 'mik', name: 'MIK Thursday session', purpose: 'Quality', plan: "Thursday interval session with MIK — chosen from the club's current schedule (session type rotates: intervals, fartlek, progressive distance run)", volume: '10-16 km', hours: 1.08 },
    ],
  },
  {
    id: 'fri-ski',
    day: 'Fri',
    form: 'Ski erg',
    optional: false,
    defaultOption: 'z2',
    options: [{ id: 'z2', name: 'Zone 2, steady pace', purpose: 'Distance/endurance', plan: 'Zone 2, steady pace', volume: '35-45 min', hours: 0.67 }],
  },
  { id: 'fri-strength', day: 'Fri', form: 'Strength', optional: false, defaultOption: 'b', options: strengthOptions },
  { id: 'fri-run', day: 'Fri', form: 'Running', optional: true, defaultOption: 'easy', options: [easyFillerRun] },
  {
    id: 'sat-run',
    day: 'Sat',
    form: 'Running',
    optional: false,
    defaultOption: 'long',
    options: [{ id: 'long', name: 'Long run, 90 min', purpose: 'Distance', plan: 'Long run, 90 min', volume: '~14-17 km', hours: 1.5 }],
  },
  {
    id: 'sun-swim',
    day: 'Sun',
    form: 'Swimming',
    optional: false,
    defaultOption: 'trivast',
    options: [{ id: 'trivast', name: 'TriVäst group session', purpose: 'Technique/volume', plan: 'TriVäst group session', volume: '2 hrs', hours: 2.0 }],
  },
  { id: 'sun-strength', day: 'Sun', form: 'Strength', optional: false, defaultOption: 'c', options: strengthOptions },
  { id: 'sun-run', day: 'Sun', form: 'Running', optional: true, defaultOption: 'easy', options: [easyFillerRun] },
];
