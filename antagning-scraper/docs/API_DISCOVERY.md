# Att hitta antagning.se:s interna API (Del 1)

## Varför detta inte redan är ifyllt

Den här koden byggdes i en sandboxad agent-miljö utan nätverksåtkomst till
`antagning.se` (organisationens brandvägg blockerar utgående trafik dit).
Det innebär att det faktiska API-anropet, dess parametrar och JSON-formatet
aldrig kunde observeras här -- `docs/api_example.json` och
`config/api_config.json` är därför inte ifyllda med riktiga värden. Del 1
måste köras av dig, lokalt, en gång.

Allt annat i det här projektet (scraper, cache, normalisering, analys) är
byggt och testat mot ett fejkat lokalt API-svar som följer samma form som
kravspecen -- se `tests/` / testkörningen i README. Så snart du fyller i
den riktiga konfigurationen ska `src/scrape.py` fungera utan ändringar.

## Steg för steg

1. Installera beroenden lokalt:
   ```sh
   pip install -r requirements.txt
   playwright install chromium
   ```
2. Gå till antagning.se i din vanliga webbläsare och ställ in sökningen precis
   som du redan gjort: vårtermin 2027, kurser, "distans, utan fysisk
   sammankomst". Kopiera URL:en i adressfältet när träfflistan visas.
3. Kör:
   ```sh
   python tools/discover_api.py --url "<klistra in URL:en här>"
   ```
   Ett synligt webbläsarfönster öppnas (så du kan logga in om det behövs).
   Varje JSON-svar som webbläsaren tar emot loggas i terminalen och i
   `docs/api_discovery_log.jsonl`.
4. Scrolla ner eller klicka "Visa fler" ett par gånger i det öppnade fönstret.
   Jämför URL:erna som loggas för varje efterföljande anrop -- det visar om
   paginering sker via `offset`/`limit`, ett sidnummer, eller en cursor-token.
5. Det första svaret som ser ut som en träfflista sparas automatiskt till
   `docs/api_example.json`. Titta igenom den filen för att se det faktiska
   fältnamnen (kurskod, titel, lärosäte, poäng, osv.).
6. Kopiera `config/api_config.example.json` till `config/api_config.json` och
   fyll i, baserat på vad du hittade:
   - `search_api_path` -- sökvägen till API:et (t.ex. `/api/sok/kurser`)
   - `static_query_params` -- de query-parametrar som representerar dina
     filter (termin, distans, kurser)
   - `pagination` -- vilken stil (`offset_limit` / `page_number` / `cursor`)
     och vilka parameternamn som används
   - `response.results_key` / `response.total_key` -- var i JSON-svaret
     listan med träffar respektive det totala antalet finns
   - `field_map` -- hur varje fält i en träff mappar till kolumnerna i den
     normaliserade tabellen

7. Testa med en enda sida först:
   ```sh
   python src/scrape.py --max-pages 1
   ```
   Kontrollera att `data/processed/courses.csv` ser rimlig ut innan du kör
   utan `--max-pages` för att hämta alla ~2771 träffar.

## Om robots.txt

`antagning.se/robots.txt` blockerar generell automatiserad åtkomst. Det är
därför Del 1 medvetet är en manuell, interaktiv process i din egen
webbläsare (samma sak du redan gör när du surfar på sajten) snarare än ett
skript som crawlar sajten på egen hand. `src/scrape.py` pratar sedan direkt
med det API:et du redan observerat, i en långsam, begränsad takt, för eget
bruk -- se README.md för det fulla resonemanget.
