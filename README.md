# Devocean Divers – leverans

En engelskspråkig webbplats med 54 innehållssidor, 13 kompatibilitetssidor för äldre adresser, optimerade originalbilder, båda lokala videofilmerna, prislista och PHP-kontaktformulär. Ingen byggtjänst behövs. Direkt formulärleverans kräver PHP och en fungerande mejlfunktion på webbhotellet.

## Öppna och publicera

Packa upp `devocean-mexico-2026-10-14.zip`. Öppna `index.html` i en webbläsare för en lokal förhandsvisning. Behåll alla undermappar bredvid filen – enbart indexfilen innehåller inte bilder, typsnitt eller undersidor. Formuläret skickar inte från en lokal fil.

På Inleed/PHP-webbhotell: säkerhetskopiera befintlig webbplats och ladda sedan upp ZIP-filens **uppackade innehåll** till rätt domäns webbrot (ofta `public_html`). Behåll `api`, `assets` och samtliga sidmappar. Kontrollera att även `api/.htaccess` följer med. Välj en säkerhetsuppdaterad PHP-version, minst PHP 8.2, och använd HTTPS.

GitHub Pages kan visa designen men kan **inte köra PHP-formuläret**. Där visar formuläret ett tydligt fel med mejl/WhatsApp som alternativ. Publicera på PHP-webbhotellet för direkt skickning.

## Kontaktformuläret

Mottagaren är `devoceandivers.mexico@gmail.com`, hämtad från originalwebbplatsen. WhatsApp är `+52 984 314 2681`.

Formuläret skickar via `api/contact.php` till mottagaren ovan. Förfrågan kräver namn, mejl och meddelande; upplevelse är förvald till hjälp att välja och datum är frivilligt. Samma formulär finns i startsidans bokningssektion, på kontaktsidan och på Reviews-sidan. Snabbvalet under heron förväljer upplevelsen och tar besökaren till formuläret. WhatsApp-länken i formuläret innehåller de ifyllda planerna och fungerar även utan PHP. Vid fel finns uppgifterna kvar och besökaren kan använda mejl, WhatsApp eller kopiera meddelandet.

### Måste kontrolleras före skarp användning

1. I `api/config.php` finns den tekniska avsändaren `website@devoceandivers.com.mx`. Detta är en föreslagen inställning, **inte en verifierad befintlig brevlåda**. Skapa/godkänn den hos webbhotellet eller byt till en avsändare som webbhotellet tillåter på kundens egen domän. Använd inte besökarens mejladress som avsändare; den läggs i Reply-To.
2. Be webbhotellet säkerställa att PHP `mail()` fungerar och att SPF/DKIM är rätt för avsändardomänen. Om de kräver autentiserad SMTP behöver transporten anpassas med uppgifter från webbhotellet; det ingår inte några SMTP-lösenord i filerna.
3. Tillåtna formuläradresser är `https://www.devoceandivers.com.mx` och `https://devoceandivers.com.mx`. Vid testdomän: lägg in dess exakta HTTPS-adress i `allowed_origins` i `api/config.php`, och ta bort testadressen efteråt. Ingen avslutande snedstreck eller sökväg.
4. Provskicka från den publicerade hemsidan. Bekräfta att meddelandet når Gmail (kontrollera skräppost) och att Svara går till besökaren. Testa både startsidans och kontaktsidans formulär samt en mobil.

Bekräftelsen betyder att webbhotellets mejlsystem accepterat förfrågan, inte att den nått inkorgen eller att en bokning är bekräftad. Inga riktiga förfrågningar har skickats under våra tester.

Skydd: servervalidering, fasta mottagare, spärr mot mejlhuvudinjektion, CSRF-token, ursprungskontroll, honeypot, storleksgränser, skydd mot dubbla skickningar och begränsning per IP (30 sekunders mellanrum, 5/timme, 15/dygn). Global gräns är 100/timme och 500/dygn. Endast hashade nätverksidentifierare/tider/räknare sparas i privata temporära filer, inte meddelandetext. Räknare äldre än 24 timmar rensas vid nästa förfrågan. En nödvändig sessionscookie används. Ingen publik databas, betalning eller inloggning har lagts till.

## Innehåll som kunden behöver godkänna före skarp lansering

- Cozumel, grottdykning, vissa teknikpriser, kursmaterial och bokningsvillkor skiljer sig mellan originalwebbplatsen och prislistan från maj 2026. Därför används offert eller tydliga förbehåll där källorna motsäger varandra.
- Uthyrningslistans dollartecken saknar uttrycklig valutakod i källan. Valutan behöver bekräftas.
- Heron visar 5,0/5 från 30 Tripadvisor-omdömen för Playa del Carmen, kontrollerat 14 oktober 2026. Betyget kan förändras. Det är inte ett påstående om PADI Five Star-ackreditering. Omdömessidan har tre korta Tripadvisor-utdrag och äldre utbildningsberättelser i sin helhet.
- Samtliga åtta bloggartiklar visas i sin helhet på denna webbplats. Inga innehållslänkar skickar läsaren till en annan Devocean-webbplats. Publicerade cenotevillkor finns också lokalt.
- Äldre köp-/checkoutmallar har ersatts av bokningsförfrågningar, utan betalning online.

