// Fältdefinitioner för Husköpskalkylens indata. Används både när sidan byggs
// (Astro renderar fälten) och i webbläsaren (id och startvärden).
import { DEFAULTS, type NumKey } from './calc.ts';

export interface Field {
  id: NumKey;
  label: string;
  unit?: string;
  help?: string;
  options?: { value: number; label: string }[];
  range?: { min: number; max: number; step: number };
}

export interface Group {
  id: string;
  title: string;
  intro?: string;
  important: Field[];
  more: Field[];
}

export const GROUPS: Group[] = [
  {
    id: 'kop',
    title: 'Köp',
    intro: 'Bostaden du köper. Pris, boyta, driftkostnad, fastighetsavgift och pantbrev står i annonsen.',
    important: [
      { id: 'price', label: 'Köpesumma', unit: 'kr', help: 'Utgångspris eller ditt bud.', range: { min: 2_000_000, max: 12_000_000, step: 25_000 } },
      { id: 'area', label: 'Boyta', unit: 'm²', help: 'Står i annonsen.' },
    ],
    more: [
      { id: 'lagfart', label: 'Lagfart', unit: '%', help: 'Stämpelskatt på köpesumman. Avgiften läggs till under Regler.' },
      { id: 'pantex', label: 'Befintliga pantbrev i bostaden', unit: 'kr', help: 'Summan av pantbreven. Fråga mäklaren eller se gravationsbeviset.' },
      { id: 'reno', label: 'Renovering före tillträde', unit: 'kr', help: 'Betalas ur sparandet.' },
      { id: 'driftyr', label: 'Drift per år', unit: 'kr', help: 'El, värme, vatten, sophämtning, försäkring. Står ofta i annonsen.' },
      { id: 'evextra', label: 'Extra driftkostnad per år', unit: 'kr', help: 'Till exempel elbilsladdning.' },
      { id: 'fastavg', label: 'Fastighetsavgift per år', unit: 'kr', help: 'Kommunal fastighetsavgift. Står ofta i annonsen.' },
    ],
  },
  {
    id: 'salj',
    title: 'Försäljning av bostaden du äger',
    important: [
      { id: 'sale', label: 'Försäljningspris', unit: 'kr', help: 'Det du räknar med att få.', range: { min: 500_000, max: 12_000_000, step: 25_000 } },
      { id: 'extra', label: 'Insats från sparande/ISK totalt', unit: 'kr', help: 'Fylls i med 10 % av köpesumman när du ändrar den. Du kan skriva över.' },
    ],
    more: [
      { id: 'mv42', label: 'Marknadsvärde idag', unit: 'kr', help: 'Din bedömning av bostaden du säljer.' },
      { id: 'loan', label: 'Nuvarande lån', unit: 'kr', help: 'Löses vid försäljningen.' },
      { id: 'mak', label: 'Mäklararvode', unit: '%', help: 'Av försäljningspriset.' },
      { id: 'buy', label: 'Inköpspris', unit: 'kr', help: 'Det du betalade, för reavinsten.' },
      { id: 'impr', label: 'Förbättringsutgifter', unit: 'kr', help: 'Avdragsgilla förbättringar. Spara kvitton.' },
    ],
  },
  {
    id: 'inkomst',
    title: 'Ränta och inkomst',
    important: [
      { id: 'rate', label: 'Boränta', unit: '%', help: 'Den ränta du räknar med att få.' },
      { id: 'gross1', label: 'Bruttolön per månad, person 1', unit: 'kr' },
      { id: 'gross2', label: 'Bruttolön per månad, person 2', unit: 'kr', help: 'Sätt 0 om ni är en person.' },
    ],
    more: [
      { id: 'stress', label: 'Bankens schablonränta', unit: '%', help: 'Räntan banken prövar din ekonomi mot. Fråga banken.' },
      { id: 'net1', label: 'Nettolön per månad, person 1', unit: 'kr', help: 'Slå upp i din lönespecifikation.' },
      { id: 'net2', label: 'Nettolön per månad, person 2', unit: 'kr', help: 'Slå upp i din lönespecifikation.' },
      { id: 'othercap', label: 'Övriga kapitalinkomster per år', unit: 'kr', help: 'Påverkar bara återbäringen vid förlust.' },
    ],
  },
  {
    id: 'bortfall',
    title: 'Inkomstbortfall (simulering)',
    important: [
      { id: 'lossWho', label: 'Vem drabbas', options: [{ value: 1, label: 'Person 1' }, { value: 2, label: 'Person 2' }, { value: 3, label: 'Båda' }] },
      { id: 'lossType', label: 'Orsak', options: [{ value: 1, label: 'Uppsagd (a-kassa)' }, { value: 2, label: 'Sjukskriven (sjukpenning)' }, { value: 3, label: 'Byter till lägre lön' }] },
      { id: 'lossMonths', label: 'Antal månader', unit: 'mån', help: '1 till 18 månader.' },
    ],
    more: [
      { id: 'cutPct', label: 'Lönen sänks med', unit: '%', help: 'Gäller bara orsaken "Byter till lägre lön".' },
      { id: 'notice', label: 'Uppsägningstid med lön', unit: 'mån', help: 'Se ditt anställningsavtal eller kollektivavtal.' },
      { id: 'ins1', label: 'Inkomstförsäkring, person 1', unit: 'dagar', help: 'Antal ersättningsdagar. Fråga ditt fackförbund. 0 = ingen.' },
      { id: 'ins2', label: 'Inkomstförsäkring, person 2', unit: 'dagar', help: 'Antal ersättningsdagar. 0 = ingen.' },
      { id: 'sjPct1', label: 'Sjuk: total ersättning, person 1', unit: '% av lön', help: 'Med arbetsgivarens tillägg. 0 = enbart sjukpenning.' },
      { id: 'sjMon1', label: 'Så länge, person 1', unit: 'mån', help: 'Hur länge tillägget gäller enligt avtalet.' },
      { id: 'sjPct2', label: 'Sjuk: total ersättning, person 2', unit: '% av lön', help: '0 = enbart sjukpenning.' },
      { id: 'sjMon2', label: 'Så länge, person 2', unit: 'mån' },
      { id: 'kskatt', label: 'Kommunal- och regionskatt', unit: '%', help: 'Står på din lönespecifikation eller hos Skatteverket.' },
      { id: 'expenses', label: 'Övriga utgifter per månad', unit: 'kr', help: 'Mat, barn, bil, försäkringar med mera, utöver boendet.' },
      { id: 'cashbuf', label: 'Gemensamt sparkonto utöver privat ISK', unit: 'kr' },
    ],
  },
  {
    id: 'mc',
    title: 'Framtidsscenario (Monte Carlo)',
    intro: 'Antaganden, inte prognoser. Ändra dem och se hur spannet förändras.',
    important: [
      { id: 'mcHouse', label: 'Villapriser, förväntad ökning', unit: '% per år' },
      { id: 'mcStock', label: 'Börsen, förväntad avkastning', unit: '% per år' },
    ],
    more: [
      { id: 'mcHouseVol', label: 'Villapriser, volatilitet', unit: '% per år', help: 'Hur mycket priset svänger ett vanligt år.' },
      { id: 'mcStockVol', label: 'Börsen, volatilitet', unit: '% per år' },
      { id: 'mcCorr', label: 'Samband bostad och börs', unit: '−1 till 1', help: '0 = inget samband, 1 = rör sig helt lika.' },
      { id: 'mcTax', label: 'ISK-skatt', unit: '% av kapitalet', help: 'Schablonskatten. Kontrollera årets nivå hos Skatteverket.' },
      { id: 'mcSave', label: 'Nytt sparande i ISK per månad', unit: 'kr', help: 'Totalt för hushållet.' },
    ],
  },
  {
    id: 'isk',
    title: 'Sparande i ISK',
    intro: 'Insatsen tas till hälften från vardera person.',
    important: [
      { id: 'isk1', label: 'ISK person 1', unit: 'kr' },
      { id: 'isk2', label: 'ISK person 2', unit: 'kr' },
    ],
    more: [],
  },
];

