/* ==========================================================================
   Dreamspree — Centralised demo data
   --------------------------------------------------------------------------
   Everything on the prototype that looks like a product (packages, prices,
   departures, visa checklists, stories) lives here so it is easy to edit.
   ALL PRICES, DATES, SEATS AND POLICIES ARE ILLUSTRATIVE SAMPLE DATA.
   Images are freely usable Unsplash photos referenced by ID so they can be
   swapped for licensed Dreamspree photography later.
   ========================================================================== */
window.DS = window.DS || {};

(function (DS) {
  'use strict';

  /* ---------- Image helper ---------- */
  const UNSPLASH = 'https://images.unsplash.com/photo-';
  DS.img = function (id, w, h) {
    w = w || 1200; h = h || Math.round(w * 0.7);
    return `${UNSPLASH}${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format`;
  };
  // Named image library (replace IDs here to re-skin the prototype)
  DS.images = {
    hero: '1518509562904-e7ef99cdcc86',
    heroVisa: '1517400508447-f8dd518b86db',
    heroExplore: '1516690561799-46d8f74f9abf',
    heroAbout: '1522202176988-66273c2fd55f',
    heroTrip: '1488646953014-85cb44e25828',
    consultant: '1520333789090-1afc82db536a',
    team: '1521737604893-d14cc237f11d',
    office: '1542744173-8e7e53415bb0',
    airport: '1530521954074-e64f6810b32d',
    flightWing: '1436491865332-7a61a109cc05',
    clouds: '1500835556837-99ac94a94552',
    hotelPool: '1566073771259-6a8506099945',
    hotelResort: '1520250497591-112f2f40a3f4',
    cruise: '1548574505-5e239809ee19',
    van: '1469854523086-cc02fe5d8800',
    documents: '1554224155-6726b3ff858f',
    signing: '1450101499163-c8848c66ca85',
    planning: '1452421822248-d4c2b47f0c81',
    packing: '1504609773096-104ff2c73ba4',
    walker: '1527631746610-bca00a040d60',
    hiker: '1503220317375-aaad61436b1b',
    balloons: '1530789253388-582c481c54b0',
    beachSunset: '1507525428034-b723cf961d3e',
    venice: '1523906834658-6e24ef2386f9',
    cinque: '1516483638261-f4dbaf036963',
    barcelona: '1583422409516-2895a77efded'
  };

  /* ---------- Company (from the existing site) ---------- */
  DS.company = {
    name: 'Dreamspree Travel & Tours',
    founded: 2014,
    phones: ['+63 917 563 9499', '+63 917 145 9661'],
    email: 'info@dreamspreetravel.com',
    address: 'Seascape Village, CCP Complex, Atang dela Rama, Pasay City, Philippines 1300',
    hours: 'Monday to Friday, 9:00 AM – 7:00 PM',
    facebook: 'https://facebook.com/dreamspreetravel'
  };

  /* ---------- Services (search tabs + homepage grid) ---------- */
  DS.services = [
    { id: 'tours', name: 'Tours & Packages', short: 'Packages', icon: 'compass', image: '1518509562904-e7ef99cdcc86', blurb: 'Curated domestic and international itineraries with transparent inclusions.', flow: 'packages' },
    { id: 'visa', name: 'Visa Assistance', short: 'Visa', icon: 'passport', image: '1517400508447-f8dd518b86db', blurb: 'Guided checklists and consultant support from application to approval.', flow: 'visa' },
    { id: 'flights', name: 'Flights', short: 'Flights', icon: 'plane', image: '1436491865332-7a61a109cc05', blurb: 'Domestic and international fares booked by a consultant who knows your whole trip.', flow: 'enquiry' },
    { id: 'hotels', name: 'Hotels', short: 'Hotels', icon: 'bed', image: '1566073771259-6a8506099945', blurb: 'Hand-picked 3 to 5-star stays, resorts and vacation rentals.', flow: 'enquiry' },
    { id: 'transport', name: 'Private Transportation', short: 'Transport', icon: 'car', image: '1469854523086-cc02fe5d8800', blurb: 'Vetted vehicles and drivers for transfers, day trips and group tours.', flow: 'enquiry' },
    { id: 'cruises', name: 'Cruises', short: 'Cruises', icon: 'ship', image: '1548574505-5e239809ee19', blurb: 'Cruise itineraries with personalised pre- and post-cruise planning.', flow: 'enquiry' },
    { id: 'insurance', name: 'Travel Insurance', short: 'Insurance', icon: 'shield', image: '1554224155-6726b3ff858f', blurb: 'Comprehensive cover explained in plain language before you fly.', flow: 'enquiry' },
    { id: 'corporate', name: 'Corporate Travel', short: 'Corporate', icon: 'briefcase', image: '1542744173-8e7e53415bb0', blurb: 'Structured group and business travel with a dedicated consultant.', flow: 'enquiry' }
  ];

  /* ---------- Destinations ---------- */
  DS.destinations = [
    { id: 'japan', airport: 'NRT', name: 'Japan', country: 'Japan', type: 'international', region: 'East Asia', tagline: 'Temples, neon and the quiet in between', blurb: 'Cherry blossoms in Kyoto, Shibuya at night and a bullet train in between. Visa required for Philippine passport holders.', image: '1526481280693-3bfa7568e0f3', visa: 'required', bestTime: 'Mar–May · Oct–Nov' },
    { id: 'south-korea', airport: 'ICN', name: 'South Korea', country: 'South Korea', type: 'international', region: 'East Asia', tagline: 'Palaces by day, Hongdae by night', blurb: 'Seoul’s hanok villages, street food markets and K-culture, with Nami Island a short drive away.', image: '1538669715315-155098f0fb1d', visa: 'required', bestTime: 'Apr–Jun · Sep–Nov' },
    { id: 'taiwan', airport: 'TPE', name: 'Taiwan', country: 'Taiwan', type: 'international', region: 'East Asia', tagline: 'Night markets and mountain tea', blurb: 'Taipei 101, Jiufen’s lantern-lit lanes and the best night-market food in Asia.', image: '1470004914212-05527e49370b', visa: 'check', bestTime: 'Oct–Apr' },
    { id: 'hong-kong', airport: 'HKG', name: 'Hong Kong', country: 'Hong Kong SAR', type: 'international', region: 'East Asia', tagline: 'Skyline, dim sum and Disneyland', blurb: 'A short flight from Manila with Victoria Peak, the Star Ferry and a family day at Disneyland.', image: '1536599018102-9f803c140fc1', visa: 'visa-free', bestTime: 'Oct–Dec' },
    { id: 'vietnam', airport: 'HAN', name: 'Vietnam', country: 'Vietnam', type: 'international', region: 'Southeast Asia', tagline: 'Ha Long Bay to Hoi An lanterns', blurb: 'Limestone bays, Hanoi’s Old Quarter and the lantern town of Hoi An. Visa-free for short Filipino visits.', image: '1528127269322-539801943592', visa: 'visa-free', bestTime: 'Nov–Apr' },
    { id: 'boracay', airport: 'MPH', name: 'Boracay', country: 'Philippines', type: 'domestic', region: 'Visayas', tagline: 'White Beach, rebooted', blurb: 'Four kilometres of powder-white sand, calmer since the island’s rehabilitation, with sunset sails and island hopping.', image: '1519046904884-53103b34b206', visa: 'none', bestTime: 'Nov–May' },
    { id: 'palawan', airport: 'ENI', name: 'Palawan', country: 'Philippines', type: 'domestic', region: 'Mimaropa', tagline: 'Lagoons that look unreal', blurb: 'El Nido’s hidden lagoons and Coron’s wreck dives, both reachable on a short hop from Manila.', image: '1518509562904-e7ef99cdcc86', visa: 'none', bestTime: 'Dec–May' },
    { id: 'siargao', airport: 'IAO', name: 'Siargao', country: 'Philippines', type: 'domestic', region: 'Mindanao', tagline: 'Surf town with a slow heartbeat', blurb: 'Cloud 9, the Magpupungko rock pools and island hopping to Naked, Daku and Guyam.', image: '1505118380757-91f5f5632de0', visa: 'none', bestTime: 'Mar–Oct' },
    { id: 'cebu', airport: 'CEB', name: 'Cebu', country: 'Philippines', type: 'domestic', region: 'Visayas', tagline: 'Waterfalls, sardines and lechon', blurb: 'Kawasan canyoneering, the Moalboal sardine run and the Queen City’s heritage, all in one trip.', image: '1433086966358-54859d0ed716', visa: 'none', bestTime: 'Jan–May' },
    { id: 'bohol', airport: 'TAG', name: 'Bohol', country: 'Philippines', type: 'domestic', region: 'Visayas', tagline: 'Chocolate Hills and Panglao calm', blurb: 'Countryside tours past the Chocolate Hills and tarsiers, then quiet beach days on Panglao.', image: '1540202404-a2f29016b523', visa: 'none', bestTime: 'Dec–May' }
  ];

  /* ---------- Shared policy snippets ---------- */
  const POLICY_INTL = 'Sample policy: a deposit reserves your slot and is refundable less supplier costs up to 45 days before departure. Within 45 days, cancellations are subject to airline and hotel terms. Visa refusals are handled case by case; ask your consultant about the visa-refusal option before booking.';
  const POLICY_DOM = 'Sample policy: a deposit reserves your slot and is refundable less supplier costs up to 21 days before departure. Within 21 days, cancellations are subject to airline, ferry and resort terms. Weather cancellations by the Coast Guard are rebooked free of charge.';

  const FAQ_INTL = [
    { q: 'Is airfare included?', a: 'Yes, unless the package says “land only”. Fares are quoted economy class from Manila and firm up when you confirm your dates.' },
    { q: 'Can Dreamspree handle my visa?', a: 'Yes. Your consultant prepares the checklist, reviews your documents and books the application appointment. Run the Visa Readiness Checker for an early view of what you will need.' },
    { q: 'Can we customise the itinerary?', a: 'Absolutely. Every package is a starting point. Tell your consultant what to add or drop and you will get a revised quotation.' },
    { q: 'What if we are a group?', a: 'Groups of 10 or more get a dedicated coordinator and adjusted group pricing. Request a quotation with your headcount.' }
  ];
  const FAQ_DOM = [
    { q: 'Are flights included?', a: 'Yes, round-trip domestic flights from Manila are part of this package unless marked “land only”.' },
    { q: 'What happens if the weather turns?', a: 'Island hopping follows Coast Guard advisories. If a boat day is cancelled, we rebook it or refund the activity portion.' },
    { q: 'Can we add extra nights?', a: 'Yes. Extra nights at the same resort are quoted on request.' },
    { q: 'Is this good for families?', a: 'Most domestic packages are family friendly. Mention children’s ages and your consultant will adjust activities and pricing.' }
  ];

  /* ---------- Packages ----------
     priceFrom is optional. Set it to null when a package should not show a price:
     cards, the package page and the Travel Cart then show "Price on request".
     validUntil is the last date the package can depart (sample). Departures after it
     are hidden, and custom dates cannot go past it. Each departure ends after
     duration.nights, so the site shows it as a date range.
     airport is the arrival airport used to pre-fill flight requests. */
  DS.packages = [
    {
      id: 'jp-golden-route', validUntil: '2027-11-30', airport: 'NRT', title: 'Tokyo, Hakone & Kyoto: The Golden Route', destinationId: 'japan', destination: 'Japan', country: 'Japan', type: 'international', region: 'East Asia',
      category: 'Culture', duration: { days: 6, nights: 5 }, priceFrom: 78900, childRate: 0.85, groupSize: 'Private, 2 to 12 travellers',
      images: ['1526481280693-3bfa7568e0f3', '1493976040374-85c8e12f0c0e', '1549693578-d683be217e58', '1578469645742-46cae010e5d4', '1492571350019-22de08371fd3'],
      summary: 'The classic first Japan trip, done properly: two nights in Tokyo, a Fuji-view onsen night in Hakone and two nights in Kyoto, linked by the Shinkansen.',
      highlights: ['Shibuya Crossing and teamLab Planets', 'Lake Ashi cruise with Mt Fuji views', 'Ryokan stay with kaiseki dinner', 'Fushimi Inari before the crowds', 'Reserved Shinkansen seats'],
      inclusions: ['Round-trip economy airfare Manila–Tokyo / Osaka–Manila', '5 nights accommodation (4-star hotels + 1 ryokan)', 'Daily breakfast and one kaiseki dinner', 'Shinkansen tickets Tokyo–Odawara and Odawara–Kyoto', 'Hakone Free Pass', 'Private airport transfers', 'Visa application assistance and appointment booking', 'Travel insurance (basic plan)'],
      exclusions: ['Japan visa fee', 'Lunches and most dinners', 'Attraction tickets not listed', 'Personal expenses and tips', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Tokyo', desc: 'Private transfer to your Shinjuku hotel. Evening walk through Omoide Yokocho for your first yakitori.', items: ['Flight MNL–NRT (sample morning departure)', 'Hotel check-in from 3 PM', 'Shinjuku orientation walk'] },
        { day: 2, title: 'Tokyo east and west', desc: 'Meiji Shrine and Harajuku in the morning, Shibuya Crossing at golden hour and teamLab Planets after dark.', items: ['Meiji Jingu and Takeshita Street', 'Shibuya Sky (optional)', 'teamLab Planets timed entry'] },
        { day: 3, title: 'Hakone onsen night', desc: 'Romancecar to Hakone, the ropeway over Owakudani, a Lake Ashi cruise and a ryokan night with kaiseki dinner.', items: ['Hakone Free Pass activated', 'Lake Ashi sightseeing cruise', 'Kaiseki dinner and private onsen slot'] },
        { day: 4, title: 'Shinkansen to Kyoto', desc: 'Reserved seats to Kyoto by noon. Afternoon in Gion and Higashiyama, dinner along Pontocho alley.', items: ['Shinkansen Odawara–Kyoto', 'Kiyomizu-dera and Sannenzaka', 'Gion evening walk'] },
        { day: 5, title: 'Fushimi Inari and Arashiyama', desc: 'An early start up the torii gates, then the bamboo grove and Tenryu-ji. Free evening.', items: ['Fushimi Inari at sunrise', 'Arashiyama bamboo grove', 'Nishiki Market lunch'] },
        { day: 6, title: 'Depart from Osaka', desc: 'Transfer to Kansai Airport for your flight home.', items: ['Private transfer KIX', 'Flight KIX–MNL'] }
      ],
      accommodation: 'Sample hotels: Hotel Gracery Shinjuku or similar (Tokyo), Hakone Yunohana Prince or similar ryokan (Hakone), Mitsui Garden Kyoto Shijo or similar (Kyoto). Final hotels confirmed on booking.',
      preparation: ['Japan tourist visa: allow 4 to 6 weeks for appointment and processing', 'Passport valid for at least 6 months beyond travel', 'Suica or Pasmo card set up on your phone before arrival', 'Layers: Kyoto mornings are cool even in spring'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-03-18', note: 'Cherry-blossom window' }, { date: '2027-04-08', note: 'Late sakura' }, { date: '2027-10-21', note: 'Early autumn colours' }, { date: '2027-11-18', note: 'Peak autumn' }],
      visaNote: 'Visa required. Dreamspree prepares your checklist and books the appointment.'
    },
    {
      id: 'jp-osaka-family', validUntil: '2027-12-31', airport: 'KIX', title: 'Osaka, Nara & Universal Studios Family Break', destinationId: 'japan', destination: 'Japan', country: 'Japan', type: 'international', region: 'East Asia',
      category: 'Family', duration: { days: 5, nights: 4 }, priceFrom: 64500, childRate: 0.8, groupSize: 'Private, 2 to 10 travellers',
      images: ['1590559899731-a382839e5549', '1578637387939-43c525550085', '1493780474015-ba834fd0ce2f', '1524413840807-0c3cb6fa808d'],
      summary: 'A relaxed, kid-paced Kansai trip: Universal Studios with Express Passes, deer feeding in Nara, Osaka Castle and a day trip to Kyoto.',
      highlights: ['Universal Studios Japan with Express Pass', 'Nara Park deer and Todai-ji', 'Dotonbori street food night', 'Kyoto day trip by train', 'Family rooms throughout'],
      inclusions: ['Round-trip economy airfare Manila–Osaka', '4 nights family rooms at a 4-star hotel near Namba', 'Daily breakfast', 'Universal Studios 1-day ticket with Express Pass 4', 'Kansai Thru Pass (2 days)', 'Private airport transfers', 'Visa application assistance for the whole family', 'Travel insurance (basic plan)'],
      exclusions: ['Japan visa fees', 'Lunches and dinners', 'Osaka Castle and other entrance fees', 'Personal expenses', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Osaka', desc: 'Transfer to Namba. Dotonbori for takoyaki and the Glico sign.', items: ['Flight MNL–KIX', 'Dotonbori evening walk'] },
        { day: 2, title: 'Universal Studios Japan', desc: 'A full park day with Express Passes for Super Nintendo World and the Wizarding World.', items: ['Express Pass 4 timed entries', 'Park open to close'] },
        { day: 3, title: 'Nara day trip', desc: 'Feed the deer in Nara Park, see the Great Buddha and return for a free evening.', items: ['Kintetsu train to Nara', 'Todai-ji and Kasuga Taisha'] },
        { day: 4, title: 'Kyoto highlights', desc: 'Kinkaku-ji, the Arashiyama bamboo grove and a kimono photo stop in Gion.', items: ['Kinkaku-ji', 'Arashiyama monkey park (optional)', 'Gion walk'] },
        { day: 5, title: 'Osaka Castle and departure', desc: 'Morning at Osaka Castle park before your transfer to the airport.', items: ['Osaka Castle', 'Transfer to KIX', 'Flight KIX–MNL'] }
      ],
      accommodation: 'Sample hotel: Cross Hotel Osaka or similar, family quad rooms. Final hotel confirmed on booking.',
      preparation: ['Visa applications for each family member, including children', 'Stroller-friendly routes are flagged in your itinerary', 'Book Express Passes at least 3 weeks ahead in peak season'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-04-01', note: 'Holy Week break' }, { date: '2027-05-13', note: 'Summer break' }, { date: '2027-12-20', note: 'Christmas lights' }],
      visaNote: 'Visa required for every traveller, including children.'
    },
    {
      id: 'kr-seoul-nami', validUntil: '2027-12-15', airport: 'ICN', title: 'Seoul City & Nami Island Escape', destinationId: 'south-korea', destination: 'South Korea', country: 'South Korea', type: 'international', region: 'East Asia',
      category: 'Culture', duration: { days: 5, nights: 4 }, priceFrom: null, childRate: 0.85, groupSize: 'Join-in, up to 20 travellers',
      images: ['1538669715315-155098f0fb1d', '1583833008338-31a6657917ab', '1517154421773-0529f29ea451', '1548115184-bc6544d06a58', '1534274867514-d5b47ef89ed7'],
      summary: 'Palaces, markets and a hanbok morning in Seoul, plus a full-day trip to Nami Island and the Garden of Morning Calm.',
      highlights: ['Gyeongbokgung in hanbok', 'Nami Island and Petite France', 'Myeongdong street food crawl', 'N Seoul Tower at sunset', 'Hongdae free evening'],
      inclusions: ['Round-trip economy airfare Manila–Seoul', '4 nights at a 4-star hotel in Myeongdong', 'Daily breakfast', 'Nami Island day tour with transport and entrance', 'Hanbok rental (2 hours)', 'T-money card with starter credit', 'Shared airport transfers', 'Korea visa assistance', 'Travel insurance (basic plan)'],
      exclusions: ['Korea visa fee', 'Most meals', 'N Seoul Tower cable car and observatory', 'Personal expenses', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Seoul', desc: 'Transfer to Myeongdong and a street-food evening.', items: ['Flight MNL–ICN', 'Myeongdong night market'] },
        { day: 2, title: 'Palaces and Bukchon', desc: 'Gyeongbokgung changing of the guard in hanbok, Bukchon Hanok Village and Insadong tea.', items: ['Hanbok rental', 'Gyeongbokgung', 'Bukchon and Insadong'] },
        { day: 3, title: 'Nami Island day trip', desc: 'Ferry to Nami Island, lunch, then Petite France and the Garden of Morning Calm.', items: ['Coach departs 8 AM', 'Nami Island ferry', 'Garden of Morning Calm'] },
        { day: 4, title: 'Namsan and Hongdae', desc: 'N Seoul Tower at sunset, then a free night in Hongdae.', items: ['Namsan cable car', 'Hongdae free evening'] },
        { day: 5, title: 'Depart', desc: 'Last-minute shopping in Myeongdong before the airport transfer.', items: ['Transfer to ICN', 'Flight ICN–MNL'] }
      ],
      accommodation: 'Sample hotel: Nine Tree Premier Myeongdong II or similar. Final hotel confirmed on booking.',
      preparation: ['Korea visa: allow 3 to 5 weeks; bank certificate and ITR usually required', 'Download Naver Map; Google Maps is limited in Korea', 'K-ETA is not required with a valid visa'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-04-09', note: 'Spring blossoms' }, { date: '2027-10-15', note: 'Autumn foliage' }, { date: '2027-12-03', note: 'First snow season' }],
      visaNote: 'Visa required. Group visa processing available for 5 or more travellers.'
    },
    {
      id: 'tw-taipei-jiufen', validUntil: '2027-11-30', airport: 'TPE', title: 'Taipei, Jiufen & Night Markets', destinationId: 'taiwan', destination: 'Taiwan', country: 'Taiwan', type: 'international', region: 'East Asia',
      category: 'Leisure', duration: { days: 4, nights: 3 }, priceFrom: 32900, childRate: 0.85, groupSize: 'Private, 2 to 8 travellers',
      images: ['1470004914212-05527e49370b', '1508248467877-aec1b08de376', '1552993873-0dd1110e025f', '1598935898639-81586f7d2129'],
      summary: 'A long-weekend Taipei trip: Taipei 101, a Jiufen and Shifen day with sky lanterns, and nightly market crawls.',
      highlights: ['Taipei 101 observatory', 'Jiufen old street at dusk', 'Shifen sky lantern', 'Raohe and Shilin night markets', 'Beitou hot springs (optional)'],
      inclusions: ['Round-trip economy airfare Manila–Taipei', '3 nights at a 3-star boutique hotel in Ximending', 'Daily breakfast', 'Jiufen, Shifen and Yehliu day tour', 'Taipei 101 observatory ticket', 'EasyCard with starter credit', 'Shared airport transfers', 'Entry requirement guidance', 'Travel insurance (basic plan)'],
      exclusions: ['Meals not listed', 'Beitou hot spring entry', 'Personal expenses', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Taipei', desc: 'Transfer to Ximending, Longshan Temple, then Raohe Night Market.', items: ['Flight MNL–TPE', 'Raohe Night Market'] },
        { day: 2, title: 'Yehliu, Shifen and Jiufen', desc: 'Queen’s Head at Yehliu, a sky lantern in Shifen and Jiufen’s tea houses at dusk.', items: ['Day tour 8 AM–8 PM', 'Shifen lantern included'] },
        { day: 3, title: 'Taipei city day', desc: 'Chiang Kai-shek Memorial, Taipei 101 observatory and Shilin Night Market.', items: ['CKS Memorial Hall', 'Taipei 101', 'Shilin Night Market'] },
        { day: 4, title: 'Depart', desc: 'Free morning in Ximending before your transfer.', items: ['Transfer to TPE', 'Flight TPE–MNL'] }
      ],
      accommodation: 'Sample hotel: Cho Hotel Ximending or similar. Final hotel confirmed on booking.',
      preparation: ['Confirm current Taiwan entry rules for Philippine passport holders before booking; your consultant checks the latest advisory', 'Passport valid for 6 months', 'Light rain jacket: Jiufen is often misty'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-02-12', note: 'Lantern Festival period' }, { date: '2027-06-11', note: 'Independence Day long weekend' }, { date: '2027-11-26', note: 'Cool season' }],
      visaNote: 'Entry rules change. Your consultant confirms whether a visa or travel authorisation applies to your dates.'
    },
    {
      id: 'hk-disney-family', validUntil: '2027-12-31', airport: 'HKG', title: 'Hong Kong Disneyland & City Lights', destinationId: 'hong-kong', destination: 'Hong Kong', country: 'Hong Kong SAR', type: 'international', region: 'East Asia',
      category: 'Family', duration: { days: 4, nights: 3 }, priceFrom: 36900, childRate: 0.8, groupSize: 'Private, 2 to 10 travellers',
      images: ['1536599018102-9f803c140fc1', '1507941097613-9f2157b69235', '1583417319070-4a69db38a482'],
      summary: 'The easiest first international trip for families: a full Disneyland day, Victoria Peak, the Star Ferry and a dim sum lunch, two hours from Manila.',
      highlights: ['Hong Kong Disneyland 1-day ticket', 'Peak Tram and Sky Terrace', 'Star Ferry crossing', 'Symphony of Lights', 'Dim sum lunch included'],
      inclusions: ['Round-trip economy airfare Manila–Hong Kong', '3 nights at a 4-star hotel in Tsim Sha Tsui', 'Daily breakfast', 'Disneyland 1-day ticket', 'Peak Tram Sky Pass', 'Octopus card with starter credit', 'Private airport transfers', 'Travel insurance (basic plan)'],
      exclusions: ['Meals not listed', 'Ngong Ping cable car (optional add-on)', 'Personal expenses', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Hong Kong', desc: 'Transfer to Tsim Sha Tsui. Evening Symphony of Lights from the harbourfront.', items: ['Flight MNL–HKG', 'Avenue of Stars'] },
        { day: 2, title: 'Disneyland', desc: 'Open-to-close park day with the fireworks finale.', items: ['MTR to Disneyland Resort', 'Park ticket included'] },
        { day: 3, title: 'Peak, ferry and dim sum', desc: 'Peak Tram and Sky Terrace, Star Ferry to Central, dim sum lunch, Temple Street night market.', items: ['Peak Tram Sky Pass', 'Dim sum lunch', 'Temple Street'] },
        { day: 4, title: 'Depart', desc: 'Free morning before your transfer.', items: ['Transfer to HKG', 'Flight HKG–MNL'] }
      ],
      accommodation: 'Sample hotel: Hotel Panorama by Rhombus or similar, family rooms. Final hotel confirmed on booking.',
      preparation: ['Philippine passport holders can enter visa-free for short stays; confirm current rules before travel', 'Pre-register the Disneyland date on the park app', 'Octopus cards work on nearly all transport'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-03-26', note: 'Holy Week break' }, { date: '2027-05-20', note: 'Summer break' }, { date: '2027-10-29', note: 'Halloween at the park' }, { date: '2027-12-17', note: 'Christmas at the park' }],
      visaNote: 'Visa-free for short visits on a Philippine passport. Your consultant confirms the latest entry rules.'
    },
    {
      id: 'vn-hanoi-halong', validUntil: '2027-11-30', airport: 'HAN', title: 'Hanoi & Ha Long Bay Overnight Cruise', destinationId: 'vietnam', destination: 'Vietnam', country: 'Vietnam', type: 'international', region: 'Southeast Asia',
      category: 'Adventure', duration: { days: 5, nights: 4 }, priceFrom: 38900, childRate: 0.85, groupSize: 'Join-in, up to 16 travellers',
      images: ['1528127269322-539801943592', '1555921015-5532091f6026', '1557750255-c76072a7aad1'],
      summary: 'Hanoi’s Old Quarter and egg coffee, a Ninh Binh boat day through limestone karsts and a night on a Ha Long Bay cruise.',
      highlights: ['Overnight Ha Long Bay cruise with cabin', 'Ninh Binh sampan ride at Trang An', 'Hanoi street-food tour', 'Train Street coffee', 'Visa-free entry for Filipinos'],
      inclusions: ['Round-trip economy airfare Manila–Hanoi', '3 nights at a 3-star hotel in the Old Quarter', '1 night overnight cruise with cabin and all cruise meals', 'Daily breakfast', 'Ninh Binh day tour with lunch', 'Hanoi street-food walking tour', 'Shared airport transfers', 'Travel insurance (basic plan)'],
      exclusions: ['Meals not listed', 'Kayak rental on the cruise', 'Personal expenses', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Hanoi', desc: 'Old Quarter check-in and an evening street-food tour.', items: ['Flight MNL–HAN', 'Street-food tour 6 PM'] },
        { day: 2, title: 'Ninh Binh', desc: 'Trang An boat ride, Mua Cave viewpoint and Bai Dinh Pagoda.', items: ['Day tour with lunch', 'Trang An sampan'] },
        { day: 3, title: 'Ha Long Bay cruise', desc: 'Coach to the bay, embark at noon, cave visit, sunset deck and a cooking demo.', items: ['Cruise embarkation 12 PM', 'Sung Sot Cave', 'Onboard dinner'] },
        { day: 4, title: 'Tai chi sunrise and back to Hanoi', desc: 'Sunrise tai chi, brunch cruise back and a free Hanoi evening.', items: ['Disembark 11 AM', 'Train Street coffee'] },
        { day: 5, title: 'Depart', desc: 'Transfer to the airport.', items: ['Transfer to HAN', 'Flight HAN–MNL'] }
      ],
      accommodation: 'Sample hotel: La Siesta Classic Ma May or similar (Hanoi); Athena Elegance Cruise or similar (Ha Long). Final suppliers confirmed on booking.',
      preparation: ['Visa-free for Philippine passport holders for short stays; confirm current rules', 'Bring a light jacket for the bay at night from November to February', 'Carry small VND notes for street food'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-01-22', note: 'Cool season' }, { date: '2027-03-12', note: 'Spring' }, { date: '2027-11-05', note: 'Best bay visibility' }],
      visaNote: 'Visa-free for short visits on a Philippine passport.'
    },
    {
      id: 'vn-danang-hoian', validUntil: '2027-09-30', airport: 'DAD', title: 'Da Nang, Ba Na Hills & Hoi An', destinationId: 'vietnam', destination: 'Vietnam', country: 'Vietnam', type: 'international', region: 'Southeast Asia',
      category: 'Leisure', duration: { days: 4, nights: 3 }, priceFrom: null, childRate: 0.85, groupSize: 'Private, 2 to 8 travellers',
      images: ['1559592413-7cec4d0cae2b', '1555921015-5532091f6026', '1528127269322-539801943592'],
      summary: 'Golden Bridge at Ba Na Hills, My Khe beach afternoons and lantern-lit evenings in Hoi An’s ancient town.',
      highlights: ['Golden Bridge and Ba Na Hills cable car', 'Hoi An lantern boat ride', 'Marble Mountains', 'My Khe Beach stay', 'Tailor-made clothing stop'],
      inclusions: ['Round-trip economy airfare Manila–Da Nang', '3 nights at a 4-star beachfront hotel', 'Daily breakfast', 'Ba Na Hills ticket with cable car', 'Hoi An evening tour with lantern boat', 'Private airport transfers', 'Travel insurance (basic plan)'],
      exclusions: ['Meals not listed', 'Tailoring costs', 'Personal expenses', 'Travel tax and terminal fees'],
      itinerary: [
        { day: 1, title: 'Arrive Da Nang', desc: 'Beach check-in and a seafood dinner on the strip.', items: ['Flight MNL–DAD', 'My Khe Beach'] },
        { day: 2, title: 'Ba Na Hills', desc: 'Cable car up to the Golden Bridge, French Village and Fantasy Park.', items: ['Ba Na Hills full day'] },
        { day: 3, title: 'Marble Mountains and Hoi An', desc: 'Marble Mountains caves in the morning, Hoi An old town and lanterns at night.', items: ['Marble Mountains', 'Hoi An lantern boat'] },
        { day: 4, title: 'Depart', desc: 'Beach morning and transfer to the airport.', items: ['Transfer to DAD', 'Flight DAD–MNL'] }
      ],
      accommodation: 'Sample hotel: Sala Danang Beach Hotel or similar. Final hotel confirmed on booking.',
      preparation: ['Visa-free for short Filipino visits; confirm current rules', 'Hoi An tailors need 24 to 48 hours; visit on Day 2 evening if you want a fitting'],
      cancellation: POLICY_INTL, faqs: FAQ_INTL,
      departures: [{ date: '2027-02-26', note: 'Dry season' }, { date: '2027-04-23', note: 'Beach season' }, { date: '2027-08-13', note: 'Peak sunshine' }],
      visaNote: 'Visa-free for short visits on a Philippine passport.'
    },
    {
      id: 'ph-boracay-sunset', validUntil: '2027-05-31', airport: 'MPH', title: 'Boracay White Beach & Sunset Sail', destinationId: 'boracay', destination: 'Boracay', country: 'Philippines', type: 'domestic', region: 'Visayas',
      category: 'Leisure', duration: { days: 3, nights: 2 }, priceFrom: 13900, childRate: 0.8, groupSize: 'Private, 2 to 20 travellers',
      images: ['1519046904884-53103b34b206', '1509233725247-49e657c54213', '1559494007-9f5847c49d94', '1468413253725-0d5181091126'],
      summary: 'A quick reset on White Beach with a paraw sunset sail, island hopping to Puka Beach and nothing else on the schedule.',
      highlights: ['Paraw sunset sail', 'Island hopping with Puka Beach', 'Station 2 beachfront stay', 'Helmet diving (optional)', 'Buffet dinner on the beach'],
      inclusions: ['Round-trip flights Manila–Caticlan', 'Land and boat transfers to the resort', '2 nights beachfront resort, daily breakfast', 'Island hopping with lunch', 'Paraw sunset sail', 'Environmental and terminal fees'],
      exclusions: ['Meals not listed', 'Water sports', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrive and sunset sail', desc: 'Morning flight, resort check-in and a paraw sail at 5 PM.', items: ['Flight MNL–MPH', 'Paraw sunset sail'] },
        { day: 2, title: 'Island hopping', desc: 'Puka Beach, Crystal Cove snorkelling and a boat lunch.', items: ['Island hopping 9 AM–3 PM', 'Free evening at D’Mall'] },
        { day: 3, title: 'Depart', desc: 'Beach morning and transfer to Caticlan.', items: ['Flight MPH–MNL'] }
      ],
      accommodation: 'Sample resort: Henann Regency or similar, Station 2. Final resort confirmed on booking.',
      preparation: ['Bring reef-safe sunscreen; some areas require it', 'Boracay tourist registration is handled by your consultant', 'Pack a dry bag for island hopping'],
      cancellation: POLICY_DOM, faqs: FAQ_DOM,
      departures: [{ date: '2026-12-11', note: 'Dry season starts' }, { date: '2027-02-19', note: 'Peak season' }, { date: '2027-04-30', note: 'Summer' }],
      visaNote: 'No visa required.'
    },
    {
      id: 'ph-elnido-lagoons', validUntil: '2027-05-31', airport: 'ENI', title: 'El Nido Lagoons & Island Hopping', destinationId: 'palawan', destination: 'Palawan', country: 'Philippines', type: 'domestic', region: 'Mimaropa',
      category: 'Adventure', duration: { days: 4, nights: 3 }, priceFrom: 24900, childRate: 0.8, groupSize: 'Private, 2 to 12 travellers',
      images: ['1518509562904-e7ef99cdcc86', '1551918120-9739cb430c6d', '1516690561799-46d8f74f9abf', '1506929562872-bb421503ef21', '1552465011-b4e21bf6e79a'],
      summary: 'Tours A and C by private boat, a Nacpan Beach afternoon and three nights in a resort on Corong-Corong bay.',
      highlights: ['Big and Small Lagoon by kayak', 'Secret Beach and Hidden Beach', 'Nacpan Beach sunset', 'Private boat for your group', 'Direct flight to El Nido'],
      inclusions: ['Round-trip flights Manila–El Nido', 'Airport–resort transfers', '3 nights resort, daily breakfast', 'Island hopping Tour A and Tour C by private boat with lunch', 'Kayak rental for the lagoons', 'Environmental and eco-tourism fees'],
      exclusions: ['Meals not listed', 'Nacpan tricycle (shared, inexpensive)', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrive El Nido', desc: 'Direct flight, resort check-in and sunset at Las Cabañas.', items: ['Flight MNL–ENI', 'Las Cabañas sunset'] },
        { day: 2, title: 'Tour A: the lagoons', desc: 'Big Lagoon, Small Lagoon, Secret Lagoon, Shimizu Island and 7 Commandos.', items: ['Private boat 8 AM', 'Kayaks included', 'Beach lunch'] },
        { day: 3, title: 'Tour C: hidden beaches', desc: 'Helicopter Island, Matinloc Shrine, Secret Beach and Hidden Beach.', items: ['Private boat 8 AM', 'Snorkelling gear'] },
        { day: 4, title: 'Nacpan and depart', desc: 'Nacpan Beach morning then transfer to the airport.', items: ['Flight ENI–MNL'] }
      ],
      accommodation: 'Sample resort: Cadlao Resort or similar, Corong-Corong. Final resort confirmed on booking.',
      preparation: ['Island hopping is weather-dependent; keep Day 4 flexible', 'Bring reef-safe sunscreen and water shoes', 'Cash: ATMs in town are unreliable'],
      cancellation: POLICY_DOM, faqs: FAQ_DOM,
      departures: [{ date: '2027-01-15', note: 'Calm seas' }, { date: '2027-03-05', note: 'Peak visibility' }, { date: '2027-05-07', note: 'Summer' }],
      visaNote: 'No visa required.'
    },
    {
      id: 'ph-coron-wrecks', validUntil: '2027-05-31', airport: 'USU', title: 'Coron Lakes, Wrecks & Hot Springs', destinationId: 'palawan', destination: 'Palawan', country: 'Philippines', type: 'domestic', region: 'Mimaropa',
      category: 'Adventure', duration: { days: 3, nights: 2 }, priceFrom: null, childRate: 0.8, groupSize: 'Join-in, up to 12 travellers',
      images: ['1551918120-9739cb430c6d', '1518509562904-e7ef99cdcc86', '1530053969600-caed2596d242', '1551244072-5d12893278ab'],
      summary: 'Kayangan Lake, Twin Lagoon, the Skeleton Wreck snorkel and a soak in Maquinit Hot Springs on the way back.',
      highlights: ['Kayangan Lake viewpoint', 'Twin Lagoon swim-through', 'Skeleton Wreck snorkel', 'Maquinit Hot Springs', 'Mt Tapyas sunset'],
      inclusions: ['Round-trip flights Manila–Busuanga', 'Van transfers to Coron town', '2 nights hotel in Coron town, daily breakfast', 'Coron Island Ultimate tour with lunch', 'Maquinit Hot Springs entrance', 'Environmental fees'],
      exclusions: ['Meals not listed', 'Scuba diving (quoted separately)', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrive Coron', desc: 'Transfer to town, Mt Tapyas steps for sunset and Maquinit Hot Springs after dark.', items: ['Flight MNL–USU', 'Mt Tapyas', 'Maquinit Hot Springs'] },
        { day: 2, title: 'Coron Island Ultimate', desc: 'Kayangan Lake, Twin Lagoon, Skeleton Wreck, Siete Pecados and CYC Beach.', items: ['Boat 8 AM–5 PM', 'Lunch on the boat'] },
        { day: 3, title: 'Depart', desc: 'Free morning, transfer to Busuanga airport.', items: ['Flight USU–MNL'] }
      ],
      accommodation: 'Sample hotel: Two Seasons Coron Bayside or similar. Final hotel confirmed on booking.',
      preparation: ['Kayangan Lake has 150 steps; good footwear helps', 'Wreck diving can be added for certified divers'],
      cancellation: POLICY_DOM, faqs: FAQ_DOM,
      departures: [{ date: '2026-11-27', note: 'Start of dry season' }, { date: '2027-02-05', note: 'Peak season' }, { date: '2027-04-16', note: 'Summer' }],
      visaNote: 'No visa required.'
    },
    {
      id: 'ph-siargao-surf', validUntil: '2027-10-31', airport: 'IAO', title: 'Siargao Surf & Island Hopping', destinationId: 'siargao', destination: 'Siargao', country: 'Philippines', type: 'domestic', region: 'Mindanao',
      category: 'Adventure', duration: { days: 4, nights: 3 }, priceFrom: 21900, childRate: 0.8, groupSize: 'Private, 2 to 10 travellers',
      images: ['1505118380757-91f5f5632de0', '1502680390469-be75c86b636f', '1505228395891-9a51e7e86bf6', '1512100356356-de1b84283e18'],
      summary: 'Beginner surf lessons at Cloud 9, the Magpupungko rock pools at low tide and a three-island boat day, with a General Luna base.',
      highlights: ['2 surf lessons with a local instructor', 'Naked, Daku and Guyam islands', 'Magpupungko rock pools', 'Sugba Lagoon paddleboarding', 'Scooter rental included'],
      inclusions: ['Round-trip flights Manila–Siargao', 'Airport transfers', '3 nights boutique resort in General Luna, daily breakfast', 'Tri-island hopping with lunch', '2 beginner surf lessons with board', 'Magpupungko and Sugba Lagoon land tour', 'Environmental fees'],
      exclusions: ['Meals not listed', 'Scooter fuel', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrive Siargao', desc: 'Check in at General Luna and a sunset at the Cloud 9 boardwalk.', items: ['Flight MNL–IAO', 'Cloud 9 boardwalk'] },
        { day: 2, title: 'Island hopping', desc: 'Naked Island, Daku Island lunch and Guyam Island.', items: ['Boat 8 AM–3 PM', 'Afternoon surf lesson 1'] },
        { day: 3, title: 'Land tour and surf', desc: 'Magpupungko rock pools at low tide, Sugba Lagoon by boat, surf lesson 2 at sunset.', items: ['Land tour 7 AM', 'Surf lesson 2'] },
        { day: 4, title: 'Depart', desc: 'Free morning and airport transfer.', items: ['Flight IAO–MNL'] }
      ],
      accommodation: 'Sample resort: Siargao Bleu or similar. Final resort confirmed on booking.',
      preparation: ['Rock-pool timing depends on the tide; your itinerary is adjusted to it', 'Surf lessons are suitable for complete beginners', 'Bring rash guards and reef-safe sunscreen'],
      cancellation: POLICY_DOM, faqs: FAQ_DOM,
      departures: [{ date: '2027-03-19', note: 'Calm season' }, { date: '2027-05-21', note: 'Summer' }, { date: '2027-09-24', note: 'Surf season' }],
      visaNote: 'No visa required.'
    },
    {
      id: 'ph-cebu-south', validUntil: '2027-06-30', airport: 'CEB', title: 'Cebu South: Kawasan, Moalboal & Oslob', destinationId: 'cebu', destination: 'Cebu', country: 'Philippines', type: 'domestic', region: 'Visayas',
      category: 'Adventure', duration: { days: 4, nights: 3 }, priceFrom: 19900, childRate: 0.8, groupSize: 'Private, 2 to 14 travellers',
      images: ['1433086966358-54859d0ed716', '1551244072-5d12893278ab', '1530053969600-caed2596d242', '1519451241324-20b4ea2c4220'],
      summary: 'Canyoneering to Kawasan Falls, the Moalboal sardine run and Pescador Island, plus a Cebu City heritage afternoon with lechon.',
      highlights: ['Kawasan canyoneering', 'Moalboal sardine run snorkel', 'Pescador Island', 'Sumilon sandbar', 'Cebu heritage walk and lechon'],
      inclusions: ['Round-trip flights Manila–Cebu', 'Private van throughout', '2 nights Moalboal resort + 1 night Cebu City hotel, daily breakfast', 'Canyoneering with guide, gear and lunch', 'Sardine run and Pescador boat trip', 'Sumilon Island day with lunch', 'Environmental fees'],
      exclusions: ['Meals not listed', 'Whale-shark activity (not offered; see note)', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrive Cebu, drive south', desc: 'Private van to Moalboal with a Simala Shrine stop.', items: ['Flight MNL–CEB', 'Simala Shrine', 'Moalboal check-in'] },
        { day: 2, title: 'Kawasan canyoneering', desc: 'Jump, swim and trek to Kawasan Falls with a licensed guide.', items: ['Canyoneering 7 AM–1 PM', 'Free afternoon'] },
        { day: 3, title: 'Sardines and Sumilon', desc: 'Sardine run and Pescador Island at dawn, then the Sumilon sandbar.', items: ['Snorkel 6 AM', 'Sumilon Island'] },
        { day: 4, title: 'Cebu City and depart', desc: 'Heritage walk, lechon lunch and your evening flight.', items: ['Magellan’s Cross', 'Lechon lunch', 'Flight CEB–MNL'] }
      ],
      accommodation: 'Sample: Club Serena Moalboal or similar; Bai Hotel Cebu or similar. Final hotels confirmed on booking.',
      preparation: ['Canyoneering requires basic swimming ability; life vests and helmets are provided', 'Dreamspree does not sell whale-shark interactions; we can suggest responsible alternatives', 'Bring water shoes'],
      cancellation: POLICY_DOM, faqs: FAQ_DOM,
      departures: [{ date: '2027-01-29', note: 'Sinulog weekend' }, { date: '2027-03-26', note: 'Dry season' }, { date: '2027-05-28', note: 'Summer' }],
      visaNote: 'No visa required.'
    },
    {
      id: 'ph-bohol-countryside', validUntil: '2027-05-31', airport: 'TAG', title: 'Bohol Countryside & Panglao Beach', destinationId: 'bohol', destination: 'Bohol', country: 'Philippines', type: 'domestic', region: 'Visayas',
      category: 'Family', duration: { days: 3, nights: 2 }, priceFrom: 15900, childRate: 0.8, groupSize: 'Private, 2 to 16 travellers',
      images: ['1540202404-a2f29016b523', '1555400038-63f5ba517a47', '1432405972618-c60b0225b8f9', '1544550581-5f7ceaf7f992'],
      summary: 'The full countryside tour with the Chocolate Hills, tarsiers and a Loboc River lunch cruise, then a beach day on Panglao with Balicasag snorkelling.',
      highlights: ['Chocolate Hills viewpoint', 'Tarsier sanctuary', 'Loboc River floating lunch', 'Balicasag Island turtles', 'Alona Beach resort'],
      inclusions: ['Round-trip flights Manila–Panglao', 'Private van transfers and countryside tour', '2 nights Panglao resort, daily breakfast', 'Loboc River lunch cruise', 'Balicasag and Virgin Island boat trip', 'Entrance and environmental fees'],
      exclusions: ['Meals not listed', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Countryside tour', desc: 'Straight from the airport: Chocolate Hills, tarsiers, Loboc River lunch, Baclayon Church.', items: ['Flight MNL–TAG', 'Countryside tour 10 AM–5 PM'] },
        { day: 2, title: 'Balicasag and Virgin Island', desc: 'Dolphin watching at dawn, Balicasag turtle snorkel, Virgin Island sandbar.', items: ['Boat 6 AM–1 PM', 'Free afternoon on Alona'] },
        { day: 3, title: 'Depart', desc: 'Beach morning and airport transfer.', items: ['Flight TAG–MNL'] }
      ],
      accommodation: 'Sample resort: Henann Resort Alona Beach or similar. Final resort confirmed on booking.',
      preparation: ['Tarsiers are sensitive: no flash and quiet voices', 'Turtle snorkelling is guided; keep a 2-metre distance'],
      cancellation: POLICY_DOM, faqs: FAQ_DOM,
      departures: [{ date: '2026-12-04', note: 'Dry season' }, { date: '2027-02-12', note: 'Peak season' }, { date: '2027-04-09', note: 'Summer' }],
      visaNote: 'No visa required.'
    }
  ];

  /* ---------- Editorial stories ---------- */
  DS.stories = [
    { id: 'japan-visa-2027', category: 'Visa information update', title: 'Japan visa appointments: how early to start', excerpt: 'Appointment slots in Metro Manila have been booking out months ahead. Here is a realistic timeline and what to prepare while you wait.', image: '1493976040374-85c8e12f0c0e', readTime: '4 min', date: 'October 2026',
      body: `<p>Demand for Japan trips keeps growing and visa application slots through accredited agencies are the bottleneck, not the embassy decision itself. For a trip in spring, start your paperwork before the end of the year.</p><h3>A workable timeline</h3><ul><li><strong>10 to 12 weeks out:</strong> run the Visa Readiness Checker and request your bank certificate and ITR copies.</li><li><strong>8 weeks out:</strong> your consultant reviews documents and books the lodgement slot.</li><li><strong>3 to 5 weeks out:</strong> typical processing window once lodged.</li></ul><h3>What slows applications down</h3><ul><li>Bank certificates older than 30 days at submission.</li><li>Itineraries that do not match your flight dates.</li><li>Missing employment certificates for employees, or DTI and permits for business owners.</li></ul><p class="small muted">Illustrative guidance for the prototype. Confirm current requirements with the Embassy of Japan and your consultant.</p>` },
    { id: 'first-international-trip', category: 'Travel preparation', title: 'Your first international trip: a calm checklist', excerpt: 'From passport validity to the immigration counter, the questions first-time travellers ask most, answered in order.', image: '1530521954074-e64f6810b32d', readTime: '6 min', date: 'September 2026',
      body: `<p>The first trip abroad is mostly nerves about things that turn out to be simple. Work through this list in order and the airport becomes routine.</p><h3>Before you book</h3><ul><li>Passport valid for at least six months after your return date.</li><li>Check whether the destination needs a visa, a travel authorisation or nothing at all.</li><li>Round-trip ticket and hotel booking: immigration officers may ask for both.</li></ul><h3>Two weeks before</h3><ul><li>Print or save offline copies of bookings, insurance and your consultant’s number.</li><li>Tell your bank you are travelling and get a small amount of foreign currency.</li><li>Download the destination’s transit app and an offline map.</li></ul><h3>At the airport</h3><ul><li>Arrive three hours before an international flight.</li><li>Have your passport, boarding pass and return ticket ready for immigration.</li><li>Answer questions plainly: where you are going, for how long, and where you are staying.</li></ul>` },
    { id: 'seoul-autumn', category: 'Seasonal recommendation', title: 'Why late October is Seoul’s best week', excerpt: 'Ginkgo yellow on Samcheong-dong, cool palace mornings and the last of the outdoor markets before winter.', image: '1583833008338-31a6657917ab', readTime: '3 min', date: 'August 2026',
      body: `<p>Seoul in late October sits between the summer crowds and the first cold snap. Daytime highs hover in the high teens, which is perfect for a day in hanbok at Gyeongbokgung.</p><h3>Where the colour is</h3><ul><li>The ginkgo avenue along Samcheong-dong, usually peaking in the last week of October.</li><li>Namsan’s walking trails up to N Seoul Tower.</li><li>Nami Island’s metasequoia lane, best on a weekday.</li></ul><h3>Pack for two seasons</h3><p>Mornings start around 8°C and afternoons reach 18°C. A light down jacket over a shirt covers both. Our Seoul & Nami Island package has an October departure timed for this week.</p>` },
    { id: 'palawan-which-side', category: 'Destination guide', title: 'El Nido or Coron? Choosing your Palawan', excerpt: 'They are two hours apart by fast ferry but feel like different trips. Here is how to pick, or how to do both.', image: '1518509562904-e7ef99cdcc86', readTime: '5 min', date: 'July 2026',
      body: `<p>El Nido is lagoons, limestone and beach bars. Coron is lakes, wrecks and a quieter town. Both have direct or near-direct flights from Manila, so the choice is about what you want from the water.</p><h3>Choose El Nido if</h3><ul><li>You want the postcard lagoons and kayaking.</li><li>You like a lively town with sunset spots and restaurants.</li><li>You are travelling with a group that wants a private boat.</li></ul><h3>Choose Coron if</h3><ul><li>You snorkel or dive and want wrecks and clear lakes.</li><li>You prefer fewer crowds and lower prices.</li><li>You want a hot-spring soak after a boat day.</li></ul><h3>Doing both</h3><p>Allow six days: three in El Nido, a fast ferry morning, then three in Coron. Ask your consultant to pair our two Palawan packages into one trip.</p>` },
    { id: 'family-travel-tips', category: 'Travel tips', title: 'Travelling with kids: what experienced families do differently', excerpt: 'Slow mornings, one anchor activity a day and a packing list that fits in a backpack.', image: '1469854523086-cc02fe5d8800', readTime: '4 min', date: 'June 2026',
      body: `<p>Families who travel well do less per day and plan the gaps. These are the habits our consultants build into family packages.</p><ul><li><strong>One anchor activity per day.</strong> A theme park, a boat trip or a palace. Everything else is optional.</li><li><strong>Book family rooms, not two doubles.</strong> It is cheaper and nobody is alone.</li><li><strong>Eat early.</strong> Restaurants are empty at 5:30 PM and tired children are easier at 5:30 PM.</li><li><strong>Carry a day kit.</strong> Wipes, a change of clothes, snacks, a power bank and a printed hotel address card.</li><li><strong>Tell your consultant the ages.</strong> Pricing, car seats, strollers and activity suitability all change by age.</li></ul>` },
    { id: 'what-verified-means', category: 'Travel preparation', title: 'What “Dreamspree Verified” will mean on a listing', excerpt: 'A plain explanation of the partner-vetting standard we are proposing, and what you will be able to see before you book.', image: '1450101499163-c8848c66ca85', readTime: '3 min', date: 'October 2026',
      body: `<p>We believe every travel partner should be checked before they are listed, not after something goes wrong. We are proposing a written standard for doing that, and showing you the result.</p><h3>What a verified listing would show</h3><ul><li>That business permits and relevant accreditation were checked.</li><li>For transport partners, that vehicle registration and insurance were checked and drivers screened.</li><li>That Dreamspree made a test booking before listing the partner.</li><li>The month of the most recent re-audit.</li></ul><p class="small muted">The Dreamspree Verified programme is a proposed standard shown here as a concept. No partner inspection records are displayed in this prototype.</p>` }
  ];

  /* ---------- Visa Readiness Checker (illustrative demo checklists) ---------- */
  DS.visa = {
    purposes: [
      { id: 'tourism', label: 'Tourism', hint: 'Holiday, sightseeing, visiting attractions' },
      { id: 'family', label: 'Visiting family or friends', hint: 'Staying with a relative or friend who lives there' },
      { id: 'business', label: 'Business', hint: 'Meetings, conferences, trade events' }
    ],
    employment: [
      { id: 'employed', label: 'Employed' },
      { id: 'self-employed', label: 'Self-employed or business owner' },
      { id: 'student', label: 'Student' },
      { id: 'retired', label: 'Retired' },
      { id: 'unemployed', label: 'Not currently employed' }
    ],
    nationalities: ['Philippines', 'Other (please specify to your consultant)'],
    destinations: [
      {
        id: 'japan', name: 'Japan', image: '1526481280693-3bfa7568e0f3', note: 'Tourist visa for Philippine passport holders, usually lodged through an accredited agency.',
        processing: 'Typical processing 5 to 10 working days after lodgement; appointment slots can be weeks out.',
        validity: 'Single-entry visas are commonly issued for stays of up to 15 days.',
        categories: [
          { id: 'identity', name: 'Identity & application', icon: 'passport', items: [
            { id: 'jp-passport', label: 'Passport valid for the trip, with at least 2 blank pages', why: 'Japan accepts passports valid for the duration of stay, but airlines often apply a 6-month rule.' },
            { id: 'jp-form', label: 'Completed visa application form', why: 'Signed in the same way as your passport signature.' },
            { id: 'jp-photo', label: '4.5 cm × 4.5 cm photo, white background, taken in the last 6 months', why: 'Pasted on the form, not stapled.' },
            { id: 'jp-psa', label: 'PSA birth certificate', why: 'Required for first-time applicants.', cond: a => !a.visitedBefore },
            { id: 'jp-marriage', label: 'PSA marriage certificate', why: 'Required if married; also used to link family members on one application.', cond: a => a.married }
          ] },
          { id: 'finance', name: 'Financial capacity', icon: 'bank', items: [
            { id: 'jp-bank', label: 'Bank certificate issued within the last 30 days', why: 'Shows you can fund the trip. Your consultant will advise on a comfortable balance for your itinerary.' },
            { id: 'jp-itr', label: 'Income Tax Return (ITR Form 2316) or ITR for business owners', why: 'Evidence of regular income.', cond: a => a.employment !== 'student' },
            { id: 'jp-sponsor', label: 'Sponsor’s guarantee letter, bank certificate and relationship proof', why: 'Needed when someone else is paying for your trip.', cond: a => a.sponsored, review: true }
          ] },
          { id: 'work', name: 'Employment or study', icon: 'briefcase', items: [
            { id: 'jp-coe', label: 'Certificate of employment with position, salary and start date', why: 'On company letterhead with signatory details.', cond: a => a.employment === 'employed' },
            { id: 'jp-leave', label: 'Approved leave of absence', why: 'Confirms you will return to work.', cond: a => a.employment === 'employed' },
            { id: 'jp-dti', label: 'DTI or SEC registration and mayor’s permit', why: 'Business owners show the business exists and is operating.', cond: a => a.employment === 'self-employed' },
            { id: 'jp-school', label: 'School certificate of enrolment', why: 'For students; a parent usually sponsors.', cond: a => a.employment === 'student' },
            { id: 'jp-retire', label: 'Proof of pension or retirement income', why: 'Retirees show ongoing income or savings.', cond: a => a.employment === 'retired', review: true },
            { id: 'jp-unemployed', label: 'Explanation letter and sponsor documents', why: 'Applicants without current employment are usually sponsored. Your consultant will advise.', cond: a => a.employment === 'unemployed', review: true }
          ] },
          { id: 'trip', name: 'Trip details', icon: 'calendar', items: [
            { id: 'jp-itin', label: 'Daily itinerary in Japan', why: 'Dreamspree prepares this from your package.' },
            { id: 'jp-flight', label: 'Flight reservation (not yet ticketed)', why: 'Do not buy non-refundable tickets before approval.' },
            { id: 'jp-hotel', label: 'Hotel bookings matching the itinerary', why: 'Prepared by your consultant.' },
            { id: 'jp-invite', label: 'Invitation letter and host documents', why: 'When visiting family or friends in Japan.', cond: a => a.purpose === 'family', review: true },
            { id: 'jp-biz', label: 'Company letter of guarantee and business invitation', why: 'For business visits.', cond: a => a.purpose === 'business', review: true },
            { id: 'jp-minor', label: 'Documents for travelling minors: birth certificate, parental consent if one parent is not travelling', why: 'Applies to travellers under 18.', cond: a => a.minors, review: true }
          ] }
        ]
      },
      {
        id: 'korea', name: 'South Korea', image: '1538669715315-155098f0fb1d', note: 'Short-term visa (C-3) for Philippine passport holders, lodged through the Korea Visa Application Center.',
        processing: 'Typical processing 5 to 10 working days; longer during peak season.',
        validity: 'Single-entry short-term visas are common for first-time visitors.',
        categories: [
          { id: 'identity', name: 'Identity & application', icon: 'passport', items: [
            { id: 'kr-passport', label: 'Passport valid for at least 6 months beyond your stay', why: 'With old passports if you have previous Korean or OECD visas.' },
            { id: 'kr-form', label: 'Completed visa application form', why: 'Printed, with no blanks.' },
            { id: 'kr-photo', label: '3.5 cm × 4.5 cm photo, white background, taken in the last 6 months', why: 'Pasted on the form.' },
            { id: 'kr-psa', label: 'PSA birth certificate', why: 'Required for first-time applicants.', cond: a => !a.visitedBefore },
            { id: 'kr-marriage', label: 'PSA marriage certificate', why: 'If married.', cond: a => a.married }
          ] },
          { id: 'finance', name: 'Financial capacity', icon: 'bank', items: [
            { id: 'kr-bank', label: 'Original bank certificate with account type, balance and date opened', why: 'Issued within the last 30 days.' },
            { id: 'kr-statement', label: 'Bank statement for the last 3 months', why: 'Shows regular transactions, not a one-off deposit.' },
            { id: 'kr-itr', label: 'ITR (Form 2316) with BIR stamp or ITR for business owners', why: 'Proof of income.', cond: a => a.employment !== 'student' },
            { id: 'kr-sponsor', label: 'Sponsor’s affidavit of support, bank documents and relationship proof', why: 'Needed when a sponsor funds the trip.', cond: a => a.sponsored, review: true }
          ] },
          { id: 'work', name: 'Employment or study', icon: 'briefcase', items: [
            { id: 'kr-coe', label: 'Certificate of employment with salary and date hired', why: 'Original, on letterhead.', cond: a => a.employment === 'employed' },
            { id: 'kr-dti', label: 'Business registration (DTI or SEC) and mayor’s permit', why: 'For business owners.', cond: a => a.employment === 'self-employed' },
            { id: 'kr-school', label: 'School certificate and parent’s documents', why: 'Students are usually sponsored by a parent.', cond: a => a.employment === 'student' },
            { id: 'kr-retire', label: 'Pension or retirement proof', why: 'For retirees.', cond: a => a.employment === 'retired', review: true },
            { id: 'kr-unemployed', label: 'Explanation letter and sponsor documents', why: 'Discuss with your consultant.', cond: a => a.employment === 'unemployed', review: true }
          ] },
          { id: 'trip', name: 'Trip details', icon: 'calendar', items: [
            { id: 'kr-itin', label: 'Day-by-day itinerary', why: 'Prepared from your package.' },
            { id: 'kr-flight', label: 'Flight reservation', why: 'Do not ticket before approval.' },
            { id: 'kr-hotel', label: 'Hotel booking', why: 'Prepared by your consultant.' },
            { id: 'kr-invite', label: 'Invitation letter and host’s ID or residence card', why: 'When visiting family or friends.', cond: a => a.purpose === 'family', review: true },
            { id: 'kr-biz', label: 'Business invitation and company letter', why: 'For business visits.', cond: a => a.purpose === 'business', review: true },
            { id: 'kr-minor', label: 'Minor’s documents: birth certificate and parental consent', why: 'For travellers under 18.', cond: a => a.minors, review: true }
          ] }
        ]
      },
      {
        id: 'schengen', name: 'Schengen (Europe)', image: '1523906834658-6e24ef2386f9', note: 'A short-stay Schengen visa, applied for at the embassy or visa centre of your main destination.',
        processing: 'Allow 15 to 45 days after biometrics; appointments in Manila can be several weeks out.',
        validity: 'Covers up to 90 days in any 180-day period across Schengen states.',
        categories: [
          { id: 'identity', name: 'Identity & application', icon: 'passport', items: [
            { id: 'sc-passport', label: 'Passport issued within the last 10 years, valid 3 months beyond departure from Schengen, with 2 blank pages', why: 'A strict rule across all Schengen states.' },
            { id: 'sc-form', label: 'Completed Schengen application form', why: 'Usually completed online then printed and signed.' },
            { id: 'sc-photo', label: 'Two 35 mm × 45 mm photos meeting ICAO standards', why: 'Taken within the last 6 months.' },
            { id: 'sc-psa', label: 'PSA birth certificate', why: 'For first-time applicants.', cond: a => !a.visitedBefore },
            { id: 'sc-marriage', label: 'PSA marriage certificate', why: 'If married.', cond: a => a.married }
          ] },
          { id: 'finance', name: 'Financial capacity', icon: 'bank', items: [
            { id: 'sc-bank', label: 'Bank statements for the last 3 to 6 months', why: 'Each state sets its own daily subsistence amount; your consultant will explain the figure for your main destination.' },
            { id: 'sc-bankcert', label: 'Bank certificate', why: 'Issued within the last 30 days.' },
            { id: 'sc-itr', label: 'ITR for the last year', why: 'Proof of income.', cond: a => a.employment !== 'student' },
            { id: 'sc-sponsor', label: 'Sponsor’s formal obligation or affidavit, ID, bank documents', why: 'Some states require a notarised sponsorship form.', cond: a => a.sponsored, review: true }
          ] },
          { id: 'work', name: 'Employment or study', icon: 'briefcase', items: [
            { id: 'sc-coe', label: 'Certificate of employment and approved leave', why: 'Original, on letterhead.', cond: a => a.employment === 'employed' },
            { id: 'sc-dti', label: 'Business registration and latest permit', why: 'For business owners.', cond: a => a.employment === 'self-employed' },
            { id: 'sc-school', label: 'School enrolment certificate', why: 'For students.', cond: a => a.employment === 'student' },
            { id: 'sc-retire', label: 'Pension statement', why: 'For retirees.', cond: a => a.employment === 'retired', review: true },
            { id: 'sc-unemployed', label: 'Explanation letter and sponsor documents', why: 'Discuss with your consultant.', cond: a => a.employment === 'unemployed', review: true }
          ] },
          { id: 'trip', name: 'Trip details', icon: 'calendar', items: [
            { id: 'sc-insurance', label: 'Travel medical insurance with at least €30,000 cover, valid across Schengen', why: 'Mandatory. Dreamspree can arrange a compliant policy.' },
            { id: 'sc-itin', label: 'Day-by-day itinerary showing the main destination', why: 'Apply at the state where you spend the most nights.' },
            { id: 'sc-flight', label: 'Round-trip flight reservation', why: 'Do not ticket before approval.' },
            { id: 'sc-hotel', label: 'Accommodation bookings for every night', why: 'Prepared by your consultant.' },
            { id: 'sc-invite', label: 'Host invitation and proof of residence', why: 'When staying with family or friends.', cond: a => a.purpose === 'family', review: true },
            { id: 'sc-biz', label: 'Business invitation and employer letter', why: 'For business visits.', cond: a => a.purpose === 'business', review: true },
            { id: 'sc-minor', label: 'Minor’s documents: birth certificate, parental consent, parents’ IDs', why: 'For travellers under 18.', cond: a => a.minors, review: true },
            { id: 'sc-biometrics', label: 'Biometrics appointment (fingerprints)', why: 'Required unless taken within the last 59 months.', cond: a => !a.visitedBefore }
          ] }
        ]
      }
    ]
  };

  /* ---------- Hero campaigns (homepage carousel) ----------
     The brand slide is the first slide in index.html. Every entry below becomes an
     extra slide, in this order. To run a campaign, add an object here: no layout
     changes needed. Prices are SAMPLE DATA, labelled as such on the slide.
     Fields: id, label (short tab name), eyebrow, title + accent (headline), lede,
     image (Unsplash ID), alt, priceFrom (optional), primary {label, href},
     secondary {label, href} OR {label, enquiry: {service, destination, title, message}} */
  DS.heroIntervalMs = 7000;
  DS.campaigns = [
    {
      id: 'sakura-2027', label: 'Sakura 2027',
      eyebrow: 'Spring 2027 · Sample campaign',
      title: 'Cherry blossom season,', accent: 'sorted.',
      lede: 'Tokyo, Hakone and Kyoto at peak bloom, with your Japan visa handled by a consultant from checklist to approval.',
      image: '1524413840807-0c3cb6fa808d', alt: 'Cherry blossoms lit up along a canal in Tokyo at night',
      priceFrom: 78900,
      primary: { label: 'View the Japan package', href: 'package.html?id=jp-golden-route' },
      secondary: { label: 'Check visa readiness', href: 'visa.html?dest=japan' }
    },
    {
      id: 'island-summer-2027', label: 'Island summer',
      eyebrow: 'Summer 2027 · Sample campaign',
      title: 'Island escapes for', accent: 'the long weekend.',
      lede: 'Boracay, Palawan, Siargao, Cebu and Bohol, with flights, transfers and island hopping arranged in one booking.',
      image: '1559494007-9f5847c49d94', alt: 'Sunset over a quiet tropical beach',
      priceFrom: 13900,
      primary: { label: 'See island packages', href: 'explore.html?type=domestic' },
      secondary: { label: 'Ask about group rates', enquiry: { service: 'tours', destination: 'Multiple / undecided', title: 'Group rates for an island trip', message: 'We are a group interested in a summer island trip. Please send group options.' } }
    },
    {
      id: 'family-hk', label: 'Family trip',
      eyebrow: 'School break · Sample campaign',
      title: 'Hong Kong Disneyland,', accent: 'all planned.',
      lede: 'Disneyland, Victoria Peak and dim sum, two hours from Manila. Visa-free for short visits on a Philippine passport.',
      image: '1536599018102-9f803c140fc1', alt: 'Hong Kong skyline at dusk seen from Victoria Peak',
      priceFrom: 36900,
      primary: { label: 'View the family package', href: 'package.html?id=hk-disney-family' },
      secondary: { label: 'Plan with a consultant', enquiry: { service: 'tours', destination: 'Hong Kong', title: 'Plan a Hong Kong family trip', message: 'We are a family planning a Hong Kong Disneyland trip.' } }
    }
  ];

  /* ---------- Airports and places (worldwide search for flights, hotels, insurance) ----------
     Flights are an airfare-only quotation, so travellers can search any major airport by
     3-letter code, city or country. Format: CODE|City|Country|Airport. Add rows freely. */
  DS.airports = `
MNL|Manila|Philippines|Ninoy Aquino International
CEB|Cebu|Philippines|Mactan-Cebu International
CRK|Clark|Philippines|Clark International
DVO|Davao|Philippines|Francisco Bangoy International
ILO|Iloilo|Philippines|Iloilo International
BCD|Bacolod|Philippines|Bacolod-Silay
MPH|Caticlan (Boracay)|Philippines|Godofredo P. Ramos
KLO|Kalibo (Boracay)|Philippines|Kalibo International
PPS|Puerto Princesa|Philippines|Puerto Princesa International
ENI|El Nido|Philippines|El Nido Airport
USU|Coron (Busuanga)|Philippines|Francisco B. Reyes
IAO|Siargao|Philippines|Sayak Airport
TAG|Panglao (Bohol)|Philippines|Bohol-Panglao International
DGT|Dumaguete|Philippines|Sibulan Airport
CGY|Cagayan de Oro|Philippines|Laguindingan
ZAM|Zamboanga|Philippines|Zamboanga International
TAC|Tacloban|Philippines|Daniel Z. Romualdez
LAO|Laoag|Philippines|Laoag International
GES|General Santos|Philippines|General Santos International
NRT|Tokyo|Japan|Narita International
HND|Tokyo|Japan|Haneda
KIX|Osaka|Japan|Kansai International
ITM|Osaka|Japan|Itami
NGO|Nagoya|Japan|Chubu Centrair
FUK|Fukuoka|Japan|Fukuoka
CTS|Sapporo|Japan|New Chitose
OKA|Okinawa|Japan|Naha
ICN|Seoul|South Korea|Incheon International
GMP|Seoul|South Korea|Gimpo International
PUS|Busan|South Korea|Gimhae International
CJU|Jeju|South Korea|Jeju International
TPE|Taipei|Taiwan|Taoyuan International
TSA|Taipei|Taiwan|Songshan
KHH|Kaohsiung|Taiwan|Kaohsiung International
HKG|Hong Kong|Hong Kong SAR|Hong Kong International
MFM|Macau|Macau SAR|Macau International
PEK|Beijing|China|Capital International
PKX|Beijing|China|Daxing International
PVG|Shanghai|China|Pudong International
CAN|Guangzhou|China|Baiyun International
SZX|Shenzhen|China|Bao'an International
XMN|Xiamen|China|Gaoqi International
CTU|Chengdu|China|Tianfu International
HAN|Hanoi|Vietnam|Noi Bai International
SGN|Ho Chi Minh City|Vietnam|Tan Son Nhat International
DAD|Da Nang|Vietnam|Da Nang International
PQC|Phu Quoc|Vietnam|Phu Quoc International
CXR|Nha Trang|Vietnam|Cam Ranh International
BKK|Bangkok|Thailand|Suvarnabhumi
DMK|Bangkok|Thailand|Don Mueang
HKT|Phuket|Thailand|Phuket International
CNX|Chiang Mai|Thailand|Chiang Mai International
KBV|Krabi|Thailand|Krabi International
USM|Koh Samui|Thailand|Samui
SIN|Singapore|Singapore|Changi
KUL|Kuala Lumpur|Malaysia|Kuala Lumpur International
BKI|Kota Kinabalu|Malaysia|Kota Kinabalu International
PEN|Penang|Malaysia|Penang International
CGK|Jakarta|Indonesia|Soekarno-Hatta International
DPS|Bali (Denpasar)|Indonesia|Ngurah Rai International
PNH|Phnom Penh|Cambodia|Techo International
SAI|Siem Reap|Cambodia|Siem Reap-Angkor International
BWN|Bandar Seri Begawan|Brunei|Brunei International
RGN|Yangon|Myanmar|Yangon International
VTE|Vientiane|Laos|Wattay International
DEL|Delhi|India|Indira Gandhi International
BOM|Mumbai|India|Chhatrapati Shivaji Maharaj International
MLE|Malé|Maldives|Velana International
CMB|Colombo|Sri Lanka|Bandaranaike International
KTM|Kathmandu|Nepal|Tribhuvan International
DXB|Dubai|United Arab Emirates|Dubai International
AUH|Abu Dhabi|United Arab Emirates|Zayed International
DOH|Doha|Qatar|Hamad International
RUH|Riyadh|Saudi Arabia|King Khalid International
JED|Jeddah|Saudi Arabia|King Abdulaziz International
KWI|Kuwait City|Kuwait|Kuwait International
BAH|Manama|Bahrain|Bahrain International
MCT|Muscat|Oman|Muscat International
IST|Istanbul|Turkey|Istanbul Airport
TLV|Tel Aviv|Israel|Ben Gurion
AMM|Amman|Jordan|Queen Alia International
LHR|London|United Kingdom|Heathrow
LGW|London|United Kingdom|Gatwick
CDG|Paris|France|Charles de Gaulle
AMS|Amsterdam|Netherlands|Schiphol
FRA|Frankfurt|Germany|Frankfurt
MUC|Munich|Germany|Munich
ZRH|Zurich|Switzerland|Zurich
GVA|Geneva|Switzerland|Geneva
VIE|Vienna|Austria|Vienna International
FCO|Rome|Italy|Fiumicino
MXP|Milan|Italy|Malpensa
VCE|Venice|Italy|Marco Polo
MAD|Madrid|Spain|Barajas
BCN|Barcelona|Spain|El Prat
LIS|Lisbon|Portugal|Humberto Delgado
ATH|Athens|Greece|Athens International
PRG|Prague|Czech Republic|Václav Havel
BUD|Budapest|Hungary|Ferenc Liszt International
CPH|Copenhagen|Denmark|Kastrup
ARN|Stockholm|Sweden|Arlanda
OSL|Oslo|Norway|Gardermoen
HEL|Helsinki|Finland|Helsinki-Vantaa
DUB|Dublin|Ireland|Dublin
BRU|Brussels|Belgium|Brussels
KEF|Reykjavik|Iceland|Keflavík International
WAW|Warsaw|Poland|Chopin
LAX|Los Angeles|United States|Los Angeles International
SFO|San Francisco|United States|San Francisco International
SEA|Seattle|United States|Seattle-Tacoma International
SAN|San Diego|United States|San Diego International
LAS|Las Vegas|United States|Harry Reid International
JFK|New York|United States|John F. Kennedy International
EWR|New York (Newark)|United States|Newark Liberty International
ORD|Chicago|United States|O'Hare International
IAD|Washington, D.C.|United States|Dulles International
BOS|Boston|United States|Logan International
ATL|Atlanta|United States|Hartsfield-Jackson International
DFW|Dallas|United States|Dallas/Fort Worth International
IAH|Houston|United States|George Bush Intercontinental
MCO|Orlando|United States|Orlando International
MIA|Miami|United States|Miami International
HNL|Honolulu|United States|Daniel K. Inouye International
GUM|Guam|Guam (United States)|Antonio B. Won Pat International
SPN|Saipan|Northern Mariana Islands|Saipan International
YVR|Vancouver|Canada|Vancouver International
YYC|Calgary|Canada|Calgary International
YYZ|Toronto|Canada|Pearson International
YUL|Montreal|Canada|Trudeau International
MEX|Mexico City|Mexico|Benito Juárez International
CUN|Cancún|Mexico|Cancún International
GRU|São Paulo|Brazil|Guarulhos International
EZE|Buenos Aires|Argentina|Ezeiza International
LIM|Lima|Peru|Jorge Chávez International
SCL|Santiago|Chile|Arturo Merino Benítez International
BOG|Bogotá|Colombia|El Dorado International
SYD|Sydney|Australia|Kingsford Smith
MEL|Melbourne|Australia|Tullamarine
BNE|Brisbane|Australia|Brisbane
PER|Perth|Australia|Perth
AKL|Auckland|New Zealand|Auckland
CHC|Christchurch|New Zealand|Christchurch
ZQN|Queenstown|New Zealand|Queenstown
NAN|Nadi|Fiji|Nadi International
JNB|Johannesburg|South Africa|O. R. Tambo International
CPT|Cape Town|South Africa|Cape Town International
CAI|Cairo|Egypt|Cairo International
NBO|Nairobi|Kenya|Jomo Kenyatta International
CMN|Casablanca|Morocco|Mohammed V International
RAK|Marrakech|Morocco|Menara
MRU|Mauritius|Mauritius|Sir Seewoosagur Ramgoolam International
SEZ|Mahé|Seychelles|Seychelles International`.trim().split('\n').map(r => { const [code, city, country, name] = r.split('|'); return { code, city, country, name }; });
  // Hotel and corporate destinations: every airport city plus resort areas with no airport of their own
  DS.places = [...new Map([
    ...DS.airports.map(a => [`${a.city.replace(/ \(.*\)$/, '')}, ${a.country}`, a.country]),
    ...['Boracay', 'Coron', 'Panglao, Bohol', 'Baguio', 'Tagaytay', 'Vigan', 'Batanes'].map(c => [`${c}, Philippines`, 'Philippines']),
    ...['Kyoto', 'Hakone', 'Nara'].map(c => [`${c}, Japan`, 'Japan']), ['Hoi An, Vietnam', 'Vietnam'], ['Ha Long Bay, Vietnam', 'Vietnam'], ['Nami Island, South Korea', 'South Korea']
  ]).keys()].map(label => ({ label }));
  // Insurance cover is priced by where you go: countries plus the common multi-country areas
  DS.countries = ['Schengen area (Europe)', 'Multiple countries', ...[...new Set(DS.airports.map(a => a.country))].sort()].map(label => ({ label }));

  /* ---------- Travel Cart catalogue ----------
     What a traveller can add to the Travel Cart besides packages. Every price is
     optional: leave `fee` null and the item shows "Price on request", quoted by a
     consultant. Fees shown are SAMPLE DATA. */
  DS.cartCatalog = {
    kinds: {
      package: { label: 'Package', icon: 'compass' },
      visa: { label: 'Visa assistance', icon: 'passport', blurb: 'Checklist, appointment booking and document review.' },
      flight: { label: 'Flights', icon: 'plane', blurb: 'Fares found and booked by your consultant.' },
      hotel: { label: 'Hotel', icon: 'bed', blurb: 'Hand-picked stays to match your package.' },
      transport: { label: 'Transport', icon: 'car', blurb: 'Airport transfers, day tours and private vans.' },
      cruise: { label: 'Cruise', icon: 'ship', blurb: 'Cruise itineraries with pre- and post-cruise plans.' },
      insurance: { label: 'Travel insurance', icon: 'shield', blurb: 'Cover explained in plain language before you fly.' },
      custom: { label: 'Custom trip', icon: 'sparkles', blurb: 'Tell us what to include and a consultant designs the trip.' }
    },
    // What a custom trip can include (the traveller ticks what they want)
    customIncludes: [
      { id: 'flights', label: 'Flights', icon: 'plane' },
      { id: 'flight-reservation', label: 'Flight reservation (for visa)', icon: 'file' },
      { id: 'hotel', label: 'Hotel', icon: 'bed' },
      { id: 'airport-transfers', label: 'Airport transfers', icon: 'car' },
      { id: 'city-tour', label: 'City tour', icon: 'map' },
      { id: 'activities', label: 'Activities & day tours', icon: 'compass' },
      { id: 'theme-parks', label: 'Theme park tickets', icon: 'star' },
      { id: 'island-hopping', label: 'Island hopping', icon: 'sun' },
      { id: 'private-car', label: 'Private car with driver', icon: 'car' },
      { id: 'visa', label: 'Visa assistance', icon: 'passport' },
      { id: 'insurance', label: 'Travel insurance', icon: 'shield' },
      { id: 'meals', label: 'Meals', icon: 'tag' }
    ],
    travelStyles: ['Relaxed', 'Balanced', 'Packed itinerary'],
    visa: [
      { id: 'japan', name: 'Japan', fee: 2500, destinationId: 'japan' },
      { id: 'korea', name: 'South Korea', fee: 2000, destinationId: 'south-korea' },
      { id: 'schengen', name: 'Schengen (Europe)', fee: null },
      { id: 'other', name: 'Another country', fee: null }
    ],
    origins: [
      { id: 'MNL', name: 'Manila (MNL)' }, { id: 'CEB', name: 'Cebu (CEB)' }, { id: 'CRK', name: 'Clark (CRK)' }, { id: 'DVO', name: 'Davao (DVO)' }, { id: 'ILO', name: 'Iloilo (ILO)' }
    ],
    cabins: ['Economy', 'Premium economy', 'Business'],
    hotelClass: ['Any', '3-star', '4-star', '5-star'],
    transport: ['Airport transfer', 'Day tour with driver', 'Multi-day private van'],
    cruiseRegions: ['Asia & Japan', 'Mediterranean', 'Caribbean', 'Alaska', 'Somewhere else'],
    cruiseCabins: ['Inside', 'Ocean view', 'Balcony', 'Suite'],
    insurancePlans: ['Standard cover', 'Comprehensive cover']
  };

  /* ---------- Lookup helpers ---------- */
  /* Prices are optional: a package with priceFrom null is shown as "Price on request" */
  DS.hasPrice = p => !!p && typeof p.priceFrom === 'number' && p.priceFrom > 0;
  /* Dates are ISO strings (YYYY-MM-DD) and handled at midday UTC so time zones never shift a day */
  DS.addDays = (iso, n) => { if (!iso) return ''; const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  DS.daysBetween = (a, b) => (a && b) ? Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 864e5) : 0;
  DS.todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  /* Departures a traveller can still book: not in the past and within the package validity.
     Each comes back with its return date (departure + nights). */
  DS.departuresFor = p => p.departures.filter(d => d.date >= DS.todayISO() && (!p.validUntil || d.date <= p.validUntil)).map(d => ({ ...d, ret: DS.addDays(d.date, p.duration.nights) }));
  DS.getAirport = code => DS.airports.find(a => a.code === code);
  DS.getPackage = id => DS.packages.find(p => p.id === id);
  DS.getDestination = id => DS.destinations.find(d => d.id === id);
  DS.packagesFor = destId => DS.packages.filter(p => p.destinationId === destId);
  DS.featuredIds = ['jp-golden-route', 'ph-elnido-lagoons', 'kr-seoul-nami', 'hk-disney-family', 'vn-hanoi-halong', 'ph-siargao-surf'];
})(window.DS);
