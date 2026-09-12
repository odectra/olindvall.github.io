# antagning-scraper

Litet Python-verktyg för att hämta och analysera kurser från antagning.se --
byggt **för strikt personligt, icke-kommersiellt analytiskt bruk**, med
skonsam anropstakt. Scenariot det är byggt för: sökning på "distans, utan
fysisk sammankomst" för vårtermin 2027 (~2771 träffar), men filtren är
konfigurerbara.

## Viktigt att veta om detta projekt

- `antagning.se/robots.txt` tillåter inte generell automatiserad åtkomst.
  Det här verktyget crawlar därför inte sajten på egen hand -- API-anropet
  identifieras en gång, manuellt, i din egen webbläsare (se
  `docs/API_DISCOVERY.md`), och `src/scrape.py` pratar sedan direkt med det
  API:et i en långsam, begränsad takt (300--500 ms mellan anrop, tydlig
  User-Agent, max 3 försök med backoff vid fel).
- Det är byggt för eget bruk: att analysera vilka distanskurser som finns,
  inte för att sprida, sälja eller på annat sätt publicera datan vidare.
- **Del 1 (att hitta API:et) kunde inte göras i den agent-session som byggde
  det här** -- sessionen kördes i en sandlåda utan nätverksåtkomst till
  antagning.se. Se `docs/API_DISCOVERY.md` för exakt vad som återstår och
  varför. Allt annat (scraper, cache, normalisering, analys) är byggt och
  testat mot ett fejkat API-svar i samma form som specen beskriver.

## Struktur

```
antagning-scraper/
├── tools/discover_api.py   # Del 1: kör lokalt för att hitta API:et (se docs/API_DISCOVERY.md)
├── src/scrape.py           # Del 2: hämtar + cachar + normaliserar alla träffar
├── src/analyze.py          # Del 3: översikt, avvikelser, sökning, grafer
├── config/
│   ├── api_config.example.json  # mall -- kopiera till api_config.json och fyll i
│   └── api_config.json          # (skapas av dig; inte incheckad tom-mall)
├── docs/
│   ├── API_DISCOVERY.md    # steg-för-steg för Del 1
│   └── api_example.json    # exempel-svar (fylls i av discover_api.py)
├── data/
│   ├── raw/                # cachade råa API-sidor (JSON), en fil per sida
│   └── processed/          # normaliserad tabell (courses.csv / courses.parquet)
└── output/                 # genererade grafer (PNG)
```

## Kom igång

```sh
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Del 1 -- hitta API:et (görs en gång, lokalt, av dig)

```sh
playwright install chromium
python tools/discover_api.py --url "<din redan filtrerade antagning.se-sök-URL>"
```

Se `docs/API_DISCOVERY.md` för detaljer. Resultatet: en ifylld
`config/api_config.json` (kopiera från `config/api_config.example.json`) och
ett exempel-svar i `docs/api_example.json`.

### Del 2 -- hämta alla kurser

```sh
python src/scrape.py
```

Kör gärna med `--max-pages 1` första gången för att verifiera att
konfigurationen stämmer innan du hämtar allt. Redan hämtade sidor cachas i
`data/raw/page_XXXX.json` -- kör skriptet igen och det hoppar över allt som
redan finns, så ett avbrutet körning kan återupptas utan att börja om.

Resultatet hamnar i `data/processed/courses.csv` och `courses.parquet` med
kolumnerna: `kurskod`, `kursnamn`, `larosate`, `ort`, `hp`, `niva`, `sprak`,
`startdatum`, `slutdatum`, `anmalningskod`, `antal_platser`, `url`.

### Del 3 -- analys

```sh
python src/analyze.py
python src/analyze.py --search "maskininl|artificiell intelligens"
python src/analyze.py --niche "hallbarhet"
```

Skriver ut en översikt (kurser per lärosäte/nivå/poäng), avvikande kurser
(mycket korta/långa, få platser), vanligaste ämnesorden i titlar, och sparar
två grafer i `output/`: `top_providers.png` och `top_words.png`.

## Testat, inte bara skrivet

`src/scrape.py` och `src/analyze.py` är körda end-to-end mot en lokal,
fejkad server som svarar i exakt samma form som specen beskriver (paginering
med `from`/`size`, ett `hits`/`total`-svar), för att verifiera paginering,
cachning, retry-logik och normalisering fungerar innan de pekas mot den
riktiga, ännu okända, antagning.se-konfigurationen.

## Beroenden

Se `requirements.txt`: `requests`, `pandas`, `pyarrow`, `matplotlib`,
`playwright` (bara för `tools/discover_api.py`).