// Fälten i prisreglagets ruta.
export const PRICE_FIELDS: { legend: string; fields: Field[] }[] = [
  {
    legend: 'Så bedöms affären',
    fields: [
      { id: 'mv', label: 'Min värdering (Bra upp till)', unit: 'kr' },
      { id: 'vhigh', label: 'Medel upp till', unit: 'kr' },
    ],
  },
  {
    legend: 'Din gräns vid budgivning',
    fields: [{ id: 'max', label: 'Max, går inte över', unit: 'kr' }],
  },
];

export const RULE_FIELDS: { legend: string; fields: Field[] }[] = [
  {
    legend: 'Lån',
    fields: [
      { id: 'rTak', label: 'Bolånetak', unit: '% av köpesumman' },
      { id: 'rSkuldkvot', label: 'Skuldkvot, gult över', unit: 'ggr' },
      { id: 'rAmLtvHi', label: 'Högre amortering vid belåning över', unit: '%' },
      { id: 'rAmHi', label: 'Högre amortering', unit: '% per år' },
      { id: 'rAmLtvLo', label: 'Lägre amortering vid belåning över', unit: '%' },
      { id: 'rAmLo', label: 'Lägre amortering', unit: '% per år' },
    ],
  },
  {
    legend: 'Skatt och avgifter',
    fields: [
      { id: 'rDedLo', label: 'Ränteavdrag upp till gränsen', unit: '%' },
      { id: 'rDedCap', label: 'Gräns för ränteavdrag', unit: 'kr per år' },
      { id: 'rDedHi', label: 'Ränteavdrag över gränsen', unit: '%' },
      { id: 'rCapTax', label: 'Skatt på kapitalinkomst', unit: '%' },
      { id: 'rLagFee', label: 'Expeditionsavgift lagfart', unit: 'kr' },
      { id: 'rPantPct', label: 'Stämpelskatt nya pantbrev', unit: '%' },
      { id: 'rPantFee', label: 'Avgift per nytt pantbrev', unit: 'kr' },
      { id: 'rGainTax', label: 'Skatt på reavinst', unit: '% av vinsten' },
      { id: 'rLossShare', label: 'Avdragsgill del av förlust', unit: '%' },
    ],
  },
  {
    legend: 'Tumregler i bedömningen',
    fields: [
      { id: 'rMoveGreen', label: 'Flyttkostnad grönt upp till', unit: '% av marknadsvärdet' },
      { id: 'rMoveYellow', label: 'Flyttkostnad gult upp till', unit: '%' },
      { id: 'rHp', label: 'Handpenning', unit: '% av köpesumman' },
    ],
  },
  {
    legend: 'Inkomstskatt och ersättningar',
    fields: [
      { id: 'rSkikt', label: 'Brytpunkt statlig skatt', unit: 'kr per år' },
      { id: 'rStateTax', label: 'Statlig skatt', unit: '%' },
      { id: 'rGa', label: 'Grundavdrag (förenklat)', unit: 'kr per år' },
      { id: 'rAkTak', label: 'Tak i a-kassan', unit: 'kr per månad' },
      { id: 'rInsTak', label: 'Tak för inkomstförsäkring', unit: 'kr per månad' },
      { id: 'rAk1', label: 'A-kassa dag 1–100', unit: '%' },
      { id: 'rAk2', label: 'A-kassa dag 101–200', unit: '%' },
      { id: 'rAk3', label: 'A-kassa dag 201–300', unit: '%' },
      { id: 'rAk4', label: 'A-kassa dag 301–400', unit: '%' },
      { id: 'rAk5', label: 'A-kassa dag 401–500', unit: '%' },
      { id: 'rSjFactor', label: 'Sjukpenning', unit: '% av lönen' },
      { id: 'rSjTak', label: 'Tak för sjukpenning', unit: 'kr per månad' },
    ],
  },
];

export const ALL_FIELDS: Field[] = [
  ...GROUPS.flatMap((g) => [...g.important, ...g.more]),
  ...PRICE_FIELDS.flatMap((g) => g.fields),
  ...RULE_FIELDS.flatMap((g) => g.fields),
];

export const defaultValue = (id: NumKey) => DEFAULTS[id];
