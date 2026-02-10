const defaultIcon = new L.Icon({
    iconUrl: 'https://vlrbeemaxxdqiczdxomd.supabase.co/storage/v1/object/public/events_images/pin.svg',
    iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] 
});

// --- DATA ---
const storeDataRaw = [
    { "title": "Dahab Coffee Koutoubia", "city": "Marrakech", "lat": 31.625330497129525, "lng": -7.991839957282228, "link": "https://maps.app.goo.gl/RrzuMhRtw1yQDv5g8" },
    { "title": "Dahab Coffee Oulfa", "city": "Casablanca", "lat": 33.54575281806339, "lng": -7.672964497743502, "link": "https://maps.app.goo.gl/bY6p6DryZKvR3uTd6" },
    { "title": "Dahab Coffee Moulay Thami Oulfa", "city": "Casablanca", "lat": 33.548765970290916, "lng": -7.700878162424797, "link": "https://maps.app.goo.gl/4K3FtQHULvdtwKrw6" },
    { "title": "Dahab Coffee Riad Oulfa", "city": "Casablanca", "lat": 33.557564655229235, "lng": -7.694883383656697, "link": "https://maps.app.goo.gl/K9haH4jp5s48mbeb9" },
    { "title": "Dahab Coffee Gauthier", "city": "Casablanca", "lat": 33.58890727844311, "lng": -7.632266240337804, "link": "https://maps.app.goo.gl/UEwcGy5aqz6W6Kak8" },
    { "title": "Dahab Coffee Bourgogne", "city": "Casablanca", "lat": 33.601138178120024, "lng": -7.6344207901033965, "link": "https://maps.app.goo.gl/mrKKQ4sN4UyUKgwW8" },
    { "title": "Dahab Coffee Mers Soultan", "city": "Casablanca", "lat": 33.589335960475815, "lng": -7.618960984344263, "link": "https://maps.app.goo.gl/buhZefVkXoGJ53yPA" },
    { "title": "Dahab Coffee Moad Bnu Jabal", "city": "Casablanca", "lat": 33.61163517386892, "lng": -7.512895350859037, "link": "https://maps.app.goo.gl/3aitCnZ6PT3muPFT9" },
    { "title": "Dahab Coffee Yakoub Al Mansour", "city": "Casablanca", "lat": 33.573707065617945, "lng": -7.645984528772746, "link": "https://maps.app.goo.gl/fidvF6uEa7H9r6M36" },
    { "title": "Dahab Coffee Bd.Yafa", "city": "Casablanca", "lat": 33.53235636424651, "lng": -7.610726062964938, "link": "https://maps.app.goo.gl/grs2f5DdwMGTg2xr5" },
    { "title": "Dahab Coffee 2 Mars", "city": "Casablanca", "lat": 33.56407718688965, "lng": -7.60916786798586, "link": "https://maps.app.goo.gl/SJuEgxaLexXVFUQw9" },
    { "title": "Dahab Coffee Makdad El Hrizi", "city": "Casablanca", "lat": 33.53930620685731, "lng": -7.570101254710053, "link": "https://maps.app.goo.gl/sZ331soRp2Cxzz5t5" },
    { "title": "Dahab Coffee Ibnou Nafiss", "city": "Casablanca", "lat": 33.58390158607418, "lng": -7.633798534818509, "link": "https://maps.app.goo.gl/dE1aikkqPrDeX5hU7" },
    { "title": "Dahab Coffee Derb Sultan", "city": "Casablanca", "lat": 33.56432613024035, "lng": -7.597657287658996, "link": "https://maps.app.goo.gl/2zujSABgidRpsEeL9" },
    { "title": "Dahab Coffee Bouskoura", "city": "Casablanca", "lat": 33.46275928513534, "lng": -7.6467487617525185, "link": "https://maps.app.goo.gl/z9xKbqrD94HTG5QT6" },
    { "title": "Dahab Coffee Anassi", "city": "Casablanca", "lat": 33.59256168625396, "lng": -7.49862372905452, "link": "https://maps.app.goo.gl/8KvQFzWvmZgEaQot8" },
    { "title": "Dahab Coffee Hassan", "city": "Rabat", "lat": 34.02135751884565, "lng": -6.826617486487418, "link": "https://maps.app.goo.gl/834S3WmB9yU2E7cw7" },
    { "title": "Dahab Coffee Yacoub Mansour G5", "city": "Rabat", "lat": 33.982334331145424, "lng": -6.880980831169899, "link": "https://maps.app.goo.gl/RzpEpMfkwHjM61AE8" },
    { "title": "Dahab Coffee Moulay Idriss I, Témara", "city": "Rabat", "lat": 33.93066268298171, "lng": -6.897327020176426, "link": "https://maps.app.goo.gl/xrkfeNqSQmsbHaaW6" },
    { "title": "Dahab Coffee Salé", "city": "Rabat", "lat": 33.99901223032349, "lng": -6.740233749386739, "link": "https://maps.app.goo.gl/stWihqDiVY6SfCpY6" },
    { "title": "Dahab Coffee Rte de Oualidia", "city": "El Jadida", "lat": 33.236861355850465, "lng": -8.533033687711358, "link": "https://maps.app.goo.gl/PEPPssk1VNjtiZeL6" },
    { "title": "Dahab Coffee Tariq Ibn Ziad", "city": "Kénitra", "lat": 34.261021035051456, "lng": -6.590464999947861, "link": "https://maps.app.goo.gl/3mb5tghwtQCHtVFH7" },
    { "title": "Dahab Coffee Omarou Bnou El As", "city": "Meknès", "lat": 33.89998918643524, "lng": -5.550315934270615, "link": "https://maps.app.goo.gl/NyiixdmrU5AMctXA7" },
    { "title": "Dahab Coffee Rouamzine", "city": "Meknès", "lat": 33.89440628856183, "lng": -5.560599152919367, "link": "https://maps.app.goo.gl/aL51tRFdb8NUyMz38" },
    { "title": "Dahab Coffee Zitoun", "city": "Meknès", "lat": 33.86838088643424, "lng": -5.549958167933158, "link": "https://maps.app.goo.gl/H5VUR25HwfmALAuz9" },
    { "title": "Dahab Coffee Manssour", "city": "Meknès", "lat": 33.869001772621445, "lng": -5.576669738481446, "link": "https://maps.app.goo.gl/Sh3XHG1UacjHirhT6" },
    { "title": "Dahab Coffee Ouisslan", "city": "Meknès", "lat": 33.91150001964709, "lng": -5.489444758393984, "link": "https://maps.app.goo.gl/fZEghscaAtysbvb2A" },
    { "title": "Dahab Coffee Mohamed El Kaghat", "city": "Fès", "lat": 34.042285137504415, "lng": -5.002078023530804, "link": "https://maps.app.goo.gl/xXg3xiTEgb2CYumW9" },
    { "title": "Dahab Coffee Ain Chkef", "city": "Fès", "lat": 34.00061314887665, "lng": -5.012238214442522, "link": "https://maps.app.goo.gl/8RwtnSF4sicPmbAB8" },
    { "title": "Dahab Coffee Saada", "city": "Fès", "lat": 34.01919665654241, "lng": -5.00665393550665, "link": "https://maps.app.goo.gl/aZrsHuB3UScHNSWdA" },
    { "title": "Dahab Coffee Benssouda", "city": "Fès", "lat": 34.01783302917841, "lng": -5.0531154101457405, "link": "https://maps.app.goo.gl/YAVurgC4Af2Ec16XA" },
    { "title": "Dahab Coffee Florence", "city": "Fès", "lat": 34.0422840342076, "lng": -5.002074285315565, "link": "https://maps.app.goo.gl/V36gX25nePQJHDQm6" },
    { "title": "Dahab Coffee Moulay Youssef", "city": "Tanger", "lat": 35.77009834164377, "lng": -5.8069912443049665, "link": "https://maps.app.goo.gl/Wjj5Tz7TCQh4fkfi7" },
    { "title": "Dahab Coffee Souk barra", "city": "Tanger", "lat": 35.7848300590716, "lng": -5.812997779222072, "link": "https://maps.app.goo.gl/N2jDZJtT1Au84hma9" },
    { "title": "Dahab Coffee Tarik Ibn Ziyad", "city": "Tanger", "lat": 35.76544296448769, "lng": -5.804981117206377, "link": "https://maps.app.goo.gl/6VDPmr9byKoh19rA6" },
    { "title": "Dahab Coffee Rte Rabat", "city": "Tanger", "lat": 35.72979946746347, "lng": -5.879604815851736, "link": "https://maps.app.goo.gl/4XjNw1A1DE36Lxx7A" },
    { "title": "Dahab Coffee Ahlan", "city": "Tanger", "lat": 35.74418298061026, "lng": -5.83213447173233, "link": "https://maps.app.goo.gl/QxRpR1ZDzmBhiEB59" },
    { "title": "Dahab Coffee Av Anfa", "city": "Tanger", "lat": 35.77031265925799, "lng": -5.824079952647788, "link": "https://maps.app.goo.gl/cb1ZMAobuv694Xtr8" },
    { "title": "Dahab Coffee Rue Hollande", "city": "Tanger", "lat": 35.780091787470624, "lng": -5.81452147544974, "link": "https://maps.app.goo.gl/9uGXEEi9ekyWXUT79" },
    { "title": "Dahab Coffee Mesnana", "city": "Tanger", "lat": 35.75630443313813, "lng": -5.852570417145933, "link": "https://maps.app.goo.gl/yYdm41aVZ9hbeA6Z7" },
    { "title": "Dahab Coffee Bendibane", "city": "Tanger", "lat": 35.758255468660515, "lng": -5.823230715430444, "link": "https://maps.app.goo.gl/ZbTZ6pvck46LazPs8" },
    { "title": "Dahab Coffee Bir Chifa", "city": "Tanger", "lat": 35.742888305319134, "lng": -5.82062556136179, "link": "https://maps.app.goo.gl/myumASVnv67uGNVv6" },
    { "title": "Dahab Coffee Aouama", "city": "Tanger", "lat": 35.73195955183185, "lng": -5.802586028578302, "link": "https://maps.app.goo.gl/EnFN6uMh3V9rMtmN6" },
    { "title": "Dahab Coffee El Ouarda", "city": "Tanger", "lat": 35.7550091626992, "lng": -5.819534448973765, "link": "https://maps.app.goo.gl/bgtuRHG95uZ2yghu7" },
    { "title": "Dahab Coffee Bni Ouriaghel", "city": "Tanger", "lat": 35.74628314951262, "lng": -5.829478740361482, "link": "https://maps.app.goo.gl/kgoYxf62Q5ByMZpVA" },
    { "title": "Dahab Coffee Mall Ibn batouta", "city": "Tanger", "lat": 35.777324789299406, "lng": -5.801860893542933, "link": "https://maps.app.goo.gl/rzq6dg6AXXXj5pxN8" },
    { "title": "Dahab Coffee Boukhalef Av moulay rachid", "city": "Tanger", "lat": 35.73330175630886, "lng": -5.881856086893182, "link": "https://maps.app.goo.gl/5UBr4QmkXBpLo9r57" },
    { "title": "Dahab Coffee Valfleuri Av moulay rachid", "city": "Tanger", "lat": 35.76413956176679, "lng": -5.837228074060651, "link": "https://maps.app.goo.gl/cp17rU42gZAtBHwD8" },
    { "title": "Dahab Coffee Branes Rue Hammadi Ameziane", "city": "Tanger", "lat": 35.75463428660158, "lng": -5.841113828104228, "link": "https://maps.app.goo.gl/kwUza1Lcg9GSxnBe9" },
    { "title": "Dahab Coffee Boulvard Rue allal ben abdellah", "city": "Tanger", "lat": 35.77842209474736, "lng": -5.807910037061208, "link": "https://maps.app.goo.gl/qVgSETjqJdi3zkom9" },
    { "title": "Dahab Coffee Kaouassim", "city": "Tanger", "lat": 35.76819620005296, "lng": -5.850665325483352, "link": "https://maps.app.goo.gl/HA6CUyc8NeFc3XSY6" },
    { "title": "Dahab Coffee Av Wahda", "city": "Tetouan", "lat": 35.57172632954448, "lng": -5.375589137887297, "link": "https://maps.app.goo.gl/d7A1kbkrYjEzXT3T9" },
    { "title": "Dahab Coffee Taboula", "city": "Tetouan", "lat": 35.5677320487805, "lng": -5.400038966732676, "link": "https://maps.app.goo.gl/yH73tLmKgWdGmC1c8" },
    { "title": "Dahab Coffee Hmama", "city": "Tetouan", "lat": 35.5708071408017, "lng": -5.386704800870409, "link": "https://maps.app.goo.gl/QHj2G3Txoh1T2zRb8" },
    { "title": "Dahab Coffee JAMAA MEZOUAK", "city": "Tetouan", "lat": 35.57603687052461, "lng": -5.396786735642266, "link": "https://maps.app.goo.gl/eEYmk7V9K4Ma5Ged6" },
    { "title": "Dahab Coffee DIOR HJAR", "city": "Tetouan", "lat": 35.5744339791979, "lng": -5.379748700410113, "link": "https://maps.app.goo.gl/M4pZUq94Gy6MohZm9" },
    { "title": "Dahab Coffee KASSABA", "city": "Tetouan", "lat": 35.57597698112648, "lng": -5.371526913864785, "link": "https://maps.app.goo.gl/Yz8yvx2mNgdvQMyv9" },
    { "title": "Dahab Coffee SEDRAOUIA", "city": "Tetouan", "lat": 35.58302413085219, "lng": -5.353862597541652, "link": "https://maps.app.goo.gl/LkHFk3oripU5omHx7" },
    { "title": "Dahab Coffee FAR", "city": "Tetouan", "lat": 35.573930512096844, "lng": -5.359989798740567, "link": "https://maps.app.goo.gl/CsStmsvEwU4Xg6vL7" },
    { "title": "Dahab Coffee BARID", "city": "Tetouan", "lat": 35.57240897968544, "lng": -5.354657213373597, "link": "https://maps.app.goo.gl/kRq6pCykvL4u7mN46" },
    { "title": "Dahab Coffee RETAHA", "city": "Tetouan", "lat": 35.57774366952562, "lng": -5.35745422813684, "link": "https://maps.app.goo.gl/ukAtC6CgDTuVT2AM8" },
    { "title": "Dahab Coffee KABOUL", "city": "Tetouan", "lat": 35.57989571943713, "lng": -5.351831392649068, "link": "https://maps.app.goo.gl/U5yfDevQGDZQVf3r5" },
    { "title": "Dahab Coffee SOUKNA O TAAMIR", "city": "Tetouan", "lat": 35.581107294618356, "lng": -5.344983523896055, "link": "https://maps.app.goo.gl/ZTKmJSXHaH7bG1Zz8" },
    { "title": "Dahab Coffee TRANKAT", "city": "Tetouan", "lat": 35.572176133465256, "lng": -5.369190090931889, "link": "https://maps.app.goo.gl/5TCUmmBFPTAAgpo86" },
    { "title": "Dahab Coffee BOUJARAH", "city": "Tetouan", "lat": 35.58683419524648, "lng": -5.356461269596468, "link": "https://maps.app.goo.gl/h59GKYvSGAvLrjVP8" },
    { "title": "Dahab Coffee WILAYA 1", "city": "Tetouan", "lat": 35.59258078675731, "lng": -5.33956164612811, "link": "https://maps.app.goo.gl/YRk8Eh8wyqttRb659" },
    { "title": "Dahab Coffee WILAYA 2", "city": "Tetouan", "lat": 35.589237398565885, "lng": -5.343947944395237, "link": "https://maps.app.goo.gl/9gb9t2yK6QFQuigR9" },
    { "title": "Dahab Coffee WILAYA CENTER", "city": "Tetouan", "lat": 35.586202264065534, "lng": -5.341708412487368, "link": "https://maps.app.goo.gl/T5Lmp13cpRq9Cfpb7" },
    { "title": "Dahab Coffee AV CASABLANCA", "city": "Tetouan", "lat": 35.56501046562096, "lng": -5.356460591187799, "link": "https://maps.app.goo.gl/knKZLyyUmcdNtS7g7" },
    { "title": "Dahab Coffee KOUILMA", "city": "Tetouan", "lat": 35.56492134083663, "lng": -5.347883730092026, "link": "https://maps.app.goo.gl/riMi5vv69W94huv87" },
    { "title": "Dahab Coffee MAHATTA", "city": "Tetouan", "lat": 35.561037346862946, "lng": -5.371666824485571, "link": "https://maps.app.goo.gl/RqhCXfeX6Nc4RgA99" },
    { "title": "Dahab Coffee MCQAWAMA", "city": "Tetouan", "lat": 35.56900587606194, "lng": -5.3725472488688135, "link": "https://maps.app.goo.gl/7cpBnrYYPPehFUCm8" },
    { "title": "Dahab Coffee Av Caire", "city": "Larache", "lat": 35.19420493352655, "lng": -6.152723616825032, "link": "https://maps.app.goo.gl/bjb8F2LdXQ44PuLA9" },
    { "title": "Dahab Coffee Av Chaaban", "city": "Larache", "lat": 35.1658671248548, "lng": -6.145301316997131, "link": "https://maps.app.goo.gl/9KTmjRiqXqR5A5Xw5" },
    { "title": "Dahab Coffee MIRAMAR", "city": "Martil", "lat": 35.62196318420415, "lng": -5.273673112882208, "link": "https://maps.app.goo.gl/dVmpPZ4MGrbQ2dZDA" },
    { "title": "Dahab Coffee COMESSARIA", "city": "Martil", "lat": 35.615691574878326, "lng": -5.273479792755274, "link": "https://maps.app.goo.gl/aCVwpcA7GkjrbtDdA" },
    { "title": "Dahab Coffee CATALAN", "city": "Martil", "lat": 35.61941895753652, "lng": -5.277319938500045, "link": "https://maps.app.goo.gl/ULgQiSU5ZYCSaYMS8" },
    { "title": "Dahab Coffee Av HASSAN 2", "city": "Martil", "lat": 35.61490504437656, "lng": -5.279533547230202, "link": "https://maps.app.goo.gl/6AAGvALXja9QJPNC6" },
    { "title": "Dahab Coffee CABONEGRO", "city": "Martil", "lat": 35.65570231422363, "lng": -5.291629077222295, "link": "https://maps.app.goo.gl/WDiSvM4brVfFGT3B7" },
    { "title": "Dahab Coffee M'DIQ 1", "city": "M'diq - Findeq", "lat": 35.68296628800547, "lng": -5.321696441789372, "link": "https://maps.app.goo.gl/qSTrATE88w1gxYyD9" },
    { "title": "Dahab Coffee M'DIQ 2", "city": "M'diq - Findeq", "lat": 35.68275946767517, "lng": -5.32679676827696, "link": "https://maps.app.goo.gl/2fzctDiePrk87Jkk6" },
    { "title": "Dahab Coffee FNIDEQ 1", "city": "M'diq - Findeq", "lat": 35.8414388090381, "lng": -5.357918976015204, "link": "https://maps.app.goo.gl/UxpaTmhX1XATyNbJ8" },
    { "title": "Dahab Coffee FNIDEQ 2", "city": "M'diq - Findeq", "lat": 35.85639521690038, "lng": -5.355081133181664, "link": "https://maps.app.goo.gl/SCLeM5nPVQhBu8989" },
    { "title": "Dahab Coffee CHEFCHAOUEN 1", "city": "Chefchaouen", "lat": 35.16728609457672, "lng": -5.2683813701821185, "link": "https://maps.app.goo.gl/7ZwnpJcuitpHwcDD9" },
    { "title": "Dahab Coffee CHEFCHAOUN 2", "city": "Chefchaouen", "lat": 35.17004777817817, "lng": -5.268817453960257, "link": "https://maps.app.goo.gl/tiEQgHDo7W4jnYiq9" },
    { "title": "Dahab Coffee Laayoune", "city": "Laayoune", "lat": 27.13839025023631, "lng": -13.173242300917325, "link": "https://maps.app.goo.gl/k9kFDvw2f6w1BxKYA" },
    { "title": "Dahab Coffee Boulevard Bir Anzarane", "city": "Casablanca", "lat": 33.58115220768561, "lng": -7.638543248051368, "link": "https://maps.app.goo.gl/mRTwcsCwq3gYnv977" },
    { "title": "Dahab Coffee le vallon", "city": "Kénitra", "lat": 34.26472415745906, "lng": -6.60341416366318, "link": "https://maps.app.goo.gl/8Zyo3EaSXw3BhteS7" },
    { "title": "Dahab Coffee Tamgnounte", "city": "Béni Mellal", "lat": 32.332398697444034, "lng": -6.352979083313408, "link": "https://maps.app.goo.gl/TvdzMsBdbJz6RZeb7" },
    { "title": "Dahab Coffee oqba ibn nafi", "city": "Al Hoceima", "lat": 35.241270784402964, "lng": -3.928632080073603, "link": "https://maps.app.goo.gl/jWPYYWoubZmZV73LA" },
    { "title": "Dahab Coffee Iqbal", "city": "Khouribga", "lat": 32.88572495764074, "lng": -6.904655387396711, "link": "https://maps.app.goo.gl/cECzCDVaVcPbkRMq6" },
    { "title": "Dahab Coffee Av. Hassan II", "city": "El Jadida", "lat": 33.25122228983147, "lng": -8.504942964498412, "link": "https://maps.app.goo.gl/VAdp2fw92YcxB2GQ6" },
    { "title": "Dahab Coffee Aharrarine", "city": "Tanger", "lat": 35.72914158401006, "lng": -5.840580351887783, "link": "https://maps.app.goo.gl/MkW2Tm5wTW5oyb339" },
    { "title": "Dahab Coffee Av Salam", "city": "Al Hoceima", "lat": 35.24430139855911, "lng": -3.930216476518207, "link": "https://maps.app.goo.gl/WSW4BxYd99tJm5w98" }
];

