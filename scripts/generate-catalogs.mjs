import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "data");
const PRODUCTS_PER_MODE = 10_000;
const PRODUCTS_PER_CATEGORY = 500;

const editions = [
  "Signature", "Edition", "Reserve", "Studio", "Heritage", "Touring", "Grand", "Prime", "Select", "Collector",
  "Nordic", "Executive", "Sport", "Classic", "Limited", "Pro", "Ultra", "Atelier", "Voyager", "Essential",
];

const luxuryBrands = [
  "Aurelius", "Bellmont", "Cavallo", "D'Orsay", "Elysian", "Falken", "Grandier", "Harrington", "Imperial", "Juno",
  "Kingsley", "Lumière", "Montclair", "Nobile", "Orion", "Prestige", "Quintessa", "Riviera", "Sterling", "Valenti",
];

const everydayBrands = [
  "North & Co", "Daily Works", "Brightline", "Mellow", "Oak & Pine", "Pocket", "Urban Field", "Goodform", "Homebase", "Nova",
  "Kindred", "Simpleday", "Bluebird", "Evergreen", "Common Ground", "Daylight", "Loop", "Hearth", "Weekend", "Studio One",
];

const luxuryCategories = [
  { id: "fordon", label: "Fordon", description: "Superbilar, klassiker, motorcyklar och specialbyggda fordon.", subcategories: ["Superbilar", "Klassiska bilar", "SUV & limousine", "Motorcyklar", "Banbilar"], items: ["Hypercar", "Grand tourer", "Roadster", "Limousine", "Restomod", "Racingbil", "El-superbil", "Terräng-SUV", "Coupé", "Samlarbil"], min: 4_000_000, max: 700_000_000 },
  { id: "flyg", label: "Privatflyg", description: "Privatjet, helikoptrar och exklusiva luftfarkoster.", subcategories: ["Långdistansjet", "Midsize jet", "Helikopter", "Turboprop", "Historiskt flyg"], items: ["Privatjet", "Långdistansjet", "Affärsjet", "Helikopter", "Turboprop", "VIP-flygplan", "Amfibieflyg", "Jet trainer", "Historiskt propellerplan", "Luftskepp"], min: 120_000_000, max: 1_800_000_000 },
  { id: "batar", label: "Yachter & båtar", description: "Superyachter, segelbåtar och snabba tenderbåtar.", subcategories: ["Superyachter", "Motoryachter", "Segelyachter", "Tenderbåtar", "Explorer yachts"], items: ["Superyacht", "Explorer yacht", "Motoryacht", "Segelyacht", "Catamaran", "Tenderbåt", "Sportbåt", "Houseboat", "Classic yacht", "Daycruiser"], min: 20_000_000, max: 2_500_000_000 },
  { id: "fastigheter", label: "Fastigheter", description: "Takvåningar, privata öar, slott och spektakulära hem.", subcategories: ["Stadsvåningar", "Villor", "Öar", "Slott & gods", "Semesterhem"], items: ["Takvåning", "Klippvilla", "Privat ö", "Townhouse", "Skidchalet", "Slott", "Vingård", "Strandresidens", "Skärgårdsgård", "Ökenretreat"], min: 35_000_000, max: 3_000_000_000 },
  { id: "klockor", label: "Klockor", description: "Haute horlogerie, sportikoner och unika komplikationer.", subcategories: ["Haute horlogerie", "Sportklockor", "Vintage", "Tourbillon", "Juvelklockor"], items: ["Tourbillon", "Perpetual calendar", "Chronograph", "Minute repeater", "Skeleton watch", "Dykarklocka", "Pilotklocka", "Dress watch", "World timer", "Vintage chronograph"], min: 250_000, max: 220_000_000 },
  { id: "smycken", label: "Smycken", description: "Diamanter, ädelstenar och haute joaillerie.", subcategories: ["Ringar", "Halsband", "Armband", "Örhängen", "Unika stenar"], items: ["Diamantring", "Safirhalsband", "Smaragdarmband", "Rubinörhängen", "Tiaran", "Brosch", "Signetring", "Tennisarmband", "Pärlhalsband", "Ädelstenskollektion"], min: 300_000, max: 500_000_000 },
  { id: "mode", label: "Mode", description: "Couture, väskor, skor och sällsynta accessoarer.", subcategories: ["Couture", "Väskor", "Skor", "Ytterplagg", "Accessoarer"], items: ["Coutureklänning", "Skräddarsydd kostym", "Handväska", "Weekendbag", "Kashmirrock", "Sneakers", "Läderskor", "Silkessjal", "Solglasögon", "Resegarderob"], min: 25_000, max: 12_000_000 },
  { id: "teknik", label: "Teknik", description: "Specialbyggd teknik, hemmabio och framtidsprylar.", subcategories: ["Datorer", "Ljud & bild", "Mobilitet", "Robotik", "Smart home"], items: ["Arbetsstation", "Hemmabio", "Referenshögtalare", "Transparent TV", "Gamingrigg", "Servicerobot", "Smart glass-vägg", "VR-studio", "Satellittelefon", "Privat datacenter"], min: 80_000, max: 120_000_000 },
  { id: "konst", label: "Konst", description: "Målningar, skulpturer, fotografi och designobjekt.", subcategories: ["Modern konst", "Samtidskonst", "Skulptur", "Fotografi", "Design"], items: ["Modern målning", "Samtida målning", "Bronsskulptur", "Fotokonstverk", "Kinetisk installation", "Glaskonst", "Marmorskulptur", "Digital installation", "Designikon", "Konstsamling"], min: 500_000, max: 1_500_000_000 },
  { id: "samlarobjekt", label: "Samlarobjekt", description: "Samlarkort, memorabilia, fossiler och historiska föremål.", subcategories: ["Samlarkort", "Sportmemorabilia", "Film & musik", "Naturhistoria", "Historiska föremål"], items: ["Graderat samlarkort", "Signerat matchställ", "Filmkostym", "Turnégitarr", "Dinosauriefossil", "Historiskt dokument", "Rymdmemorabilia", "Myntsamling", "Första utgåva", "Prototyp"], min: 50_000, max: 900_000_000 },
  { id: "resor", label: "Resor", description: "Jorden runt, privata expeditioner och ikoniska hotellsviter.", subcategories: ["Jorden runt", "Expeditioner", "Hotell", "Tåg", "Safari"], items: ["Jorden runt-resa", "Polarexpedition", "Privat safari", "Ö-tur", "Grand tour", "Lyxtågsresa", "Rymdresa", "Kulturresa", "Matresa", "Familjeäventyr"], min: 1_000_000, max: 350_000_000 },
  { id: "upplevelser", label: "Upplevelser", description: "Konserter, premiärer och ögonblick som inte går att köpa vanligtvis.", subcategories: ["Musik", "Film", "Sport", "Äventyr", "Privata event"], items: ["Privat konsert", "Filmpremiär", "Grand Prix-helg", "Finalpaket", "Privat festival", "Ökenrally", "Djuphavsdyk", "Ballongexpedition", "Kockmiddag", "Museikväll"], min: 500_000, max: 100_000_000 },
  { id: "sport", label: "Sport & fritid", description: "Golf, racing, vintersport och privata träningsmiljöer.", subcategories: ["Golf", "Motorsport", "Vintersport", "Racketsport", "Vattensport"], items: ["Golfmedlemskap", "Racingsimulator", "Skidvecka", "Padelbana", "Tennisakademi", "Surfresa", "Seglingssäsong", "Cykelteam", "Privat gym", "Tränarläger"], min: 250_000, max: 80_000_000 },
  { id: "hem-design", label: "Hem & design", description: "Möbler, kök, belysning och skräddarsydda miljöer.", subcategories: ["Möbler", "Kök", "Belysning", "Textil", "Utomhus"], items: ["Designsoffa", "Matsalsgrupp", "Platsbyggt kök", "Kristallkrona", "Konstmattkollektion", "Bibliotek", "Vinkällare", "Poolområde", "Orangeri", "Hemmastudio"], min: 150_000, max: 75_000_000 },
  { id: "mat", label: "Mat & gastronomi", description: "Privata kockar, restaurangupplevelser och sällsynta råvaror.", subcategories: ["Privat kock", "Fine dining", "Råvaror", "Dessert", "Kaffe & te"], items: ["Privat kockår", "Chef's table", "Tryffelmiddag", "Kaviarpaket", "Sushiomakase", "Chokladkollektion", "Kaffereserv", "Teprovning", "Bageristudio", "Gourmetpicknick"], min: 20_000, max: 35_000_000 },
  { id: "wellness", label: "Wellness", description: "Spa, återhämtning, skönhet och personlig hälsa.", subcategories: ["Spa", "Träning", "Hudvård", "Retreat", "Återhämtning"], items: ["Privat spa", "Wellness-retreat", "Personlig tränare", "Hudvårdsprogram", "Sömnsvit", "Recovery room", "Meditationsstudio", "Biohackingpaket", "Massageår", "Hälsocoach"], min: 100_000, max: 25_000_000 },
  { id: "familj", label: "Familj & barn", description: "Drömrum, lek, lärande och stora familjeupplevelser.", subcategories: ["Barnrum", "Lek", "Utbildning", "Familjeresor", "Firanden"], items: ["Drömbarnrum", "Trädkoja", "Leksaksbibliotek", "Privat läger", "Familjeexpedition", "Födelsedagsfestival", "Musikstudio för barn", "Vetenskapsrum", "Minibio", "Ridläger"], min: 100_000, max: 40_000_000 },
  { id: "husdjur", label: "Husdjur", description: "Exklusiva hem, resor och service för fyrbenta familjemedlemmar.", subcategories: ["Hund", "Katt", "Häst", "Akvarium", "Service"], items: ["Hundhus", "Kattsvit", "Häststall", "Designakvarium", "Husdjursspa", "Privat hundpark", "Resepaket för djur", "Tränarår", "Veterinärconcierge", "Porträttsession"], min: 50_000, max: 30_000_000 },
  { id: "underhallning", label: "Musik & underhållning", description: "Studior, biografer, instrument och privata scener.", subcategories: ["Musik", "Film", "Spel", "Scen", "Samlingar"], items: ["Flygel", "Inspelningsstudio", "Privat biograf", "Arcadehall", "Konsertscen", "Gitarrsamling", "DJ-studio", "Podcaststudio", "Vinylbibliotek", "Karaokerum"], min: 150_000, max: 65_000_000 },
  { id: "service", label: "Service & medlemskap", description: "Concierge, personal, klubbar och skräddarsydd vardagsservice.", subcategories: ["Concierge", "Personal", "Klubbar", "Säkerhet", "Transport"], items: ["Conciergeår", "Privatchaufför", "Hushållsteam", "Privat säkerhet", "Medlemsklubb", "Jet concierge", "Reseplanerare", "Personal shopper", "Butlerservice", "Eventteam"], min: 250_000, max: 60_000_000 },
];

