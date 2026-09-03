export type TrainingForm = 'Löpning' | 'Simning' | 'Stakmaskin' | 'Styrka';

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
  { week: 1, day: 'Mån', form: 'Löpning', purpose: 'Tröskel', plan: 'Måndagsintervaller MIK — 6x6 min tröskel, 1 min vila', volume: '10-14 km', optional: false },
  { week: 1, day: 'Tis', form: 'Stakmaskin', purpose: 'VO2max', plan: 'Tolkes VO2max: 7x (2 min LT2, motstånd 4-7 + 1 min aktiv återhämtning, motstånd 1)', volume: '30-35 min', optional: false },
  { week: 1, day: 'Tis', form: 'Styrka', purpose: 'Axel/bål', plan: 'Push-ups 3x12, Militärpress 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 1, day: 'Ons', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans', volume: '8-10 km', optional: false },
  { week: 1, day: 'Ons', form: 'Simning', purpose: 'Teknik', plan: '200m insim, 8x50m teknikdrills (catch-up, fingertip drag), 200m utsim', volume: '25-30 min', optional: false },
  { week: 1, day: 'Tors', form: 'Löpning', purpose: 'Kvalitet', plan: 'Torsdagsintervall med MIK — väljs från klubbens aktuella schema (typ av pass roterar: intervaller, fartlek, progressiv distans)', volume: '10-16 km', optional: false },
  { week: 1, day: 'Fre', form: 'Stakmaskin', purpose: 'Distans/uthållighet', plan: 'Zon 2, jämnt tempo', volume: '35-45 min', optional: false },
  { week: 1, day: 'Fre', form: 'Styrka', purpose: 'Ben/rörlighet', plan: 'Bulg.split 3x12/ben, Sidosteg 3x20/riktn, Enbens mklyft 3x10/ben, Ext.rot 3x15/arm, Enbenst. 2x40sek/ben', volume: '15-20 min', optional: false },
  { week: 1, day: 'Fre', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },
  { week: 1, day: 'Lör', form: 'Löpning', purpose: 'Distans', plan: 'Långpass, 90 min', volume: '~14-17 km', optional: false },
  { week: 1, day: 'Sön', form: 'Simning', purpose: 'Teknik/Volym', plan: 'TriVäst grupp-pass', volume: '2 tim', optional: false },
  { week: 1, day: 'Sön', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },

  { week: 2, day: 'Mån', form: 'Löpning', purpose: 'Tröskel', plan: 'Måndagsintervaller MIK — Tröskelvågor: 6x (3 min sub-tröskel + 2 min över tröskel), utan vila', volume: '10-14 km', optional: false },
  { week: 2, day: 'Tis', form: 'Stakmaskin', purpose: 'Tröskel', plan: '6x6 min, 2 min aktiv vila', volume: '45-50 min', optional: false },
  { week: 2, day: 'Tis', form: 'Styrka', purpose: 'Axel/bål', plan: 'Push-ups 3x12, Militärpress 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 2, day: 'Ons', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans', volume: '8-10 km', optional: false },
  { week: 2, day: 'Ons', form: 'Simning', purpose: 'Fart', plan: '200m insim, 10x50m i högt tempo med 20s vila, 200m utsim', volume: '25-30 min', optional: false },
  { week: 2, day: 'Tors', form: 'Löpning', purpose: 'Kvalitet', plan: 'Torsdagsintervall med MIK — väljs från klubbens aktuella schema (typ av pass roterar: intervaller, fartlek, progressiv distans)', volume: '10-16 km', optional: false },
  { week: 2, day: 'Fre', form: 'Stakmaskin', purpose: 'Distans/uthållighet', plan: 'Zon 2, jämnt tempo', volume: '35-45 min', optional: false },
  { week: 2, day: 'Fre', form: 'Styrka', purpose: 'Ben/rörlighet', plan: 'Bulg.split 3x12/ben, Sidosteg 3x20/riktn, Enbens mklyft 3x10/ben, Ext.rot 3x15/arm, Enbenst. 2x40sek/ben', volume: '15-20 min', optional: false },
  { week: 2, day: 'Fre', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },
  { week: 2, day: 'Lör', form: 'Löpning', purpose: 'Distans', plan: 'Långpass, 90 min', volume: '~14-17 km', optional: false },
  { week: 2, day: 'Sön', form: 'Simning', purpose: 'Teknik/Volym', plan: 'TriVäst grupp-pass', volume: '2 tim', optional: false },
  { week: 2, day: 'Sön', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },

  { week: 3, day: 'Mån', form: 'Löpning', purpose: 'VO2max/Fart', plan: 'Måndagsintervaller MIK — Zatopekare: 15-20x400m, 45s vila', volume: '10-13 km', optional: false },
  { week: 3, day: 'Tis', form: 'Stakmaskin', purpose: 'Racesimulering', plan: 'ÖTILLÖ Sprint Göteborg-simulering — stak i tid (motsvarar simtid, avrundat till halv minut), vila capad vid 3 min: 6:00→vila 0:53 | 4:00→0:45 | 2:00→3:00 | 2:00→1:48 | 7:00→1:18 | 2:30→1:10 | 5:00→2:50 | 5:30→3:00 | 6:00→3:00 | 5:00→3:00 | 5:30→3:00 | 5:00→0:56 | 0:30→0:04 | 0:30→0:12 | 7:00→1:27 | 2:00→0:55 | 1:00 (sista, direkt till nedvarvning). + 5 min uppvärmning och 5 min nedvarvning.', volume: '~90-95 min (67 min stak + ~27 min vila)', optional: false },
  { week: 3, day: 'Tis', form: 'Styrka', purpose: 'Axel/bål', plan: 'Push-ups 3x12, Militärpress 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 3, day: 'Ons', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans', volume: '8-10 km', optional: false },
  { week: 3, day: 'Ons', form: 'Simning', purpose: 'Uthållighet', plan: 'Sammanhängande simning i jämnt tempo, 1500-2000m', volume: '30-40 min', optional: false },
  { week: 3, day: 'Tors', form: 'Löpning', purpose: 'Kvalitet', plan: 'Torsdagsintervall med MIK — väljs från klubbens aktuella schema (typ av pass roterar: intervaller, fartlek, progressiv distans)', volume: '10-16 km', optional: false },
  { week: 3, day: 'Fre', form: 'Stakmaskin', purpose: 'Distans/uthållighet', plan: 'Zon 2, jämnt tempo', volume: '35-45 min', optional: false },
  { week: 3, day: 'Fre', form: 'Styrka', purpose: 'Ben/rörlighet', plan: 'Bulg.split 3x12/ben, Sidosteg 3x20/riktn, Enbens mklyft 3x10/ben, Ext.rot 3x15/arm, Enbenst. 2x40sek/ben', volume: '15-20 min', optional: false },
  { week: 3, day: 'Fre', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },
  { week: 3, day: 'Lör', form: 'Löpning', purpose: 'Distans', plan: 'Långpass, 90 min', volume: '~14-17 km', optional: false },
  { week: 3, day: 'Sön', form: 'Simning', purpose: 'Teknik/Volym', plan: 'TriVäst grupp-pass', volume: '2 tim', optional: false },
  { week: 3, day: 'Sön', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },

  { week: 4, day: 'Mån', form: 'Löpning', purpose: 'Tröskel', plan: 'Måndagsintervaller MIK — 6-8x1000m, 90s vila', volume: '11-14 km', optional: false },
  { week: 4, day: 'Tis', form: 'Stakmaskin', purpose: 'Tröskel/VO2max', plan: 'Pyramid: 1-2-3-4-3-2-1 min hårt, lika lång vila', volume: '~40 min', optional: false },
  { week: 4, day: 'Tis', form: 'Styrka', purpose: 'Axel/bål', plan: 'Push-ups 3x12, Militärpress 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 4, day: 'Ons', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans', volume: '8-10 km', optional: false },
  { week: 4, day: 'Ons', form: 'Simning', purpose: 'Teknik', plan: '200m insim, 6x100m stigande fart, teknikfokus på draget, 200m utsim', volume: '25-30 min', optional: false },
  { week: 4, day: 'Tors', form: 'Löpning', purpose: 'Kvalitet', plan: 'Torsdagsintervall med MIK — väljs från klubbens aktuella schema (typ av pass roterar: intervaller, fartlek, progressiv distans)', volume: '10-16 km', optional: false },
  { week: 4, day: 'Fre', form: 'Stakmaskin', purpose: 'Distans/uthållighet', plan: 'Zon 2, jämnt tempo', volume: '35-45 min', optional: false },
  { week: 4, day: 'Fre', form: 'Styrka', purpose: 'Ben/rörlighet', plan: 'Bulg.split 3x12/ben, Sidosteg 3x20/riktn, Enbens mklyft 3x10/ben, Ext.rot 3x15/arm, Enbenst. 2x40sek/ben', volume: '15-20 min', optional: false },
  { week: 4, day: 'Fre', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },
  { week: 4, day: 'Lör', form: 'Löpning', purpose: 'Distans', plan: 'Långpass, 90 min', volume: '~14-17 km', optional: false },
  { week: 4, day: 'Sön', form: 'Simning', purpose: 'Teknik/Volym', plan: 'TriVäst grupp-pass', volume: '2 tim', optional: false },
  { week: 4, day: 'Sön', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },

  { week: 5, day: 'Mån', form: 'Löpning', purpose: 'VO2max/Uthållighet', plan: 'Måndagsintervaller MIK — Max tribute: 4-3-2-1-0,5-0,5 km, 90s vila', volume: '12-14 km', optional: false },
  { week: 5, day: 'Tis', form: 'Stakmaskin', purpose: 'Tröskel', plan: '8x3 min tröskel, 90 sek vila', volume: '~40 min', optional: false },
  { week: 5, day: 'Tis', form: 'Styrka', purpose: 'Axel/bål', plan: 'Push-ups 3x12, Militärpress 3x10, Face pulls 3x15, Russian twists 3x20', volume: '15-20 min', optional: false },
  { week: 5, day: 'Ons', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans', volume: '8-10 km', optional: false },
  { week: 5, day: 'Ons', form: 'Simning', purpose: 'Uthållighet', plan: 'Sammanhängande simning i jämnt tempo, 1800-2200m', volume: '35-40 min', optional: false },
  { week: 5, day: 'Tors', form: 'Löpning', purpose: 'Kvalitet', plan: 'Torsdagsintervall med MIK — väljs från klubbens aktuella schema (typ av pass roterar: intervaller, fartlek, progressiv distans)', volume: '10-16 km', optional: false },
  { week: 5, day: 'Fre', form: 'Stakmaskin', purpose: 'Distans/uthållighet', plan: 'Zon 2, jämnt tempo', volume: '35-45 min', optional: false },
  { week: 5, day: 'Fre', form: 'Styrka', purpose: 'Ben/rörlighet', plan: 'Bulg.split 3x12/ben, Sidosteg 3x20/riktn, Enbens mklyft 3x10/ben, Ext.rot 3x15/arm, Enbenst. 2x40sek/ben', volume: '15-20 min', optional: false },
  { week: 5, day: 'Fre', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },
  { week: 5, day: 'Lör', form: 'Löpning', purpose: 'Distans', plan: 'Långpass, 90 min', volume: '~14-17 km', optional: false },
  { week: 5, day: 'Sön', form: 'Simning', purpose: 'Teknik/Volym', plan: 'TriVäst grupp-pass', volume: '2 tim', optional: false },
  { week: 5, day: 'Sön', form: 'Löpning', purpose: 'Distans', plan: 'Lugn distans — läggs till vid behov för att nå veckans volymmål', volume: '0-8 km', optional: true },
];

// Pre-calculated training hours per week and discipline (running converted from km
// at a 5:00 min/km pace). Kept as static data rather than derived client-side, since
// the free-text volume ranges above (e.g. "10-14 km", "~90-95 min") aren't reliably
// parseable back into a single number.
export const weeklyHours: Record<string, Record<TrainingForm, number>> = {
  '1': { Löpning: 4.12, Simning: 2.46, Stakmaskin: 1.21, Styrka: 0.58 },
  '2': { Löpning: 4.12, Simning: 2.46, Stakmaskin: 1.46, Styrka: 0.58 },
  '3': { Löpning: 4.08, Simning: 2.58, Stakmaskin: 2.21, Styrka: 0.58 },
  '4': { Löpning: 4.17, Simning: 2.46, Stakmaskin: 1.33, Styrka: 0.58 },
  '5': { Löpning: 4.21, Simning: 2.62, Stakmaskin: 1.33, Styrka: 0.58 },
};