// --- MAP STATE ---
let storeData = storeDataRaw; 
let userLocation = null;
let userMarker = null;
let markersMap = {}; 

// --- MAP INIT ---
const map = L.map('map', { 
    zoomControl: false,
    minZoom: 5,  
}).setView([31.7917, -7.0926], 5); 

L.control.zoom({ position: 'topleft' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { 
    attribution: '© CARTO', 
    maxZoom: 20
}).addTo(map);

// --- LOGIC ---
document.getElementById('locator-capsule').onclick = toggleLocation;

function toggleLocation() {
    const panel = document.getElementById('closest-panel');
    const capsule = document.getElementById('locator-capsule');
    
    if(userLocation) {
        // OFF
        userLocation = null;
        document.getElementById('locate-text').innerText = "Trouver mon café Dahab";
        document.getElementById('locate-btn').classList.remove('active');
        capsule.classList.remove('locating');
        panel.classList.remove('visible'); 
        
        if(userMarker) map.removeLayer(userMarker);
        map.setView([31.7917, -7.0926], 6);
    } else {
        // ON - Start Loading
        document.getElementById('locate-text').innerText = "Finding your coffee...";
        capsule.classList.add('locating'); 
        
        // 1. Show Panel Immediately with SKELETON
        showSkeletonLoader();
        panel.classList.add('visible');

        // 2. Start Geolocate
        map.locate({setView: true, maxZoom: 14});
    }
}

map.on('locationfound', function(e) {
    userLocation = e.latlng;
    document.getElementById('locate-text').innerText = "Arrêter";
    document.getElementById('locate-btn').classList.add('active');
    document.getElementById('locator-capsule').classList.remove('locating');

    if(userMarker) map.removeLayer(userMarker);

    userMarker = L.circleMarker(e.latlng, { radius: 8, fillColor: '#C59D5F', color: '#fff', weight: 3, fillOpacity: 1 }).addTo(map).bindPopup("Vous êtes ici");
    
    // Artificial delay to show off the skeleton
    setTimeout(() => {
        findClosestStores(e.latlng);
    }, 800); 
});

map.on('locationerror', function() {
    alert("Could not access your location.");
    toggleLocation();
});

// --- SKELETON LOADER ---
function showSkeletonLoader() {
    const listContainer = document.getElementById('closest-list');
    listContainer.innerHTML = Array(3).fill('').map(() => `
        <div class="skeleton-item">
            <div class="store-item-info">
                <div class="skeleton-block sk-name"></div>
                <div class="skeleton-block sk-dist"></div>
            </div>
            <div class="skeleton-block sk-arrow"></div>
        </div>
    `).join('');
}

function findClosestStores(userLatLng) {
    const storesWithDist = storeData.map((store, index) => {
        const dist = map.distance(userLatLng, [store.lat, store.lng]);
        return { ...store, dist, originalIndex: index };
    });

    storesWithDist.sort((a, b) => a.dist - b.dist);
    const closest3 = storesWithDist.slice(0, 3);

    const listContainer = document.getElementById('closest-list');
    listContainer.innerHTML = ''; 

    closest3.forEach(store => {
        const distText = store.dist >= 1000 ? (store.dist / 1000).toFixed(1) + " km" : Math.round(store.dist) + " m";

        const div = document.createElement('div');
        div.className = 'store-list-item';
        div.innerHTML = `
            <div class="store-item-info">
                <div class="store-item-name">${store.title}</div>
                <div class="store-item-dist">
                    <span class="steam-icon">♨</span> 
                    ${distText}
                </div>
            </div>
            <div class="store-arrow">›</div>
        `;
        
        div.onclick = () => zoomToStore(store);
        listContainer.appendChild(div);
    });