const everydayCategories = [
  { id: "mat", label: "Mat & dryck", description: "Frukost, middag, snacks och vardagsfavoriter.", subcategories: ["Skafferi", "Kylt", "Frukt & grönt", "Snacks", "Dryck"], items: ["Pastapaket", "Kaffepaket", "Fruktkorg", "Familjemiddag", "Glasspaket", "Tacoset", "Brödkorg", "Smoothiepaket", "Chokladask", "Matkasse"], min: 15, max: 2_500 },
  { id: "elektronik", label: "Elektronik", description: "TV, ljud, hörlurar och smarta prylar.", subcategories: ["TV", "Ljud", "Hörlurar", "Smart home", "Tillbehör"], items: ["Smart-TV", "Bluetoothhögtalare", "Trådlösa hörlurar", "Soundbar", "E-boksläsare", "Smartklocka", "Projektor", "Kamera", "Powerbank", "Smarthögtalare"], min: 199, max: 45_000 },
  { id: "mobil", label: "Mobiltelefoner", description: "Telefoner, skal, laddare och mobila tillbehör.", subcategories: ["Smartphones", "Budgetmobiler", "Skal", "Laddning", "Foto"], items: ["Smartphone", "Kompaktmobil", "Vikbar mobil", "Mobilskal", "Snabbladdare", "Trådlös laddare", "Mobilstativ", "Kameragrepp", "Skärmskydd", "Reseladdare"], min: 99, max: 28_000 },
  { id: "datorer", label: "Datorer", description: "Bärbart, stationärt och allt runt omkring.", subcategories: ["Laptop", "Stationärt", "Skärmar", "Tangentbord", "Tillbehör"], items: ["Laptop", "Stationär dator", "Bildskärm", "Mekaniskt tangentbord", "Datormus", "Dockningsstation", "Webbkamera", "SSD", "Router", "Kontorspaket"], min: 249, max: 55_000 },
  { id: "gaming", label: "Gaming", description: "Konsoler, spel, stolar och tillbehör.", subcategories: ["Konsoler", "Spel", "PC-gaming", "Tillbehör", "Retro"], items: ["Spelkonsol", "TV-spel", "Gamingstol", "Handkontroll", "Gamingheadset", "Racingratt", "Retro-konsol", "VR-headset", "Spelbord", "Presentkort"], min: 99, max: 30_000 },
  { id: "hem", label: "Hem", description: "Praktiska saker som gör hemmet enklare och trevligare.", subcategories: ["Städ", "Förvaring", "Textil", "Belysning", "Dekoration"], items: ["Dammsugare", "Förvaringslåda", "Bäddset", "Bordslampa", "Vas", "Gardiner", "Handduksset", "Spegel", "Doftljus", "Tvättkorg"], min: 39, max: 12_000 },
  { id: "mobler", label: "Möbler", description: "Soffor, bord, sängar och småmöbler.", subcategories: ["Vardagsrum", "Sovrum", "Matplats", "Kontor", "Utomhus"], items: ["Soffa", "Säng", "Matbord", "Kontorsstol", "Fåtölj", "Skrivbord", "Bokhylla", "Sängbord", "Utemöbel", "Pall"], min: 199, max: 45_000 },
  { id: "kok", label: "Kök", description: "Köksmaskiner, redskap och servering.", subcategories: ["Maskiner", "Kokkärl", "Knivar", "Servering", "Bakning"], items: ["Airfryer", "Kaffebryggare", "Stekpanna", "Knivset", "Tallriksset", "Mixer", "Vattenkokare", "Bakform", "Matlådeset", "Köksvåg"], min: 49, max: 18_000 },
  { id: "klader", label: "Kläder", description: "Basplagg, fest, ytterplagg och arbetskläder.", subcategories: ["Dam", "Herr", "Unisex", "Barn", "Ytterplagg"], items: ["T-shirt", "Jeans", "Skjorta", "Klänning", "Hoodie", "Jacka", "Kostym", "Träningsset", "Pyjamas", "Regnkläder"], min: 79, max: 8_000 },
  { id: "skor", label: "Skor", description: "Sneakers, vardagsskor, boots och sportskor.", subcategories: ["Sneakers", "Sport", "Boots", "Barnskor", "Sandaler"], items: ["Sneakers", "Löparskor", "Vandringskängor", "Vinterskor", "Sandaler", "Barnskor", "Fotbollsskor", "Arbetsskor", "Tofflor", "Gummistövlar"], min: 99, max: 4_500 },
  { id: "skonhet", label: "Skönhet & vård", description: "Hud, hår, doft och vardaglig egenvård.", subcategories: ["Hudvård", "Hårvård", "Makeup", "Doft", "Rakning"], items: ["Hudvårdsset", "Schampo", "Hårfön", "Makeupkit", "Parfym", "Rakapparat", "Ansiktsmask", "Nagelset", "Body lotion", "Stylingverktyg"], min: 29, max: 6_000 },
  { id: "halsa", label: "Hälsa", description: "Enkel hälsoutrustning, återhämtning och vardagsstöd.", subcategories: ["Mätning", "Sömn", "Återhämtning", "Ergonomi", "Första hjälpen"], items: ["Blodtrycksmätare", "Tyngdtäcke", "Massagepistol", "Ergonomisk kudde", "Första hjälpen-kit", "Ljusterapilampa", "Nackmassage", "Sovmask", "Ståmatta", "Värmedyna"], min: 49, max: 8_000 },
  { id: "traning", label: "Träning", description: "Gym, löpning, lagidrott och hemmaträning.", subcategories: ["Gym", "Löpning", "Bollsport", "Yoga", "Racketsport"], items: ["Hantlar", "Löparväst", "Fotboll", "Yogamatta", "Padelracket", "Träningsklocka", "Gummiband", "Gymkort", "Cykelhjälm", "Vattenflaska"], min: 49, max: 15_000 },
  { id: "friluftsliv", label: "Friluftsliv", description: "Camping, vandring, fiske och utflykter.", subcategories: ["Camping", "Vandring", "Fiske", "Cykel", "Vinter"], items: ["Tält", "Ryggsäck", "Fiskespö", "Cykel", "Sovsäck", "Stormkök", "Vandringsjacka", "Pannlampa", "Picknickset", "Pulkor"], min: 79, max: 35_000 },
  { id: "bocker-media", label: "Böcker & media", description: "Romaner, fakta, musik och streaming.", subcategories: ["Romaner", "Fakta", "Barnböcker", "Musik", "Abonnemang"], items: ["Roman", "Kokbok", "Barnbok", "Vinylskiva", "Streamingår", "Ljudboksår", "Seriebok", "Pusselbok", "Fotobok", "Tidningsprenumeration"], min: 19, max: 2_000 },
  { id: "barn-baby", label: "Barn & baby", description: "Barnvagnar, kläder, matning och trygg vardag.", subcategories: ["Baby", "Barnkläder", "Barnrum", "Matning", "Säkerhet"], items: ["Barnvagn", "Babygym", "Barnklädset", "Spjälsäng", "Matstol", "Bärsele", "Bilbarnstol", "Skötväska", "Nattlampa", "Babyvakt"], min: 49, max: 18_000 },
  { id: "leksaker-hobby", label: "Leksaker & hobby", description: "Bygg, pyssel, samlingar och kreativa intressen.", subcategories: ["Bygg", "Pyssel", "Spel", "Modeller", "Samlarkort"], items: ["Byggset", "Pysselkit", "Brädspel", "Modellbil", "Samlarkortspaket", "Radiostyrd bil", "Målarset", "Dockhus", "Trollerilåda", "Musikinstrument"], min: 29, max: 7_500 },
  { id: "husdjur", label: "Husdjur", description: "Mat, leksaker, bäddar och praktiska tillbehör.", subcategories: ["Hund", "Katt", "Smådjur", "Fisk", "Fågel"], items: ["Hundfoder", "Kattklös", "Husdjursbädd", "Akvarium", "Fågelbur", "Koppel", "Transportbur", "Aktiveringsleksak", "Pälsvård", "Vattenskål"], min: 29, max: 12_000 },
  { id: "transport", label: "Transport", description: "Cyklar, mopeder, biltillbehör och pendling.", subcategories: ["Cykel", "Moped", "Bil", "Pendling", "Säkerhet"], items: ["Elcykel", "Moped", "Cykellås", "Takbox", "Bilbarnstol", "Pendlarväska", "Cykelservice", "Dashcam", "Hjälm", "Däckset"], min: 99, max: 85_000 },
  { id: "resor-tjanster", label: "Resor & tjänster", description: "Weekend, hotell, vardagstjänster och små pauser.", subcategories: ["Weekend", "Hotell", "Transport", "Hemservice", "Upplevelser"], items: ["Weekendresa", "Hotellnatt", "Tågbiljett", "Städning", "Biokväll", "Spa-dag", "Restaurangmiddag", "Barnvakt", "Flyttstädning", "Fotografering"], min: 99, max: 25_000 },
];