## SEO och prestanda

Varje innehållssida har engelsk sidtitel, beskrivning, en H1, kanonisk adress och strukturerad data. Sitemap och robots.txt ingår. Bilder har alternativtext, dimensioner, responsiva WebP-versioner och uppskjuten laddning under första vyn. Typsnittet lagras lokalt. Videon laddas först vid uppspelning. Inga externa JavaScript-bibliotek krävs.

Kanoniska adresser och sitemap är förberedda för `https://www.devoceandivers.com.mx/`. Ändra dem före lansering om domänen blir en annan. En offentlig demosida bör inte användas som den slutliga domänen i Google. Säkerställ HTTPS och relevanta säkerhets-/cacheheaders hos webbhotellet. Inga placeringar i Google eller uppmätta hastighetsbetyg garanteras.

## Uppdatering 14 oktober 2026

Ny filmisk startsida, vit sidbakgrund med marinblå text och isblå detaljer, 11 utvalda egna fotografier i responsiva WebP-storlekar, ny frilagd DEVOCEAN DIVERS-logotyp och båda levererade filmerna. Mobilanpassad bildhero och fast kontaktfält. Filmer startar endast på begäran. Den nya filmen på 9 sekunder är en varumärkesintroduktion; grottfilmen är cirka 52 sekunder. Den äldre filmen `assets/devocean-teaser.mp4` finns kvar i filerna men har ersatts i sidornas videovisning.

54 innehållssidor och 13 äldre sidadresser finns kvar. Sidtitlar, beskrivningar, delningsbild, kanoniska adresser, brödsmulor, företagsinformation och FAQ-data är uppdaterade. 3 574 lokala/externa referenser och 109 JSON-LD-block kontrollerade, utan saknade filer eller länkar till en annan Devocean-webbplats.

Alla 54 innehållssidor passerade kontroll i både mobil- och datorbredd (108 sidkontroller). Meny, filtrering av dykupplevelser, förval i bokningsformuläret, WhatsApp-meddelandets innehåll, bevarade uppgifter vid mejlfel samt båda filmernas uppspelning kontrollerades lokalt. Startsidan granskades även i 320, 768 och 1024 pixlars bredd. Inga riktiga bokningsförfrågningar skickas under test. PHP-koden är oförändrad; verklig mejlleverans på webbhotellet måste fortfarande provskickas efter uppladdning.

Utvecklingsfiler, verifieringsrapport och säkerhetskopia av föregående version finns separat i projektets `devocean-refresh`-mapp. Webbpaketet behöver ingen byggprocess.

## Designkorrigering 14 oktober 2026

Den vita sidbakgrunden är återställd. Fotografiheron, innehållet och de nya funktionerna behålls. Tripadvisor-stjärnorna är större och guldfärgade mot en mörk, avgränsad yta. En uttrycklig Home-länk finns i huvudmenyn på alla 54 innehållssidor och fungerar även i mobilmenyn. Vit bakgrund, kontrast, layout utan sidledes överflöde och mobilmenyn kontrollerades i 320, 390, 1024 och 1440 pixlars bredd.

Jämförelse mot säkerhetskopian: alla 251 originalfiler och samtliga 67 HTML-sidadresser finns kvar. Detta innebär inte att innehållet är ordagrant oförändrat: startsidans texter, bildurval, sektionsordning och videovisning har omarbetats.

## Publiceringsstatus

Webbplatsen har inte publicerats på en ny adress och ingen befintlig livewebbplats har ändrats. Leveransen är nu anpassad för PHP-webbhotellet som användaren valde. Uppdateringen är gjord direkt i den lokala GitHub-mapp som användaren angav. Ingen push eller publicering har gjorts.

## Reviews i huvudmenyn

Reviews finns i dator- och mobilmenyn på samtliga 54 innehållssidor. Omdömessidan visar Tripadvisor-betyget 5,0/5 från 30 omdömen med kontrollens datum, tre publicerade kortutdrag och alla nio befintliga utbildningsberättelser med läsbar fulltext. Inga nya betyg har tilldelats utbildningsberättelserna. Bokningsknappar leder till ett förfrågningsformulär på samma sida; WhatsApp kan använda ifyllda planer. Alla nio originaltexter finns kvar. Layouten och menylänken kontrollerades vid 320, 390, 901, 1024 och 1440 pixlar. Lokal felhantering bevarar formulärdata. Inga riktiga meddelanden skickades.
