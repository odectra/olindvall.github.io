export type TrainingForm = 'Running' | 'Swimming' | 'Ski erg' | 'Strength';

export interface TrainingSession {
  week: number;
  day: string;
  form: TrainingForm;
  purpose: string;
  plan: string;
  volume: string;
  optional: boolean;
}

// A rolling 5-week base training block — repeats from week 1 after week 5.
export const trainingSessions: TrainingSession[] = [
  { week: 1, day: 'Mon', form: 'Running', purpose: 'Threshold', plan: 'Monday intervals with MIK — 6x6 min threshold, 1 min rest', volume: '10-14 km', optional: false },
  { week: 1, day: 'Tue', form: 'Ski erg', purpose: 'VO2max', plan: 'Tolkes VO2max: 7x (2 min at LT2, resistance 4-7 + 1 min active recovery, resistance 1)', volume: '30-35 min', optional: false },
  { week: 1, day: 'Tue', form: 'Strength', purpose: 'Shoulder/core', plan: 'Push-ups 3x12, Military press 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 1, day: 'Wed', form: 'Running', purpose: 'Distance', plan: 'Easy-paced run', volume: '8-10 km', optional: false },
  { week: 1, day: 'Wed', form: 'Swimming', purpose: 'Technique', plan: '200m warm-up swim, 8x50m technique drills (catch-up, fingertip drag), 200m cool-down swim', volume: '25-30 min', optional: false },
  { week: 1, day: 'Thu', form: 'Running', purpose: 'Quality', plan: "Thursday interval session with MIK — chosen from the club's current schedule (session type rotates: intervals, fartlek, progressive distance run)", volume: '10-16 km', optional: false },
  { week: 1, day: 'Fri', form: 'Ski erg', purpose: 'Distance/endurance', plan: 'Zone 2, steady pace', volume: '35-45 min', optional: false },
  { week: 1, day: 'Fri', form: 'Strength', purpose: 'Legs/mobility', plan: 'Bulgarian split squat 3x12/leg, Lateral steps 3x20/direction, Single-leg deadlift 3x10/leg, Ext. rotation 3x15/arm, Single-leg balance 2x40sec/leg', volume: '15-20 min', optional: false },
  { week: 1, day: 'Fri', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },
  { week: 1, day: 'Sat', form: 'Running', purpose: 'Distance', plan: 'Long run, 90 min', volume: '~14-17 km', optional: false },
  { week: 1, day: 'Sun', form: 'Swimming', purpose: 'Technique/volume', plan: 'TriVäst group session', volume: '2 hrs', optional: false },
  { week: 1, day: 'Sun', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },

  { week: 2, day: 'Mon', form: 'Running', purpose: 'Threshold', plan: 'Monday intervals with MIK — Threshold waves: 6x (3 min sub-threshold + 2 min over threshold), no rest', volume: '10-14 km', optional: false },
  { week: 2, day: 'Tue', form: 'Ski erg', purpose: 'Threshold', plan: '6x6 min, 2 min active rest', volume: '45-50 min', optional: false },
  { week: 2, day: 'Tue', form: 'Strength', purpose: 'Shoulder/core', plan: 'Push-ups 3x12, Military press 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 2, day: 'Wed', form: 'Running', purpose: 'Distance', plan: 'Easy-paced run', volume: '8-10 km', optional: false },
  { week: 2, day: 'Wed', form: 'Swimming', purpose: 'Speed', plan: '200m warm-up swim, 10x50m at high pace with 20s rest, 200m cool-down swim', volume: '25-30 min', optional: false },
  { week: 2, day: 'Thu', form: 'Running', purpose: 'Quality', plan: "Thursday interval session with MIK — chosen from the club's current schedule (session type rotates: intervals, fartlek, progressive distance run)", volume: '10-16 km', optional: false },
  { week: 2, day: 'Fri', form: 'Ski erg', purpose: 'Distance/endurance', plan: 'Zone 2, steady pace', volume: '35-45 min', optional: false },
  { week: 2, day: 'Fri', form: 'Strength', purpose: 'Legs/mobility', plan: 'Bulgarian split squat 3x12/leg, Lateral steps 3x20/direction, Single-leg deadlift 3x10/leg, Ext. rotation 3x15/arm, Single-leg balance 2x40sec/leg', volume: '15-20 min', optional: false },
  { week: 2, day: 'Fri', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },
  { week: 2, day: 'Sat', form: 'Running', purpose: 'Distance', plan: 'Long run, 90 min', volume: '~14-17 km', optional: false },
  { week: 2, day: 'Sun', form: 'Swimming', purpose: 'Technique/volume', plan: 'TriVäst group session', volume: '2 hrs', optional: false },
  { week: 2, day: 'Sun', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },

  { week: 3, day: 'Mon', form: 'Running', purpose: 'VO2max/speed', plan: 'Monday intervals with MIK — Zátopek session: 15-20x400m, 45s rest', volume: '10-13 km', optional: false },
  { week: 3, day: 'Tue', form: 'Ski erg', purpose: 'Race simulation', plan: 'ÖTILLÖ Sprint Göteborg simulation — ski erg for time (matching swim leg times, rounded to the nearest half minute), rest capped at 3 min: 6:00→rest 0:53 | 4:00→0:45 | 2:00→3:00 | 2:00→1:48 | 7:00→1:18 | 2:30→1:10 | 5:00→2:50 | 5:30→3:00 | 6:00→3:00 | 5:00→3:00 | 5:30→3:00 | 5:00→0:56 | 0:30→0:04 | 0:30→0:12 | 7:00→1:27 | 2:00→0:55 | 1:00 (last, straight into cool-down). + 5 min warm-up and 5 min cool-down.', volume: '~90-95 min (67 min ski erg + ~27 min rest)', optional: false },
  { week: 3, day: 'Tue', form: 'Strength', purpose: 'Shoulder/core', plan: 'Push-ups 3x12, Military press 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 3, day: 'Wed', form: 'Running', purpose: 'Distance', plan: 'Easy-paced run', volume: '8-10 km', optional: false },
  { week: 3, day: 'Wed', form: 'Swimming', purpose: 'Endurance', plan: 'Continuous swim at a steady pace, 1500-2000m', volume: '30-40 min', optional: false },
  { week: 3, day: 'Thu', form: 'Running', purpose: 'Quality', plan: "Thursday interval session with MIK — chosen from the club's current schedule (session type rotates: intervals, fartlek, progressive distance run)", volume: '10-16 km', optional: false },
  { week: 3, day: 'Fri', form: 'Ski erg', purpose: 'Distance/endurance', plan: 'Zone 2, steady pace', volume: '35-45 min', optional: false },
  { week: 3, day: 'Fri', form: 'Strength', purpose: 'Legs/mobility', plan: 'Bulgarian split squat 3x12/leg, Lateral steps 3x20/direction, Single-leg deadlift 3x10/leg, Ext. rotation 3x15/arm, Single-leg balance 2x40sec/leg', volume: '15-20 min', optional: false },
  { week: 3, day: 'Fri', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },
  { week: 3, day: 'Sat', form: 'Running', purpose: 'Distance', plan: 'Long run, 90 min', volume: '~14-17 km', optional: false },
  { week: 3, day: 'Sun', form: 'Swimming', purpose: 'Technique/volume', plan: 'TriVäst group session', volume: '2 hrs', optional: false },
  { week: 3, day: 'Sun', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },

  { week: 4, day: 'Mon', form: 'Running', purpose: 'Threshold', plan: 'Monday intervals with MIK — 6-8x1000m, 90s rest', volume: '11-14 km', optional: false },
  { week: 4, day: 'Tue', form: 'Ski erg', purpose: 'Threshold/VO2max', plan: 'Pyramid: 1-2-3-4-3-2-1 min hard, equal rest', volume: '~40 min', optional: false },
  { week: 4, day: 'Tue', form: 'Strength', purpose: 'Shoulder/core', plan: 'Push-ups 3x12, Military press 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 4, day: 'Wed', form: 'Running', purpose: 'Distance', plan: 'Easy-paced run', volume: '8-10 km', optional: false },
  { week: 4, day: 'Wed', form: 'Swimming', purpose: 'Technique', plan: '200m warm-up swim, 6x100m building pace, technique focus on the pull, 200m cool-down swim', volume: '25-30 min', optional: false },
  { week: 4, day: 'Thu', form: 'Running', purpose: 'Quality', plan: "Thursday interval session with MIK — chosen from the club's current schedule (session type rotates: intervals, fartlek, progressive distance run)", volume: '10-16 km', optional: false },
  { week: 4, day: 'Fri', form: 'Ski erg', purpose: 'Distance/endurance', plan: 'Zone 2, steady pace', volume: '35-45 min', optional: false },
  { week: 4, day: 'Fri', form: 'Strength', purpose: 'Legs/mobility', plan: 'Bulgarian split squat 3x12/leg, Lateral steps 3x20/direction, Single-leg deadlift 3x10/leg, Ext. rotation 3x15/arm, Single-leg balance 2x40sec/leg', volume: '15-20 min', optional: false },
  { week: 4, day: 'Fri', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },
  { week: 4, day: 'Sat', form: 'Running', purpose: 'Distance', plan: 'Long run, 90 min', volume: '~14-17 km', optional: false },
  { week: 4, day: 'Sun', form: 'Swimming', purpose: 'Technique/volume', plan: 'TriVäst group session', volume: '2 hrs', optional: false },
  { week: 4, day: 'Sun', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },

  { week: 5, day: 'Mon', form: 'Running', purpose: 'VO2max/endurance', plan: 'Monday intervals with MIK — Max tribute: 4-3-2-1-0.5-0.5 km, 90s rest', volume: '12-14 km', optional: false },
  { week: 5, day: 'Tue', form: 'Ski erg', purpose: 'Threshold', plan: '8x3 min threshold, 90s rest', volume: '~40 min', optional: false },
  { week: 5, day: 'Tue', form: 'Strength', purpose: 'Shoulder/core', plan: 'Push-ups 3x12, Military press 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 5, day: 'Wed', form: 'Running', purpose: 'Distance', plan: 'Easy-paced run', volume: '8-10 km', optional: false },
  { week: 5, day: 'Wed', form: 'Swimming', purpose: 'Endurance', plan: 'Continuous swim at a steady pace, 1800-2200m', volume: '35-40 min', optional: false },
  { week: 5, day: 'Thu', form: 'Running', purpose: 'Quality', plan: "Thursday interval session with MIK — chosen from the club's current schedule (session type rotates: intervals, fartlek, progressive distance run)", volume: '10-16 km', optional: false },
  { week: 5, day: 'Fri', form: 'Ski erg', purpose: 'Distance/endurance', plan: 'Zone 2, steady pace', volume: '35-45 min', optional: false },
  { week: 5, day: 'Fri', form: 'Strength', purpose: 'Legs/mobility', plan: 'Bulgarian split squat 3x12/leg, Lateral steps 3x20/direction, Single-leg deadlift 3x10/leg, Ext. rotation 3x15/arm, Single-leg balance 2x40sec/leg', volume: '15-20 min', optional: false },
  { week: 5, day: 'Fri', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },
  { week: 5, day: 'Sat', form: 'Running', purpose: 'Distance', plan: 'Long run, 90 min', volume: '~14-17 km', optional: false },
  { week: 5, day: 'Sun', form: 'Swimming', purpose: 'Technique/volume', plan: 'TriVäst group session', volume: '2 hrs', optional: false },
  { week: 5, day: 'Sun', form: 'Running', purpose: 'Distance', plan: "Easy-paced run — added as needed to reach the week's volume target", volume: '0-8 km', optional: true },
];

// Pre-calculated training hours per week and discipline (running converted from km
// at a 5:00 min/km pace). Kept as static data rather than derived client-side, since
// the free-text volume ranges above (e.g. "10-14 km", "~90-95 min") aren't reliably
// parseable back into a single number.
export const weeklyHours: Record<string, Record<TrainingForm, number>> = {
  '1': { Running: 4.12, Swimming: 2.46, 'Ski erg': 1.21, Strength: 0.58 },
  '2': { Running: 4.12, Swimming: 2.46, 'Ski erg': 1.46, Strength: 0.58 },
  '3': { Running: 4.08, Swimming: 2.58, 'Ski erg': 2.21, Strength: 0.58 },
  '4': { Running: 4.17, Swimming: 2.46, 'Ski erg': 1.33, Strength: 0.58 },
  '5': { Running: 4.21, Swimming: 2.62, 'Ski erg': 1.33, Strength: 0.58 },
};