const curatedLuxury = [
  ["Bugatti Tourbillon", "Bugatti", "fordon", "Superbilar", 45_000_000],
  ["Bugatti Chiron Super Sport", "Bugatti", "fordon", "Superbilar", 40_000_000],
  ["Koenigsegg Jesko Absolut", "Koenigsegg", "fordon", "Superbilar", 38_000_000],
  ["Pagani Utopia", "Pagani", "fordon", "Superbilar", 32_000_000],
  ["Mercedes-AMG ONE", "Mercedes-AMG", "fordon", "Superbilar", 35_000_000],
  ["Ferrari Daytona SP3", "Ferrari", "fordon", "Superbilar", 27_000_000],
  ["McLaren Solus GT", "McLaren", "fordon", "Banbilar", 38_000_000],
  ["Lamborghini Revuelto", "Lamborghini", "fordon", "Superbilar", 7_000_000],
  ["Rolls-Royce Phantom Extended", "Rolls-Royce", "fordon", "SUV & limousine", 8_000_000],
  ["Porsche 911 S/T", "Porsche", "fordon", "Samlarbilar", 4_000_000],
  ["Rolex Cosmograph Daytona Platinum", "Rolex", "klockor", "Sportklockor", 900_000],
  ["Patek Philippe Grandmaster Chime", "Patek Philippe", "klockor", "Haute horlogerie", 30_000_000],
  ["Richard Mille RM 56-02 Sapphire", "Richard Mille", "klockor", "Tourbillon", 25_000_000],
  ["Audemars Piguet Royal Oak Concept Flying Tourbillon", "Audemars Piguet", "klockor", "Tourbillon", 4_500_000],
  ["Jacob & Co. Billionaire Timeless Treasure", "Jacob & Co.", "klockor", "Juvelklockor", 220_000_000],
  ["Vacheron Constantin Les Cabinotiers Armillary Tourbillon", "Vacheron Constantin", "klockor", "Haute horlogerie", 10_000_000],
  ["Gulfstream G700", "Gulfstream", "flyg", "Långdistansjet", 900_000_000],
  ["Bombardier Global 7500", "Bombardier", "flyg", "Långdistansjet", 850_000_000],
  ["Dassault Falcon 10X", "Dassault", "flyg", "Långdistansjet", 800_000_000],
  ["Embraer Praetor 600", "Embraer", "flyg", "Midsize jet", 260_000_000],
  ["Cessna Citation Longitude", "Cessna", "flyg", "Midsize jet", 320_000_000],
  ["Airbus ACH160 Exclusive", "Airbus", "flyg", "Helikopter", 180_000_000],
  ["Sunseeker 100 Yacht", "Sunseeker", "batar", "Motoryachter", 120_000_000],
  ["Azimut Grande Trideck", "Azimut", "batar", "Motoryachter", 170_000_000],
  ["Sanlorenzo 52Steel", "Sanlorenzo", "batar", "Superyachter", 350_000_000],
  ["Feadship 58 m Custom Superyacht", "Feadship", "batar", "Superyachter", 650_000_000],
  ["Tecnomar for Lamborghini 63", "Tecnomar", "batar", "Tenderbåtar", 45_000_000],
  ["Privat ö i Bahamas", undefined, "fastigheter", "Öar", 500_000_000],
  ["Takvåning i Monaco", undefined, "fastigheter", "Stadsvåningar", 750_000_000],
  ["Townhouse i Mayfair, London", undefined, "fastigheter", "Stadsvåningar", 450_000_000],
  ["Takvåning vid Central Park, New York", undefined, "fastigheter", "Stadsvåningar", 900_000_000],
  ["Klippvilla på Ibiza", undefined, "fastigheter", "Semesterhem", 180_000_000],
  ["Skidchalet i Courchevel", undefined, "fastigheter", "Semesterhem", 250_000_000],
  ["Privat skärgårdsresidens i Sverige", undefined, "fastigheter", "Semesterhem", 120_000_000],
  ["Ferrari 250 GTO", "Ferrari", "samlarobjekt", "Historiska föremål", 700_000_000],
  ["Tyrannosaurus rex-skelett", undefined, "samlarobjekt", "Naturhistoria", 80_000_000],
  ["Konstverk av Jean-Michel Basquiat", "Jean-Michel Basquiat", "konst", "Samtidskonst", 500_000_000],
  ["Privat konsert med en världsstjärna", undefined, "upplevelser", "Musik", 20_000_000],
  ["Formel 1-säsong för tio personer", undefined, "upplevelser", "Sport", 10_000_000],
  ["Förstaklassresa jorden runt för tio personer", undefined, "resor", "Jorden runt", 5_000_000],
];

