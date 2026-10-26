import fs from 'fs';
import path from 'path';

const seedPath = path.resolve('apps/api/src/seed.ts');
let content = fs.readFileSync(seedPath, 'utf8');

// First, find where prod_bike_hunter350 starts
const bikeIdx = content.indexOf('prod_bike_hunter350');
if (bikeIdx !== -1) {
  // Cut off everything from line 2775 onwards, and rebuild the end
  const beforeBike = content.substring(0, bikeIdx);
  // Find the nanoleaf item just before bike
  const nanoleafIdx = beforeBike.lastIndexOf('prod_nanoleaf_shapes_hex');
  const afterNanoleaf = beforeBike.indexOf('}', nanoleafIdx);
  
  // Clean prefix up to end of nanoleaf product
  const cleanPrefix = beforeBike.substring(0, afterNanoleaf + 1);

  // Read admin users and autocomplete trie from original file
  const adminUsersIdx = content.indexOf('// 3. Admin & Demo Users');
  const restOfFile = content.substring(adminUsersIdx);

  // 50 new products with matching schema
  const newProducts = [
    // --- BIKES & AUTOMOTIVE (15) ---
    {
      _id: 'prod_bike_hunter350',
      title: 'Royal Enfield Hunter 350 (Dapper Ash, Retro Roadster)',
      slug: 'royal-enfield-hunter-350-dapper-ash',
      brand: 'Royal Enfield',
      category: 'Bikes & Automotive',
      price: 169900,
      minPrice: 169900,
      originalPrice: 174900,
      discountPct: 3,
      description: 'The Hunter 350 brings a stylish, youthful vibe to Royal Enfield with retro flair, agile handling, 349cc single-cylinder J-platform engine, dual-channel ABS, and twin down-tube frame.',
      media: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 3410,
      soldCount: 12400,
      inStock: true,
      isDeal: false,
      specs: { 'Engine': '349cc Single Cylinder J-Series', 'Power': '20.2 bhp @ 6100 rpm', 'Brakes': 'Dual-Channel ABS Disc', 'Fuel Tank': '13 Litres' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_r15_v4',
      title: 'Yamaha YZF R15 V4 (Racing Blue, 155cc VVA)',
      slug: 'yamaha-yzf-r15-v4-racing-blue',
      brand: 'Yamaha',
      category: 'Bikes & Automotive',
      price: 182000,
      minPrice: 182000,
      originalPrice: 189000,
      discountPct: 4,
      description: 'Track-bred supersport machine featuring 155cc liquid-cooled 4-valve SOHC VVA engine, traction control system, quick shifter, inverted USD front forks, and Class D Bi-functional LED headlight.',
      media: [
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 4210,
      soldCount: 15600,
      inStock: true,
      isDeal: false,
      specs: { 'Displacement': '155 cc Liquid Cooled', 'Power': '18.4 PS @ 10,000 RPM', 'Suspension': 'Upside Down Telescopic', 'Transmission': '6-Speed with Assist & Slipper Clutch' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_ather450x',
      title: 'Ather 450X Gen 3 (Space Grey, Smart Electric Scooter)',
      slug: 'ather-450x-gen-3-space-grey',
      brand: 'Ather',
      category: 'Bikes & Automotive',
      price: 144999,
      minPrice: 144999,
      originalPrice: 158999,
      discountPct: 9,
      description: 'High-performance connected electric scooter with Warp Mode accelerating 0-40 in 3.3s, 3.7 kWh IP67 lithium-ion battery delivering 150 km certified range, 7-inch touchscreen with Google Maps, and auto-hold.',
      media: [
        'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.7,
      ratingCount: 1850,
      soldCount: 8900,
      inStock: true,
      isDeal: false,
      specs: { 'Battery': '3.7 kWh Li-ion IP67', 'Top Speed': '90 km/h', 'Display': '7-inch Touch TFT', 'Fast Charging': 'Ather Grid 1.5km/min' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_apache_rtr',
      title: 'TVS Apache RTR 160 4V Special Edition (Matte Black)',
      slug: 'tvs-apache-rtr-160-4v-special-edition',
      brand: 'TVS',
      category: 'Bikes & Automotive',
      price: 132000,
      minPrice: 132000,
      originalPrice: 138000,
      discountPct: 4,
      description: 'Race-inspired roadster with 3 riding modes (Urban, Rain, Sport), SmartXonnect Bluetooth console with voice assistance, Bullpup exhaust note, and race-tuned fuel injection.',
      media: [
        'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 2190,
      soldCount: 9400,
      inStock: true,
      isDeal: false,
      specs: { 'Power': '17.55 PS @ 9250 rpm', 'Brakes': 'Wave Disc with Super-Moto ABS', 'Mileage': '48 kmpl' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_steelbird_helmet',
      title: 'Steelbird SBH-17 Terminator Full Face Helmet (Matte Black & Red)',
      slug: 'steelbird-sbh-17-terminator-helmet',
      brand: 'Steelbird',
      category: 'Bikes & Automotive',
      price: 2499,
      minPrice: 2499,
      originalPrice: 3899,
      discountPct: 36,
      description: 'Aggressive street fighter full-face helmet with ISI and DOT certification, quick release anti-scratch polycarbonate visor, dual air exhaust vents, and odorless breathable cheek pads.',
      media: [
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.5,
      ratingCount: 8940,
      soldCount: 34000,
      inStock: true,
      isDeal: true,
      specs: { 'Size': 'Large (600mm)', 'Weight': '1350g', 'Material': 'High Impact ABS' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_vega_bolt',
      title: 'Vega Bolt Bunny Full Face Graphic Helmet (ISI Certified)',
      slug: 'vega-bolt-bunny-full-face-helmet',
      brand: 'Vega',
      category: 'Bikes & Automotive',
      price: 1949,
      minPrice: 1949,
      originalPrice: 2899,
      discountPct: 33,
      description: 'Aerodynamic shell graphic helmet with UV protected scratch resistant clear visor, removable washable inner lining, micrometric chin strap buckle, and high impact polystyrene lining.',
      media: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 6120,
      soldCount: 22000,
      inStock: true,
      isDeal: true,
      specs: { 'Certification': 'ISI / DOT', 'Visor': 'Clear UV Protected', 'Weight': '1400g' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_motul_oil',
      title: 'Motul 7100 4T 10W-40 Fully Synthetic Engine Oil (1 Litre)',
      slug: 'motul-7100-4t-10w40-fully-synthetic-oil',
      brand: 'Motul',
      category: 'Bikes & Automotive',
      price: 899,
      minPrice: 899,
      originalPrice: 1250,
      discountPct: 28,
      description: '100% synthetic Ester technology motorcycle lubricant engineered for high performance modern sport and street bikes. Provides optimal gear protection, wet-clutch anti-slip response, and reduced engine friction.',
      media: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 14200,
      soldCount: 52000,
      inStock: true,
      isDeal: true,
      specs: { 'Viscosity': '10W-40', 'Volume': '1 Litre', 'Grade': 'Fully Synthetic Ester' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_bosch_inflator',
      title: 'Bosch EasyPump Cordless High-Pressure Electric Tire Inflator (150 PSI)',
      slug: 'bosch-easypump-cordless-tire-inflator',
      brand: 'Bosch',
      category: 'Bikes & Automotive',
      price: 4999,
      minPrice: 4999,
      originalPrice: 7999,
      discountPct: 37,
      description: 'Pocket-sized electric air pump with real-time pressure measurement, auto-stop at target PSI/bar, integrated LED worklight, USB-C recharging, and universal adapters for bikes, motorcycles, cars, and balls.',
      media: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.7,
      ratingCount: 3120,
      soldCount: 11000,
      inStock: true,
      isDeal: true,
      specs: { 'Max Pressure': '10.3 bar / 150 PSI', 'Battery': '3.0 Ah Li-ion', 'Charging': 'USB-C' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_alpinestars_gloves',
      title: 'Alpinestars SMX-1 Air V2 Breathable Motorcycle Riding Gloves',
      slug: 'alpinestars-smx-1-air-v2-riding-gloves',
      brand: 'Alpinestars',
      category: 'Bikes & Automotive',
      price: 4499,
      minPrice: 4499,
      originalPrice: 5999,
      discountPct: 25,
      description: 'Premium full-grain goat leather palm and 3D air mesh chassis gloves. Engineered with carbon-look hard polymer knuckle protector, touchscreen compatible fingertips, and ergonomic wrist closure.',
      media: [
        'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 1650,
      soldCount: 6800,
      inStock: true,
      isDeal: true,
      specs: { 'Material': 'Chassis Leather & 3D Mesh', 'Knuckle': 'Hard Polymer CE Level 1' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_cover',
      title: 'Solimo Heavy Duty 100% Waterproof Bike Cover with Mirror Pockets',
      slug: 'solimo-heavy-duty-waterproof-bike-cover',
      brand: 'Solimo',
      category: 'Bikes & Automotive',
      price: 649,
      minPrice: 649,
      originalPrice: 1499,
      discountPct: 57,
      description: 'All-weather tear-resistant polyester cover with double stitched seams, elastic bottom hem, heavy-duty windproof center buckle, and reflective safety strips. Fits all standard 100cc to 350cc motorcycles.',
      media: [
        'https://images.unsplash.com/photo-1558980664-2506fca6bfc2?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.4,
      ratingCount: 11200,
      soldCount: 48000,
      inStock: true,
      isDeal: true,
      specs: { 'Material': 'Polyester Taffeta with PU Coating', 'Color': 'Navy Blue & Silver' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_studds_ninja',
      title: 'Studds Ninja 3G Flip-Up Dual Visor Motorbike Helmet',
      slug: 'studds-ninja-3g-flip-up-helmet',
      brand: 'Studds',
      category: 'Bikes & Automotive',
      price: 2199,
      minPrice: 2199,
      originalPrice: 2995,
      discountPct: 27,
      description: 'Modular flip-up motorcycle helmet with one-button chin guard release, secondary tinted drop-down sun visor, regulated density EPS concussion padding, and ISI safety hallmark.',
      media: [
        'https://images.unsplash.com/photo-1558981420-bf7087a16339?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.5,
      ratingCount: 7850,
      soldCount: 29000,
      inStock: true,
      isDeal: true,
      specs: { 'Certification': 'ISI marked', 'Weight': '1550g', 'Type': 'Modular Flip-Up' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_castrol_oil',
      title: 'Castrol POWER1 4T 15W-50 Synthetic Technology Motorcycle Oil (1 Litre)',
      slug: 'castrol-power1-15w50-engine-oil',
      brand: 'Castrol',
      category: 'Bikes & Automotive',
      price: 549,
      minPrice: 549,
      originalPrice: 799,
      discountPct: 31,
      description: 'Advanced semi-synthetic 4-stroke engine oil with Power Release Technology that flows fast and reduces internal friction for sustained high-temperature engine performance in cruiser motorcycles.',
      media: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 8900,
      soldCount: 35000,
      inStock: true,
      isDeal: true,
      specs: { 'Viscosity': '15W-50', 'Volume': '1 Litre', 'Compatibility': 'Royal Enfield / Pulsar' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_hella_horn',
      title: 'Hella 3FH 007 728-831 Midnight Black Twin Tone Horn Set (12V)',
      slug: 'hella-twin-tone-horn-set-12v',
      brand: 'Hella',
      category: 'Bikes & Automotive',
      price: 1199,
      minPrice: 1199,
      originalPrice: 1890,
      discountPct: 37,
      description: 'German engineered high-decibel acoustic trumpet horns with penetrating sound propagation, water spray resistance, teflon pillar filter, and dual high/low frequency harmonic tone.',
      media: [
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 5420,
      soldCount: 19000,
      inStock: true,
      isDeal: true,
      specs: { 'Voltage': '12V', 'Decibels': '110 dB(A)', 'Frequency': '500 Hz High / 400 Hz Low' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_phone_mount',
      title: 'BOBO BM4 Claw Anti-Vibration Aluminum Mobile Holder for Bikes',
      slug: 'bobo-bm4-claw-bike-mobile-mount',
      brand: 'BOBO',
      category: 'Bikes & Automotive',
      price: 1499,
      minPrice: 1499,
      originalPrice: 2499,
      discountPct: 40,
      description: 'CNC machined aerospace-grade aluminum handlebar phone mount with built-in 4-point silicone vibration damper to protect smartphone optical image stabilization (OIS) during rugged rides.',
      media: [
        'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 9240,
      soldCount: 38000,
      inStock: true,
      isDeal: true,
      specs: { 'Material': 'CNC Machined Aircraft Aluminum', 'Handlebar Diameter': '22mm - 32mm' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_bike_3m_shampoo',
      title: '3M Car & Bike Wash Shampoo pH-Balanced Concentrated Formula (500 ml)',
      slug: '3m-car-bike-wash-shampoo-500ml',
      brand: '3M',
      category: 'Bikes & Automotive',
      price: 299,
      minPrice: 299,
      originalPrice: 480,
      discountPct: 38,
      description: 'Super high-foaming concentrated automotive wash shampoo with neutral pH that effortlessly lifts road dust, bug splatters, and road film without stripping paint sealant or wax protection.',
      media: [
        'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 16800,
      soldCount: 62000,
      inStock: true,
      isDeal: true,
      specs: { 'Volume': '500 ml', 'pH': 'Balanced Neutral 7.0' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },

    // --- BEAUTY & MAKEUP (18) ---
    {
      _id: 'prod_beauty_maybelline_matte',
      title: 'Maybelline New York Super Stay Matte Ink Liquid Lipstick (Ruler, 5ml)',
      slug: 'maybelline-super-stay-matte-ink-ruler',
      brand: 'Maybelline',
      category: 'Beauty & Makeup',
      price: 499,
      minPrice: 499,
      originalPrice: 699,
      discountPct: 29,
      description: 'Intensely pigmented longwear liquid lipstick that lasts up to 16 hours. Non-drying transfer-proof matte finish with unique arrow precision tip applicator for crisp contours.',
      media: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.7,
      ratingCount: 22400,
      soldCount: 88000,
      inStock: true,
      isDeal: true,
      specs: { 'Shade': '80 Ruler (Deep Berry Mauve)', 'Volume': '5 ml', 'Finish': 'Super Matte' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_loreal_serum',
      title: "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Hydrating Face Serum (30ml)",
      slug: 'loreal-revitalift-hyaluronic-acid-serum',
      brand: "L'Oreal Paris",
      category: 'Beauty & Makeup',
      price: 699,
      minPrice: 699,
      originalPrice: 999,
      discountPct: 30,
      description: 'Lightweight dermatologist-validated face serum packed with micro-hyaluronic acid that penetrates deep into epidermis to deliver intense 60% plumper, radiant, youthful skin.',
      media: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 31200,
      soldCount: 115000,
      inStock: true,
      isDeal: true,
      specs: { 'Volume': '30 ml', 'Skin Type': 'All Skin Types', 'Concentration': '1.5% Pure HA' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_mac_foundation',
      title: 'M.A.C Studio Fix Fluid SPF 15 24HR Matte Foundation (NC25, 30ml)',
      slug: 'mac-studio-fix-fluid-foundation-nc25',
      brand: 'M.A.C',
      category: 'Beauty & Makeup',
      price: 3600,
      minPrice: 3600,
      originalPrice: 3900,
      discountPct: 8,
      description: 'Iconic modern matte foundation with medium-to-full buildable coverage and 24-hour shine control. Protects with broad-spectrum SPF 15 and leaves an oil-free, non-settling velvet finish.',
      media: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 18400,
      soldCount: 65000,
      inStock: true,
      isDeal: false,
      specs: { 'Shade': 'NC25 (Golden Olive)', 'Coverage': 'Medium to Full', 'Volume': '30 ml' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_minimalist_niacinamide',
      title: 'Minimalist 10% Niacinamide Face Serum with Zinc for Blemish & Pore Control (30ml)',
      slug: 'minimalist-10-niacinamide-serum-30ml',
      brand: 'Minimalist',
      category: 'Beauty & Makeup',
      price: 569,
      minPrice: 569,
      originalPrice: 599,
      discountPct: 5,
      description: 'Nourishing daily face serum formulated with pure EU-grade Vitamin B3 and Zinc PCA. Clinically proven to reduce acne marks, control excess sebum, and strengthen barrier within 2 weeks.',
      media: [
        'https://images.unsplash.com/photo-1608248597359-5433a1e94119?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 42000,
      soldCount: 154000,
      inStock: true,
      isDeal: false,
      specs: { 'Volume': '30 ml', 'Active': '10% Niacinamide + 1% Zinc PCA', 'pH': '5.5 - 6.5' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_dyson_hairdryer',
      title: 'Dyson Supersonic Hair Dryer (Iron/Fuchsia) with 5 Styling Attachments',
      slug: 'dyson-supersonic-hair-dryer-fuchsia',
      brand: 'Dyson',
      category: 'Beauty & Makeup',
      price: 34900,
      minPrice: 34900,
      originalPrice: 39900,
      discountPct: 13,
      description: 'Fast drying with no extreme heat damage. Powered by Dyson V9 digital motor spinning at 110,000 RPM. Comes with Flyaway attachment, styling concentrator, diffuser, and gentle air attachment.',
      media: [
        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 3910,
      soldCount: 13500,
      inStock: true,
      isDeal: false,
      specs: { 'Power': '1600 W', 'Motor': 'Dyson Digital V9', 'Cable Length': '2.8 Metres', 'Airflow': '41 L/s' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_philips_trimmer',
      title: 'Philips BT3231/15 Smart Beard Trimmer with Lift & Trim System (Quick Charge)',
      slug: 'philips-bt3231-15-beard-trimmer',
      brand: 'Philips',
      category: 'Beauty & Makeup',
      price: 1899,
      minPrice: 1899,
      originalPrice: 2495,
      discountPct: 24,
      description: 'Innovative Lift & Trim technology captures 30% more low-lying hairs. Self-sharpening titanium coated blades with 20 lock-in length settings and 60 minutes cordless runtime on USB quick charge.',
      media: [
        'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 28400,
      soldCount: 92000,
      inStock: true,
      isDeal: false,
      specs: { 'Run Time': '60 Mins', 'Charging': 'USB Quick Charge', 'Precision': '0.5mm Steps' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_forest_cream',
      title: 'Forest Essentials Soundarya Radiance Cream with 24K Gold & SPF 25 (50g)',
      slug: 'forest-essentials-soundarya-radiance-cream-gold',
      brand: 'Forest Essentials',
      category: 'Beauty & Makeup',
      price: 6275,
      minPrice: 6275,
      originalPrice: 6600,
      discountPct: 5,
      description: 'Handcrafted luxury Ayurvedic day cream infused with 24 Karat Gold Bhasma, pure saffron, and ashwagandha. Deeply hydrates, tones elasticity, and protects against environmental photo-aging.',
      media: [
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 2840,
      soldCount: 9800,
      inStock: true,
      isDeal: false,
      specs: { 'Weight': '50 g', 'Key Ingredient': '24K Gold Bhasma, Saffron, Ashwagandha' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_huda_palette',
      title: 'Huda Beauty Empowered Eyeshadow Palette (18 Highly Pigmented Shades)',
      slug: 'huda-beauty-empowered-eyeshadow-palette',
      brand: 'Huda Beauty',
      category: 'Beauty & Makeup',
      price: 5350,
      minPrice: 5350,
      originalPrice: 5900,
      discountPct: 9,
      description: 'The ultimate everyday-to-editorial palette with 18 high-impact shades in buttery smooth mattes, shimmering wet-look metallics, and hybrid gel-liner textures that blend seamlessly.',
      media: [
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 3120,
      soldCount: 11000,
      inStock: true,
      isDeal: false,
      specs: { 'Shades': '18 Shades (Mattes, Wet Shimmers, Metallic Flakes)', 'Net Weight': '16.8 g' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_lakme_primer',
      title: 'Lakme Absolute Blur Perfect Matte Face Primer (30g)',
      slug: 'lakme-absolute-blur-perfect-primer-30g',
      brand: 'Lakme',
      category: 'Beauty & Makeup',
      price: 525,
      minPrice: 525,
      originalPrice: 850,
      discountPct: 38,
      description: 'Silky smooth makeup primer that instantly blurs open pores, controls T-zone shine, and smooths uneven skin texture for flawless all-day foundation wear.',
      media: [
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.5,
      ratingCount: 34100,
      soldCount: 120000,
      inStock: true,
      isDeal: true,
      specs: { 'Weight': '30 g', 'Texture': 'Silky Gel Cream', 'Finish': 'Matte' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_kama_kumkumadi',
      title: 'Kama Ayurveda Kumkumadi Miraculous Beauty Ayurvedic Night Serum (12ml)',
      slug: 'kama-ayurveda-kumkumadi-beauty-serum',
      brand: 'Kama Ayurveda',
      category: 'Beauty & Makeup',
      price: 3195,
      minPrice: 3195,
      originalPrice: 3450,
      discountPct: 7,
      description: 'Prescribed in authentic Ayurveda as a miraculous night beauty tailam. Formulated with pure Kashmiri Saffron, Sandalwood, and Indian Madder to illuminate complexion and fade blemishes.',
      media: [
        'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 4210,
      soldCount: 14500,
      inStock: true,
      isDeal: false,
      specs: { 'Volume': '12 ml', 'Ingredients': 'Kashmiri Saffron, Sandalwood, Indian Madder' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_ordinary_glycolic',
      title: 'The Ordinary Glycolic Acid 7% Exfoliating Toning Solution (240ml)',
      slug: 'the-ordinary-glycolic-acid-7-toner',
      brand: 'The Ordinary',
      category: 'Beauty & Makeup',
      price: 1250,
      minPrice: 1250,
      originalPrice: 1400,
      discountPct: 11,
      description: 'Direct exfoliating water-based toner that gently buffs away surface dead cells to restore radiant clarity. Contains Tasmanian Pepperberry derivative to visibly reduce irritation.',
      media: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 19800,
      soldCount: 78000,
      inStock: true,
      isDeal: false,
      specs: { 'Volume': '240 ml', 'Acid': '7% Glycolic Acid (pH 3.6)' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_plum_facewash',
      title: 'Plum Green Tea Pore Cleansing Face Wash with Glycolic Acid (120ml)',
      slug: 'plum-green-tea-pore-cleansing-face-wash',
      brand: 'Plum',
      category: 'Beauty & Makeup',
      price: 299,
      minPrice: 299,
      originalPrice: 395,
      discountPct: 24,
      description: 'Soap-free, non-drying foaming cleanser with organic green tea extracts and gentle cellulose micro-beads. Washes away excess oil and grime without compromising moisture barrier.',
      media: [
        'https://images.unsplash.com/photo-1556228722-d0b503554e2f?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 27500,
      soldCount: 94000,
      inStock: true,
      isDeal: false,
      specs: { 'Volume': '120 ml', 'Skin Type': 'Oily & Acne Prone' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_nykaa_lipstick',
      title: 'Nykaa Matte to Last Liquid Lipstick (Chai, 4.5ml Transfer-Proof)',
      slug: 'nykaa-matte-to-last-liquid-lipstick-chai',
      brand: 'Nykaa',
      category: 'Beauty & Makeup',
      price: 479,
      minPrice: 479,
      originalPrice: 649,
      discountPct: 26,
      description: 'Ultra-lightweight whipped liquid lipstick infused with Vitamin E and Jojoba oil. Dries down to an unyielding transfer-proof matte that feels soft and featherlight on lips all day.',
      media: [
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.5,
      ratingCount: 16400,
      soldCount: 58000,
      inStock: true,
      isDeal: true,
      specs: { 'Shade': 'Chai 18 (Warm Caramel Nude)', 'Volume': '4.5 ml' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_sugar_highlighter',
      title: 'SUGAR Cosmetics Contour De Force Mini Highlighter (Champagne Champion)',
      slug: 'sugar-contour-de-force-mini-highlighter',
      brand: 'SUGAR',
      category: 'Beauty & Makeup',
      price: 349,
      minPrice: 349,
      originalPrice: 449,
      discountPct: 22,
      description: 'Featherlight baked powder highlighter infused with micro-pearl particles that deliver a sculpted lit-from-within glow without any visible chunky glitter fallout.',
      media: [
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 9400,
      soldCount: 32000,
      inStock: true,
      isDeal: false,
      specs: { 'Shade': '01 Champagne Champion', 'Weight': '4 g' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_biotique_shampoo',
      title: 'Biotique Bio Kelp Protein Shampoo for Hair Fall Control (650ml)',
      slug: 'biotique-bio-kelp-protein-shampoo-650ml',
      brand: 'Biotique',
      category: 'Beauty & Makeup',
      price: 389,
      minPrice: 389,
      originalPrice: 590,
      discountPct: 34,
      description: 'Nourishing botanical hair wash infused with cold pure kelp, natural protein, peppermint oil, and mint leaf extract. Invigorates hair follicles for thicker, stronger hair growth.',
      media: [
        'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.4,
      ratingCount: 22100,
      soldCount: 84000,
      inStock: true,
      isDeal: true,
      specs: { 'Volume': '650 ml Family Pack', 'Hair Type': 'Weak & Thinning Hair' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_clinique_moisture',
      title: 'Clinique Moisture Surge 100H Auto-Replenishing Hydrator Gel-Cream (50ml)',
      slug: 'clinique-moisture-surge-100h-hydrator',
      brand: 'Clinique',
      category: 'Beauty & Makeup',
      price: 2950,
      minPrice: 2950,
      originalPrice: 3300,
      discountPct: 11,
      description: 'Oil-free refreshing gel-cream moisturizer with Aloe Bio-Ferment and Hyaluronic Acid that penetrates 10+ layers deep into skin, delivering 100 continuous hours of soothing hydration.',
      media: [
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 14200,
      soldCount: 49000,
      inStock: true,
      isDeal: false,
      specs: { 'Volume': '50 ml', 'Formula': 'Oil-Free Gel Cream' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_cetaphil_cleanser',
      title: 'Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin (500ml)',
      slug: 'cetaphil-gentle-skin-cleanser-500ml',
      brand: 'Cetaphil',
      category: 'Beauty & Makeup',
      price: 1149,
      minPrice: 1149,
      originalPrice: 1399,
      discountPct: 18,
      description: 'Dermatologist-recommended non-comedogenic gentle cleanser clinically tested to preserve skin natural protective barrier. Defends against dryness, irritation, roughness, and tightness.',
      media: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 46200,
      soldCount: 168000,
      inStock: true,
      isDeal: false,
      specs: { 'Volume': '500 ml Pump Pack', 'Form': 'Lotion Cleanser' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_beauty_laneige_lipmask',
      title: 'Laneige Lip Sleeping Mask (Berry Flavor, 20g Overnight Repair)',
      slug: 'laneige-lip-sleeping-mask-berry-20g',
      brand: 'Laneige',
      category: 'Beauty & Makeup',
      price: 1320,
      minPrice: 1320,
      originalPrice: 1550,
      discountPct: 15,
      description: 'Cult-favorite leave-on lip mask enriched with antioxidant-rich Berry Fruit Complex and Vitamin C. Melts away dry flakes overnight to reveal ultra-soft, plump, deeply hydrated lips.',
      media: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 24800,
      soldCount: 94000,
      inStock: true,
      isDeal: false,
      specs: { 'Flavor': 'Berry', 'Weight': '20 g', 'Usage': 'Overnight Sleeping Mask' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },

    // --- TEXTILES & ETHNIC WEAR (17) ---
    {
      _id: 'prod_textile_manyavar_sherwani',
      title: 'Manyavar Pure Silk Blend Handcrafted Royal Wedding Sherwani Set (Ivory & Gold)',
      slug: 'manyavar-pure-silk-blend-royal-wedding-sherwani',
      brand: 'Manyavar',
      category: 'Textiles & Ethnic Wear',
      price: 14999,
      minPrice: 14999,
      originalPrice: 18999,
      discountPct: 21,
      description: 'Regal bridal wedding sherwani handcrafted in raw silk blend with intricate zardozi and resham embroidery. Complete set includes mandarin collar coat, matching churidar, and brocade stole.',
      media: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 1480,
      soldCount: 5200,
      inStock: true,
      isDeal: false,
      specs: { 'Fabric': 'Raw Silk Blend with Satin Lining', 'Fit': 'Royal Tailored Fit', 'Care': 'Dry Clean Only' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_fabindia_saree',
      title: 'Fabindia Chanderi Silk Zari Woven Saree with Running Blouse Piece (Emerald Green)',
      slug: 'fabindia-chanderi-silk-zari-saree-green',
      brand: 'Fabindia',
      category: 'Textiles & Ethnic Wear',
      price: 6490,
      minPrice: 6490,
      originalPrice: 7990,
      discountPct: 19,
      description: 'Authentic handloom Chanderi silk saree featuring delicate metallic gold zari motifs across the body and heavy woven pallu. Comes with an unstitched 80cm blouse piece.',
      media: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 2240,
      soldCount: 7900,
      inStock: true,
      isDeal: false,
      specs: { 'Length': '6.3 Metres (with Blouse)', 'Fabric': 'Chanderi Silk Cotton Blend' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_kanchipuram_silk',
      title: 'Kanchipuram Pure Mulberry Silk Brocade Bridal Saree with Silk Mark (Ruby Red)',
      slug: 'kanchipuram-pure-mulberry-silk-bridal-saree',
      brand: 'Nalli Silks',
      category: 'Textiles & Ethnic Wear',
      price: 18499,
      minPrice: 18499,
      originalPrice: 24999,
      discountPct: 26,
      description: 'Heirloom South Indian bridal saree handwoven with 100% pure mulberry silk and authentic gold zari. Korvai border technique with temple vanki motifs. Silk Mark Certified.',
      media: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 3820,
      soldCount: 12500,
      inStock: true,
      isDeal: true,
      specs: { 'Zari': 'Tested High-Grade Zari', 'Certification': 'Silk Mark India', 'Weight': '850 g' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_peter_england_shirt',
      title: 'Peter England Men Premium 100% Egyptian Cotton Slim Fit Formal Shirt (Sky Blue)',
      slug: 'peter-england-cotton-slim-fit-formal-shirt',
      brand: 'Peter England',
      category: 'Textiles & Ethnic Wear',
      price: 1299,
      minPrice: 1299,
      originalPrice: 1999,
      discountPct: 35,
      description: 'Tailored executive formal shirt crafted from long staple Egyptian combed cotton. Features wrinkle-resistant easy care finish, semi-spread collar, and mitered button cuffs.',
      media: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.5,
      ratingCount: 14800,
      soldCount: 52000,
      inStock: true,
      isDeal: true,
      specs: { 'Fit': 'Slim Fit', 'Sleeve': 'Full Sleeve with Mitered Cuffs', 'Weave': 'Fine Poplin' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_levis_511',
      title: "Levi's 511 Slim Fit Stretch Denim Jeans (Dark Indigo Wash)",
      slug: 'levis-511-slim-fit-stretch-jeans',
      brand: "Levi's",
      category: 'Textiles & Ethnic Wear',
      price: 2499,
      minPrice: 2499,
      originalPrice: 3999,
      discountPct: 38,
      description: 'A modern slim with room to move. Built with Levis Flex advanced stretch technology for optimal mobility, classic 5-pocket styling, and signature back pocket red tab.',
      media: [
        'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.7,
      ratingCount: 24100,
      soldCount: 89000,
      inStock: true,
      isDeal: true,
      specs: { 'Material': '99% Cotton, 1% Elastane', 'Rise': 'Mid Rise', 'Leg Opening': '14.5 inch' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_w_kurta',
      title: 'W for Woman Geometric Print Straight Rayon Kurta with Pocket (Teal Blue)',
      slug: 'w-for-woman-geometric-print-straight-kurta',
      brand: 'W',
      category: 'Textiles & Ethnic Wear',
      price: 1199,
      minPrice: 1199,
      originalPrice: 2499,
      discountPct: 52,
      description: 'Effortlessly chic everyday ethnic tunic cut in breathable Liva rayon viscose. Features mandarin keyhole neck, 3/4th sleeves, side slits, and one convenient side seam pocket.',
      media: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 8400,
      soldCount: 31000,
      inStock: true,
      isDeal: true,
      specs: { 'Length': 'Calf Length (44 inch)', 'Pattern': 'Geometric Floral', 'Sleeves': '3/4th Sleeve' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_biba_suit',
      title: 'Biba Women Pure Cotton Straight Embroidered Kurta Pants & Dupatta Set',
      slug: 'biba-pure-cotton-embroidered-kurta-set',
      brand: 'Biba',
      category: 'Textiles & Ethnic Wear',
      price: 2999,
      minPrice: 2999,
      originalPrice: 4995,
      discountPct: 40,
      description: 'Festive ready 3-piece coordinated suit set crafted in pure breathable cotton. Highlights thread embroidery on the neckline, elasticated trousers with pockets, and printed cotton voile dupatta.',
      media: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.7,
      ratingCount: 11200,
      soldCount: 42000,
      inStock: true,
      isDeal: true,
      specs: { 'Set Contents': 'Kurta, Bottom Pants, Dupatta', 'Fabric': '100% Cotton' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_raymond_suit',
      title: 'Raymond Fine Wool Blend Unstitched Premium Suit Fabric (Charcoal Grey, 3 Metres)',
      slug: 'raymond-wool-blend-suit-fabric-charcoal',
      brand: 'Raymond',
      category: 'Textiles & Ethnic Wear',
      price: 3499,
      minPrice: 3499,
      originalPrice: 4999,
      discountPct: 30,
      description: 'Bespoke suit and tuxedo suiting fabric woven with fine Merino wool and anti-crease polyester. Imparts an elegant drape, all-weather comfort, and authentic Raymond selvedge branding.',
      media: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 4620,
      soldCount: 16000,
      inStock: true,
      isDeal: true,
      specs: { 'Length': '3.00 Metres (Width 147 cm)', 'Composition': '65% Poly, 35% Merino Wool' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_allen_solly_chinos',
      title: 'Allen Solly Men Slim Fit Stretch Cotton Chinos (Khaki Beige)',
      slug: 'allen-solly-slim-fit-stretch-cotton-chinos',
      brand: 'Allen Solly',
      category: 'Textiles & Ethnic Wear',
      price: 1499,
      minPrice: 1499,
      originalPrice: 2299,
      discountPct: 35,
      description: 'Smart casual Friday work chinos crafted in soft combed twill with 2% elastane stretch. Features flat front styling, slant pockets, and subtle embroidered logo at the back welt pocket.',
      media: [
        'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.5,
      ratingCount: 9800,
      soldCount: 35000,
      inStock: true,
      isDeal: true,
      specs: { 'Fit': 'Slim Fit', 'Material': 'Cotton Twill Stretch', 'Closure': 'Zip Fly with Button' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_aurelia_kurta',
      title: 'Aurelia Gold Print Round Neck Straight Festive Kurta (Burgundy)',
      slug: 'aurelia-gold-print-straight-festive-kurta',
      brand: 'Aurelia',
      category: 'Textiles & Ethnic Wear',
      price: 899,
      minPrice: 899,
      originalPrice: 1799,
      discountPct: 50,
      description: 'Radiant festive kurta embellished with gold leaf foil prints across the front panel. Tailored with a graceful round neck and side vents, pairing effortlessly with gold churidar.',
      media: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.4,
      ratingCount: 6540,
      soldCount: 24000,
      inStock: true,
      isDeal: true,
      specs: { 'Fabric': 'Liva Viscose Rayon', 'Pattern': 'Gold Foil Print' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_libas_anarkali',
      title: 'Libas Cotton Floral Tiered Anarkali Kurta Set with Chiffon Dupatta (Pastel Pink)',
      slug: 'libas-cotton-floral-anarkali-kurta-set',
      brand: 'Libas',
      category: 'Textiles & Ethnic Wear',
      price: 1999,
      minPrice: 1999,
      originalPrice: 3999,
      discountPct: 50,
      description: 'Romantic floor-grazing flared Anarkali kurta tailored with delicate handblock floral motifs, tasseled drawstring waist, narrow pants, and ethereal lightweight chiffon dupatta.',
      media: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 14100,
      soldCount: 51000,
      inStock: true,
      isDeal: true,
      specs: { 'Length': 'Ankle Length (48 inch)', 'Flare': '3.2 Metre Hem Gher' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_banarasi_saree',
      title: 'Varanasi Weavers Banarasi Georgette Handloom Silk Saree with Antique Zari (Royal Blue)',
      slug: 'banarasi-georgette-handloom-silk-saree',
      brand: 'Varanasi Weavers',
      category: 'Textiles & Ethnic Wear',
      price: 8990,
      minPrice: 8990,
      originalPrice: 12900,
      discountPct: 30,
      description: 'Lustrous Varanasi handloom saree handwoven in pure Khaddi Georgette silk with antique matte gold zari floral jaal. Soft, graceful drape suitable for grand receptions and parties.',
      media: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 2180,
      soldCount: 8200,
      inStock: true,
      isDeal: true,
      specs: { 'Fabric': 'Pure Khaddi Georgette Silk', 'Zari': 'Antique Dull Gold Weft' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_van_heusen_blazer',
      title: 'Van Heusen Men Single-Breasted Textured Slim Fit Casual Blazer (Navy Blue)',
      slug: 'van-heusen-single-breasted-casual-blazer',
      brand: 'Van Heusen',
      category: 'Textiles & Ethnic Wear',
      price: 4999,
      minPrice: 4999,
      originalPrice: 7999,
      discountPct: 37,
      description: 'Modern textured blazer with sharp notch lapel, dual button front closure, chest welt pocket, and dual side vents. Designed to transition smoothly from boardroom to evening dinner.',
      media: [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.7,
      ratingCount: 3950,
      soldCount: 14000,
      inStock: true,
      isDeal: true,
      specs: { 'Material': 'Poly-Viscose Stretch Twill', 'Fit': 'Ultra Slim Fit' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_soch_tunic',
      title: 'Soch Chanderi Embroidered Straight Tunic with Zari Borders (Mustard Gold)',
      slug: 'soch-chanderi-embroidered-straight-tunic',
      brand: 'Soch',
      category: 'Textiles & Ethnic Wear',
      price: 1598,
      minPrice: 1598,
      originalPrice: 3198,
      discountPct: 50,
      description: 'Vibrant mustard Chanderi silk tunic adorned with traditional mirror and thread embroidery across the neckline. Lined with butter crepe for breathable all-day festive comfort.',
      media: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.6,
      ratingCount: 4800,
      soldCount: 18000,
      inStock: true,
      isDeal: true,
      specs: { 'Fabric': 'Chanderi with Butter Crepe Lining', 'Care': 'Dry Clean Preferred' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_fabindia_kurta_pyjama',
      title: 'Fabindia Men Cotton Silk Long Kurta with Churidar Pyjama Set (Garnet Maroon)',
      slug: 'fabindia-cotton-silk-long-kurta-pyjama',
      brand: 'Fabindia',
      category: 'Textiles & Ethnic Wear',
      price: 3690,
      minPrice: 3690,
      originalPrice: 4590,
      discountPct: 20,
      description: 'Rich handwoven cotton-silk long kurta with traditional Chinese bandhgala collar, natural coconut shell buttons, and deep side pockets. Accompanied by pure white cotton churidar.',
      media: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.8,
      ratingCount: 3100,
      soldCount: 11000,
      inStock: true,
      isDeal: false,
      specs: { 'Fabric': '70% Cotton, 30% Silk', 'Length': 'Knee Length' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_raw_silk_fabric',
      title: 'Bhagalpur Weavers 100% Pure Tussar Raw Silk Unstitched Fabric (Golden Honey, 3 Metres)',
      slug: 'bhagalpur-pure-tussar-raw-silk-fabric',
      brand: 'Bhagalpur Handlooms',
      category: 'Textiles & Ethnic Wear',
      price: 2799,
      minPrice: 2799,
      originalPrice: 3999,
      discountPct: 30,
      description: 'Silk Mark certified genuine wild Tussar raw silk fabric from the silk city of Bhagalpur. Natural coarse slub texture with rich organic golden sheen, ideal for kurtas and waistcoats.',
      media: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 1850,
      soldCount: 6500,
      inStock: true,
      isDeal: true,
      specs: { 'Length': '3 Metres (Width 112 cm)', 'Certification': 'Silk Mark' },
      createdAt: '2026-10-26T21:00:00.000Z'
    },
    {
      _id: 'prod_textile_pashmina_shawl',
      title: 'Kashmir Origin 100% Pure Handwoven Cashmere Pashmina Shawl (Natural Oatmeal)',
      slug: 'kashmir-pure-handwoven-cashmere-pashmina-shawl',
      brand: 'Kashmir Crafts',
      category: 'Textiles & Ethnic Wear',
      price: 9499,
      minPrice: 9499,
      originalPrice: 14500,
      discountPct: 34,
      description: 'Ultra-luxurious authentic Kashmiri Cashmere Pashmina hand-spun by master artisans in the Kashmir valley. Feathery soft 14-micron wool that easily passes the traditional wedding ring test.',
      media: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80'
      ],
      ratingAvg: 4.9,
      ratingCount: 2190,
      soldCount: 7800,
      inStock: true,
      isDeal: true,
      specs: { 'Dimensions': '100 cm x 200 cm (Full Stole / Shawl)', 'Composition': '100% Cashmere Wool' },
      createdAt: '2026-10-26T21:00:00.000Z'
    }
  ];

  const productsFormatted = newProducts.map(p => `    ${JSON.stringify(p, null, 2).replace(/\n/g, '\n    ')}`).join(',\n');

  const finalContent = `${cleanPrefix},\n${productsFormatted}\n  ];\n\n  ${restOfFile}`;
  fs.writeFileSync(seedPath, finalContent, 'utf8');
  console.log('Fixed and formatted seed.ts successfully!');
} else {
  console.log('prod_bike_hunter350 not found in seed.ts');
}