const tradingCards = [
  ["Pokémon Base Set Charizard 1st Edition PSA 10", "Pokémon", "Base Set", "1999", "4/102", "Engelska", "PSA", 10, 4_500_000],
  ["Pokémon Pikachu Illustrator PSA 10", "Pokémon", "CoroCoro Promo", "1998", "Promo", "Japanska", "PSA", 10, 55_000_000],
  ["Pokémon Umbreon Gold Star PSA 10", "Pokémon", "POP Series 5", "2007", "17/17", "Engelska", "PSA", 10, 1_700_000],
  ["Magic: The Gathering Black Lotus Alpha PSA 10", "Magic: The Gathering", "Alpha", "1993", "233/295", "Engelska", "PSA", 10, 12_000_000],
  ["Magic: The Gathering Mox Sapphire Alpha PSA 10", "Magic: The Gathering", "Alpha", "1993", "263/295", "Engelska", "PSA", 10, 2_800_000],
  ["One Piece Monkey D. Luffy Manga Rare PSA 10", "One Piece", "Romance Dawn", "2022", "OP01-024", "Japanska", "PSA", 10, 180_000],
  ["One Piece Shanks Manga Rare PSA 10", "One Piece", "Romance Dawn", "2022", "OP01-120", "Engelska", "PSA", 10, 140_000],
  ["Yu-Gi-Oh! Blue-Eyes White Dragon 1st Edition PSA 10", "Yu-Gi-Oh!", "Legend of Blue Eyes", "2002", "LOB-001", "Engelska", "PSA", 10, 900_000],
  ["1986 Fleer Michael Jordan #57 PSA 10", "Basket", "Fleer", "1986", "57", "Engelska", "PSA", 10, 2_300_000],
  ["1952 Topps Mickey Mantle #311 PSA 9", "Baseboll", "Topps", "1952", "311", "Engelska", "PSA", 9, 50_000_000],
];

const curatedEveryday = [
  ["Flaggskeppsmobil 256 GB", "mobil", "Smartphones", 14_990],
  ["Kompakt smartphone", "mobil", "Smartphones", 8_990],
  ["OLED-TV 65 tum", "elektronik", "TV", 24_990],
  ["Spelkonsol med två handkontroller", "gaming", "Konsoler", 7_490],
  ["Bärbar dator för studier och jobb", "datorer", "Laptop", 11_990],
  ["Elcykel för pendling", "transport", "Cykel", 29_990],
  ["Robotdammsugare", "hem", "Städ", 6_990],
  ["Airfryer för familjen", "kok", "Maskiner", 1_990],
  ["Löparskor för asfalt", "skor", "Sport", 1_699],
  ["Weekendresa för två", "resor-tjanster", "Weekend", 6_500],
  ["Barnvagn komplett paket", "barn-baby", "Baby", 12_990],
  ["Soffa med schäslong", "mobler", "Vardagsrum", 15_990],
  ["E-boksläsare", "elektronik", "Tillbehör", 2_490],
  ["Gaming-PC", "datorer", "Stationärt", 22_990],
  ["Kaffemaskin", "kok", "Maskiner", 5_990],
  ["Årskort på gym", "traning", "Gym", 5_400],
  ["Tält för fyra personer", "friluftsliv", "Camping", 3_490],
  ["Säng 180 cm", "mobler", "Sovrum", 18_990],
  ["Hundfoder för ett år", "husdjur", "Hund", 9_500],
  ["Stor familjematkasse", "mat", "Skafferi", 1_299],
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function priceBetween(min, max, index) {
  const t = ((index * 9301 + 49297) % 233280) / 233280;
  const curved = Math.pow(t, 2.25);
  const raw = min * Math.pow(max / min, curved);
  const magnitude = raw >= 100_000_000 ? 1_000_000 : raw >= 1_000_000 ? 100_000 : raw >= 100_000 ? 10_000 : raw >= 10_000 ? 1_000 : raw >= 1_000 ? 100 : raw >= 100 ? 10 : 1;
  return Math.max(1, Math.round(raw / magnitude) * magnitude);
}

function makeGenericProduct({ mode, category, index, globalIndex }) {
  const brands = mode === "luxury" ? luxuryBrands : everydayBrands;
  const brand = brands[(index * 7 + category.id.length) % brands.length];
  const item = category.items[index % category.items.length];
  const edition = editions[(index * 3 + globalIndex) % editions.length];
  const series = String((index % 97) + 1).padStart(2, "0");
  const name = `${brand} ${item} ${edition} ${series}`;
  const priceSek = priceBetween(category.min, category.max, globalIndex + 1);
  const subcategory = category.subcategories[index % category.subcategories.length];
  const modeCopy = mode === "luxury"
    ? "Ett påkostat fantasierbjudande för den som vill göra shoppinglistan fullständigt orimlig."
    : "En igenkännbar vardagsprodukt som gör det lätt att testa hur långt din valda budget räcker.";

  return {
    id: `${mode === "luxury" ? "lux" : "everyday"}-${String(globalIndex + 1).padStart(6, "0")}`,
    mode,
    slug: slugify(name),
    name,
    brand,
    categoryId: category.id,
    categoryLabel: category.label,
    subcategoryId: slugify(subcategory),
    subcategoryLabel: subcategory,
    priceSek,
    shortDescription: `${subcategory} med ${mode === "luxury" ? "exklusiv" : "praktisk"} profil och uppskattat fantasipris.`,
    description: `${name} är skapad för kategorin ${category.label}. ${modeCopy} Pris och specifikationer är ungefärliga och används endast i spelet.`,
    facts: [
      `Kategori: ${category.label}`,
      `Underkategori: ${subcategory}`,
      `Prisnivå: ungefär ${priceSek.toLocaleString("sv-SE")} kr`,
    ],
    tags: [category.label, subcategory, item, brand, edition].map((tag) => tag.toLowerCase()),
    featured: index < 4,
  };
}

function createCuratedLuxuryProduct(entry, index) {
  const [name, brand, categoryId, subcategoryLabel, priceSek] = entry;
  const category = luxuryCategories.find((item) => item.id === categoryId);
  return {
    id: `lux-${String(index + 1).padStart(6, "0")}`,
    mode: "luxury",
    slug: slugify(name),
    name,
    brand,
    categoryId,
    categoryLabel: category?.label ?? categoryId,
    subcategoryId: slugify(subcategoryLabel),
    subcategoryLabel,
    priceSek,
    shortDescription: "Ett ikoniskt val i den extrema shoppingkatalogen.",
    description: `${name} ligger i katalogen som ett ungefärligt fantasierbjudande. Priset är inte en offert och produkten säljs inte på sidan.`,
    facts: [
      `Ungefärligt spelpris: ${priceSek.toLocaleString("sv-SE")} kr`,
      `Kategori: ${category?.label ?? categoryId}`,
      "Utvalt som en igenkännbar drömprodukt.",
    ],
    tags: [name, brand ?? "", category?.label ?? "", subcategoryLabel].filter(Boolean).map((tag) => String(tag).toLowerCase()),
    featured: true,
  };
}

function createTradingCardProduct(entry, index) {
  const [name, franchise, set, year, cardNumber, language, gradingCompany, grade, priceSek] = entry;
  return {
    id: `lux-${String(index + 1).padStart(6, "0")}`,
    mode: "luxury",
    slug: slugify(name),
    name,
    brand: franchise,
    categoryId: "samlarobjekt",
    categoryLabel: "Samlarobjekt",
    subcategoryId: "samlarkort",
    subcategoryLabel: "Samlarkort",
    priceSek,
    shortDescription: `${franchise}-kort graderat ${gradingCompany} ${grade}.`,
    description: `${name} är ett uppskattat fantasierbjudande för samlare. Marknaden för graderade kort förändras snabbt och priset används enbart i spelet.`,
    facts: [`Set: ${set}`, `År: ${year}`, `Kortnummer: ${cardNumber}`, `Språk: ${language}`, `Gradering: ${gradingCompany} ${grade}`],
    tags: ["samlarkort", franchise, set, year, language, gradingCompany, String(grade)].map((tag) => tag.toLowerCase()),
    featured: true,
    collectible: { franchise, set, year, cardNumber, language, gradingCompany, grade },
  };
}

function createCuratedEverydayProduct(entry, index) {
  const [name, categoryId, subcategoryLabel, priceSek] = entry;
  const category = everydayCategories.find((item) => item.id === categoryId);
  return {
    id: `everyday-${String(index + 1).padStart(6, "0")}`,
    mode: "everyday",
    slug: slugify(name),
    name,
    categoryId,
    categoryLabel: category?.label ?? categoryId,
    subcategoryId: slugify(subcategoryLabel),
    subcategoryLabel,
    priceSek,
    shortDescription: "En tydlig vardagsfavorit med ungefärligt spelpris.",
    description: `${name} är ett representativt fantasierbjudande i vardagsläget. Pris och detaljer är ungefärliga och används bara för underhållning.`,
    facts: [`Kategori: ${category?.label ?? categoryId}`, `Underkategori: ${subcategoryLabel}`, `Ungefärligt spelpris: ${priceSek.toLocaleString("sv-SE")} kr`],
    tags: [name, category?.label ?? "", subcategoryLabel].filter(Boolean).map((tag) => String(tag).toLowerCase()),
    featured: true,
  };
}

function generateCatalog(mode, categories) {
  const products = [];
  let globalIndex = 0;

  if (mode === "luxury") {
    curatedLuxury.forEach((entry, index) => products.push(createCuratedLuxuryProduct(entry, index)));
    globalIndex = products.length;
    tradingCards.forEach((entry, index) => products.push(createTradingCardProduct(entry, globalIndex + index)));
    globalIndex = products.length;
  } else {
    curatedEveryday.forEach((entry, index) => products.push(createCuratedEverydayProduct(entry, index)));
    globalIndex = products.length;
  }

  const countByCategory = new Map(categories.map((category) => [category.id, products.filter((product) => product.categoryId === category.id).length]));

  for (const category of categories) {
    const existing = countByCategory.get(category.id) ?? 0;
    const needed = PRODUCTS_PER_CATEGORY - existing;
    for (let index = 0; index < needed; index += 1) {
      products.push(makeGenericProduct({ mode, category, index: index + existing, globalIndex }));
      globalIndex += 1;
    }
  }

  if (products.length !== PRODUCTS_PER_MODE) {
    throw new Error(`${mode}: expected ${PRODUCTS_PER_MODE} products, got ${products.length}`);
  }

  return {
    version: 1,
    mode,
    generatedAt: "2026-07-02",
    productCount: products.length,
    categories: categories.map(({ id, label, description, subcategories }) => ({
      id,
      label,
      description,
      subcategories: subcategories.map((subcategory) => ({ id: slugify(subcategory), label: subcategory })),
    })),
    products,
  };
}

await mkdir(OUT_DIR, { recursive: true });
const luxuryCatalog = generateCatalog("luxury", luxuryCategories);
const everydayCatalog = generateCatalog("everyday", everydayCategories);

await writeFile(path.join(OUT_DIR, "catalog-luxury.json"), JSON.stringify(luxuryCatalog));
await writeFile(path.join(OUT_DIR, "catalog-everyday.json"), JSON.stringify(everydayCatalog));

async function writeIfMissing(filename, value) {
  try { await access(filename); }
  catch { await writeFile(filename, JSON.stringify(value, null, 2)); }
}

await writeIfMissing(path.join(OUT_DIR, "image-manifest.json"), { version: 1, generatedAt: "2026-07-02", images: [] });
await writeIfMissing(path.join(OUT_DIR, "image-review.json"), { version: 1, generatedAt: "2026-07-02", items: [] });

console.log(`Generated ${luxuryCatalog.productCount} luxury and ${everydayCatalog.productCount} everyday products.`);
