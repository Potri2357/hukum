import crypto from 'crypto';
import { db } from './database/store';
import { rebuildAutocompleteTrie } from './suggest/suggest-controller';

export function seedInitialData() {
  console.log('🌱 Seeding rich consumer catalog for Hukum marketplace...');

  // 1. Categories (Flipkart-class)
  const categories = [
    {
      _id: 'cat_mobiles',
      name: 'Mobiles & Tablets',
      slug: 'mobiles',
      icon: 'smartphone',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80',
      description: 'Latest 5G smartphones, foldable displays & iPads',
    },
    {
      _id: 'cat_electronics',
      name: 'Laptops & Computers',
      slug: 'laptops',
      icon: 'laptop',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
      description: 'MacBooks, gaming laptops & productivity ultrabooks',
    },
    {
      _id: 'cat_audio',
      name: 'Audio & Soundbars',
      slug: 'audio',
      icon: 'headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
      description: 'Active Noise Cancellation headphones, TWS earbuds & home theatre',
    },
    {
      _id: 'cat_wearables',
      name: 'Smart Watches',
      slug: 'wearables',
      icon: 'watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
      description: 'Fitness trackers, titanium smartwatches & GPS sports watches',
    },
    {
      _id: 'cat_cameras',
      name: 'Cameras & Drones',
      slug: 'cameras',
      icon: 'camera',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
      description: 'Mirrorless 4K cameras, vlogging kits & gimbal drones',
    },
    {
      _id: 'cat_accessories',
      name: 'Gaming & Desk',
      slug: 'accessories',
      icon: 'keyboard',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80',
      description: 'Mechanical keyboards, 4K webcams & high-speed GaN chargers',
    },
    {
      _id: 'cat_fashion',
      name: 'Sneakers & Fashion',
      slug: 'fashion',
      icon: 'shirt',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&auto=format&fit=crop&q=80',
      description: 'Original kicks, sneakers & streetwear apparel',
    },
    {
      _id: 'cat_bikes',
      name: 'Bikes & Automotive',
      slug: 'bikes',
      icon: 'bike',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80',
      description: 'Cruisers, sportbikes, electric scooters & riding gear',
    },
    {
      _id: 'cat_beauty',
      name: 'Beauty & Makeup',
      slug: 'beauty',
      icon: 'sparkles',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&auto=format&fit=crop&q=80',
      description: 'Cosmetics, skincare, fragrances & salon-grade hair care',
    },
    {
      _id: 'cat_textiles',
      name: 'Textiles & Ethnic Wear',
      slug: 'textiles',
      icon: 'shirt',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
      description: 'Silk sarees, sherwanis, kurtas & premium fabrics',
    },

  ];

  for (const c of categories) {
    if (!db.findById('categories', c._id)) {
      db.insertOne('categories', c);
    }
  }

  // 2. 20+ Real, High-Scale Flipkart-class Products with High Quality Aspect Ratio Imagery
  const sampleProducts = [
    // --- MOBILES ---
    {
      _id: 'prod_ip15_pro',
      title: 'Apple iPhone 15 Pro Max (Natural Titanium, 256 GB)',
      slug: 'apple-iphone-15-pro-max-256gb',
      brand: 'Apple',
      category: 'Mobiles & Tablets',
      price: 154900,
      minPrice: 154900,
      originalPrice: 159900,
      discountPct: 3,
      description: 'Forged in titanium with aerospace-grade strength. A17 Pro chip with 6-core GPU. 48MP Main camera with 5x optical telephoto lens and Action button.',
      media: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 14280,
      soldCount: 42100,
      inStock: true,
      isDeal: true,
      bankOffers: [
        '5% Cashback on Hukum Axis Bank Card',
        'Flat ₹4,000 Instant Discount on HDFC Bank Credit Card EMI',
        'Special Price: Get extra ₹5,000 off (price inclusive of cashback)',
      ],
      specs: {
        'Display': '6.7-inch Super Retina XDR OLED (120Hz ProMotion)',
        'Processor': 'A17 Pro Chip (3nm Architecture)',
        'Camera': '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
        'Storage': '256 GB NVMe',
        'Battery': 'Up to 29 hours video playback',
        'Build': 'Aerospace-Grade Grade 5 Titanium',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_s24_ultra',
      title: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512 GB)',
      slug: 'samsung-galaxy-s24-ultra-512gb',
      brand: 'Samsung',
      category: 'Mobiles & Tablets',
      price: 139999,
      minPrice: 139999,
      originalPrice: 149999,
      discountPct: 7,
      description: 'Unleash Galaxy AI. Built-in S Pen, 200MP camera with Quad Telephoto, Snapdragon 8 Gen 3 for Galaxy, and flat 6.8-inch Dynamic AMOLED 2X display.',
      media: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 9820,
      soldCount: 31200,
      inStock: true,
      isDeal: true,
      bankOffers: [
        'Flat ₹6,000 Instant Discount on ICICI Bank Cards',
        'No Cost EMI starting from ₹11,667/month',
      ],
      specs: {
        'Display': '6.8-inch QHD+ Dynamic AMOLED 2X (2600 nits)',
        'Processor': 'Snapdragon 8 Gen 3 for Galaxy',
        'RAM': '12 GB LPDDR5X',
        'Storage': '512 GB UFS 4.0',
        'Camera': '200MP + 50MP + 12MP + 10MP with 100x Space Zoom',
        'Stylus': 'Embedded Bluetooth S Pen',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_pixel_8_pro',
      title: 'Google Pixel 8 Pro (Bay Blue, 128 GB)',
      slug: 'google-pixel-8-pro-128gb',
      brand: 'Google',
      category: 'Mobiles & Tablets',
      price: 89999,
      minPrice: 89999,
      originalPrice: 106999,
      discountPct: 16,
      description: 'Google Tensor G3 chip with advanced Google AI. Pro-level triple rear camera with Best Take, Magic Editor, Audio Magic Eraser, and built-in temperature sensor.',
      media: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.5,
      ratingCount: 4210,
      soldCount: 16400,
      inStock: true,
      isDeal: false,
      specs: {
        'Display': '6.7-inch Super Actua OLED (1-120Hz)',
        'Processor': 'Google Tensor G3 + Titan M2 security',
        'Camera': '50MP Octa PD + 48MP Quad PD Ultrawide + 48MP 5x Telephoto',
        'OS': 'Pure Android 14 with 7 years of OS updates',
      },
      createdAt: new Date().toISOString(),
    },

    // --- LAPTOPS ---
    {
      _id: 'prod_macbook_air_m3',
      title: 'Apple MacBook Air M3 (13.6-inch, 16GB Unified Memory, 512GB SSD)',
      slug: 'apple-macbook-air-m3-13inch',
      brand: 'Apple',
      category: 'Laptops & Computers',
      price: 134900,
      minPrice: 134900,
      originalPrice: 144900,
      discountPct: 7,
      description: 'Strikingly thin design with blazing-fast Apple M3 chip (8-core CPU, 10-core GPU), 18-hour battery life, 1080p FaceTime HD camera, and dual external display support.',
      media: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 6840,
      soldCount: 22400,
      inStock: true,
      isDeal: true,
      specs: {
        'Processor': 'Apple M3 chip (8-core CPU, 10-core GPU, Hardware-accelerated ray tracing)',
        'Memory': '16 GB Unified Memory',
        'Storage': '512 GB SSD Storage',
        'Display': '13.6-inch Liquid Retina with True Tone (500 nits)',
        'Weight': '1.24 kg',
        'Battery': 'Up to 18 hours battery life',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_rog_zephyrus',
      title: 'ASUS ROG Zephyrus G16 OLED (Intel Core Ultra 9, RTX 4080, 32GB)',
      slug: 'asus-rog-zephyrus-g16-oled',
      brand: 'ASUS',
      category: 'Laptops & Computers',
      price: 249990,
      minPrice: 249990,
      originalPrice: 289990,
      discountPct: 14,
      description: 'Ultra-thin CNC aluminum luxury gaming laptop with 2.5K 240Hz ROG Nebula OLED display, NVIDIA GeForce RTX 4080 12GB graphics, and Slash Lighting lid array.',
      media: [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 1240,
      soldCount: 4500,
      inStock: true,
      isDeal: false,
      specs: {
        'Processor': 'Intel Core Ultra 9 185H (16 Cores, 22 Threads)',
        'Graphics': 'NVIDIA GeForce RTX 4080 (12GB GDDR6)',
        'Display': '16-inch 2.5K (2560x1600) 240Hz 0.2ms OLED',
        'RAM': '32 GB LPDDR5X 7467MHz',
        'Storage': '2 TB PCIe 4.0 NVMe M.2 SSD',
      },
      createdAt: new Date().toISOString(),
    },

    // --- AUDIO ---
    {
      _id: 'prod_sony_wh1000xm5',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      slug: 'sony-wh-1000xm5-anc-headphones',
      brand: 'Sony',
      category: 'Audio & Soundbars',
      price: 26990,
      minPrice: 26990,
      originalPrice: 34990,
      discountPct: 23,
      description: 'Industry-leading noise canceling with Auto NC Optimizer, 8 microphones, integrated processor V1, carbon-fiber composite driver, and crystal-clear hands-free calls.',
      media: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 18450,
      soldCount: 68200,
      inStock: true,
      isDeal: true,
      specs: {
        'Noise Cancelling': 'Dual Processor V1 + QN1 with 8 Microphones',
        'Battery Life': 'Up to 30 hours with ANC enabled',
        'Charging': '3 min quick charge gives 3 hours playback',
        'Audio Codecs': 'LDAC, DSEE Extreme, AAC, SBC',
        'Weight': '250 grams',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_airpods_pro_2',
      title: 'Apple AirPods Pro (2nd Generation with USB-C MagSafe Case)',
      slug: 'apple-airpods-pro-2-usbc',
      brand: 'Apple',
      category: 'Audio & Soundbars',
      price: 20990,
      minPrice: 20990,
      originalPrice: 24900,
      discountPct: 16,
      description: 'Up to 2x more Active Noise Cancellation. Transparency mode, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and IP54 dust, sweat, and water resistance.',
      media: [
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 31200,
      soldCount: 92400,
      inStock: true,
      isDeal: true,
      specs: {
        'Chip': 'Apple H2 headphone chip + U1 in MagSafe Case',
        'Audio Tech': 'Adaptive Audio, Active Noise Cancellation, Conversation Awareness',
        'Charging': 'USB-C, MagSafe, Apple Watch charger, Qi-certified',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_marshall_stanmore',
      title: 'Marshall Stanmore III Bluetooth Home Speaker',
      slug: 'marshall-stanmore-iii-speaker',
      brand: 'Marshall',
      category: 'Audio & Soundbars',
      price: 36999,
      minPrice: 36999,
      originalPrice: 41999,
      discountPct: 12,
      description: 'Re-engineered for a wider stereo soundstage. 80W output with outward-angled tweeters and updated waveguides. Bluetooth 5.2 and 3.5mm AUX input with iconic brass knobs.',
      media: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 2410,
      soldCount: 7800,
      inStock: true,
      isDeal: false,
      specs: {
        'Power Output': '1x 50W Class D (Woofer) + 2x 15W Class D (Tweeters)',
        'Frequency Range': '45 - 20,000 Hz',
        'Connectivity': 'Bluetooth 5.2, 3.5mm Input, RCA Input',
      },
      createdAt: new Date().toISOString(),
    },

    // --- WEARABLES ---
    {
      _id: 'prod_apple_watch_ultra_2',
      title: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Titanium, Alpine Loop)',
      slug: 'apple-watch-ultra-2-49mm',
      brand: 'Apple',
      category: 'Smart Watches',
      price: 84900,
      minPrice: 84900,
      originalPrice: 89900,
      discountPct: 6,
      description: 'The most rugged and capable Apple Watch. Aerospace-grade 49mm titanium case, S9 SiP with Double Tap gesture, 3000-nit display, dual-frequency precision GPS, and 72-hour battery.',
      media: [
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 4210,
      soldCount: 15400,
      inStock: true,
      isDeal: true,
      specs: {
        'Case': '49mm Natural Titanium Case',
        'Screen': 'Always-On Retina display up to 3000 nits',
        'Water Resistance': '100m water resistant, 40m recreational dive EN13319',
        'Battery': 'Up to 36 hours normal use (72h Low Power mode)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_galaxy_watch_6',
      title: 'Samsung Galaxy Watch6 Classic LTE (47mm Rotating Bezel)',
      slug: 'samsung-galaxy-watch6-classic-47mm',
      brand: 'Samsung',
      category: 'Smart Watches',
      price: 36999,
      minPrice: 36999,
      originalPrice: 43999,
      discountPct: 16,
      description: 'Timeless rotating bezel design with 30% slimmer bezels and larger sapphire crystal display. Advanced sleep coaching, ECG, Blood Pressure, and BioActive sensor monitoring.',
      media: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.6,
      ratingCount: 3820,
      soldCount: 14100,
      inStock: true,
      isDeal: false,
      specs: {
        'Display': '1.5-inch Super AMOLED (480x480) Sapphire Crystal',
        'Sensors': 'Optical Heart Rate, Electrical Heart (ECG), BIA Body Composition',
        'Connectivity': '4G LTE eSIM, Bluetooth 5.3, Wi-Fi, NFC',
      },
      createdAt: new Date().toISOString(),
    },

    // --- ACCESSORIES & GAMING ---
    {
      _id: 'prod_keychron_q1',
      title: 'Keychron Q1 Pro QMK/VIA Wireless Custom Mechanical Keyboard',
      slug: 'keychron-q1-pro-wireless-keyboard',
      brand: 'Keychron',
      category: 'Gaming & Desk',
      price: 18499,
      minPrice: 18499,
      originalPrice: 21999,
      discountPct: 16,
      description: 'Full CNC machined 6063 aluminum body with double-gasket design, hot-swappable Keychron K Pro Banana tactile switches, South-facing RGB, and screw-in PCB stabilizers.',
      media: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 1890,
      soldCount: 6200,
      inStock: true,
      isDeal: true,
      specs: {
        'Chassis': 'Full CNC Machined Aluminum (1.75 kg)',
        'Switches': 'Keychron K Pro Tactile Banana (Factory Lubed)',
        'Keycaps': 'OSA Profile Double-Shot PBT',
        'Connection': 'Bluetooth 5.1 & Type-C wired (1000Hz polling rate)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_mx_master_3s',
      title: 'Logitech MX Master 3S Performance Wireless Mouse (Pale Gray)',
      slug: 'logitech-mx-master-3s-mouse',
      brand: 'Logitech',
      category: 'Gaming & Desk',
      price: 9495,
      minPrice: 9495,
      originalPrice: 11495,
      discountPct: 17,
      description: 'Quiet Click technology with MagSpeed electromagnetic scrolling that scrolls 1,000 lines per second. 8,000 DPI Darkfield sensor that tracks on glass.',
      media: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 14200,
      soldCount: 52000,
      inStock: true,
      isDeal: true,
      specs: {
        'DPI Range': '200 to 8000 DPI (tracks on any surface including glass)',
        'Buttons': '7 buttons with gesture button and thumb wheel',
        'Battery': 'Up to 70 days on a single full charge',
      },
      createdAt: new Date().toISOString(),
    },

    // --- CAMERAS ---
    {
      _id: 'prod_sony_a7iv',
      title: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera (Body Only)',
      slug: 'sony-alpha-7-iv-mirrorless-camera',
      brand: 'Sony',
      category: 'Cameras & Drones',
      price: 219990,
      minPrice: 219990,
      originalPrice: 242490,
      discountPct: 9,
      description: '33MP Exmor R back-illuminated CMOS sensor with BIONZ XR engine. Real-time Eye AF for humans, animals, and birds in photo and 4K 60p 10-bit 4:2:2 video.',
      media: [
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 1640,
      soldCount: 5100,
      inStock: true,
      isDeal: false,
      specs: {
        'Sensor': '33.0 Megapixel 35mm Full-Frame Exmor R CMOS',
        'Video Recording': '4K 60p in Super 35mm, 4K 30p 7K oversampling',
        'Stabilization': '5-axis in-body optical image stabilization (5.5 steps)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_dji_mini_4_pro',
      title: 'DJI Mini 4 Pro Fly More Combo (DJI RC 2 Screen Remote)',
      slug: 'dji-mini-4-pro-drone-combo',
      brand: 'DJI',
      category: 'Cameras & Drones',
      price: 114990,
      minPrice: 114990,
      originalPrice: 129990,
      discountPct: 12,
      description: 'Ultra-light foldable under 249g drone with Omnidirectional Obstacle Sensing, 4K/60fps HDR True Vertical Shooting, 20km FHD video transmission, and 34-min flight time.',
      media: [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 890,
      soldCount: 3200,
      inStock: true,
      isDeal: true,
      specs: {
        'Takeoff Weight': '< 249 grams (no pilot license needed)',
        'Camera Sensor': '1/1.3-inch CMOS with dual native ISO fusion',
        'Max Flight Time': '34 minutes (standard) / 45 minutes (Plus battery)',
      },
      createdAt: new Date().toISOString(),
    },

    // --- FASHION & SNEAKERS ---
    {
      _id: 'prod_jordan_1_chicago',
      title: 'Air Jordan 1 Retro High OG "Lost & Found" (Chicago Colorway)',
      slug: 'air-jordan-1-retro-high-og-chicago',
      brand: 'Nike',
      category: 'Sneakers & Fashion',
      price: 24995,
      minPrice: 24995,
      originalPrice: 29995,
      discountPct: 17,
      description: 'The iconic 1985 silhouette with vintage aged leather detailing, cracked black leather collar, pre-yellowed midsole, and original Nike Air tongue branding.',
      media: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 3410,
      soldCount: 11200,
      inStock: true,
      isDeal: true,
      specs: {
        'Upper Material': 'Premium Full-Grain Leather with vintage cracking',
        'Cushioning': 'Encapsulated Air-Sole unit in heel',
        'Sole': 'Solid rubber cupsole with pivot circle traction',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_ultraboost_light',
      title: 'Adidas Ultraboost Light Running Shoes (Core Black / Cloud White)',
      slug: 'adidas-ultraboost-light-running',
      brand: 'Adidas',
      category: 'Sneakers & Fashion',
      price: 13999,
      minPrice: 13999,
      originalPrice: 18999,
      discountPct: 26,
      description: 'Experience epic energy return with the lightest Ultraboost ever made. 30% lighter Light BOOST material paired with Linear Energy Push system.',
      media: [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 5120,
      soldCount: 18400,
      inStock: true,
      isDeal: true,
      specs: {
        'Midsole': 'Light BOOST (30% lighter than standard Boost)',
        'Upper': 'Adidas PRIMEKNIT+ textile (at least 50% recycled)',
        'Outsole': 'Continental™ Better Rubber with LEP 2.0 system',
      },
      createdAt: new Date().toISOString(),
    },
    // --- HOME & ENTERTAINMENT ---
    {
      _id: 'prod_ipad_pro_m4',
      title: 'Apple iPad Pro 11-inch M4 (Ultra Retina XDR OLED, 256 GB, Space Black)',
      slug: 'apple-ipad-pro-11inch-m4-256gb',
      brand: 'Apple',
      category: 'Mobiles & Tablets',
      price: 99900,
      minPrice: 99900,
      originalPrice: 109900,
      discountPct: 9,
      description: 'The thinnest Apple product ever. Breakthrough Ultra Retina XDR tandem OLED display with 1600 nits peak HDR brightness. Outrageously powerful Apple M4 chip with 38 TOPS Neural Engine.',
      media: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 2840,
      soldCount: 9400,
      inStock: true,
      isDeal: true,
      specs: {
        'Display': '11-inch Tandem OLED Ultra Retina XDR (120Hz ProMotion)',
        'Processor': 'Apple M4 chip (9-core CPU, 10-core GPU, Hardware Ray Tracing)',
        'Storage': '256 GB NVMe',
        'Camera': '12MP Wide rear + LiDAR Scanner + 12MP Landscape Front Camera',
        'Thickness': '5.3 mm (Ultra Thin)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_ps5_slim',
      title: 'Sony PlayStation 5 Slim Console (1TB SSD, 4K 120Hz, DualSense Wireless)',
      slug: 'sony-playstation-5-slim-console',
      brand: 'Sony',
      category: 'Gaming & Desk',
      price: 44990,
      minPrice: 44990,
      originalPrice: 54990,
      discountPct: 18,
      description: 'Experience lightning-fast loading with an ultra-high speed 1TB SSD, deeper immersion with haptic feedback, adaptive triggers, 3D Audio, and an all-new slim design.',
      media: [
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 19840,
      soldCount: 64200,
      inStock: true,
      isDeal: true,
      specs: {
        'Storage': '1 TB Ultra-High Speed NVMe SSD',
        'Graphics': 'AMD Radeon RDNA 2-based graphics engine with Ray Tracing',
        'Frame Rate': 'Up to 120fps with 120Hz output on 4K displays',
        'Audio': 'Tempest 3D AudioTech',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_bose_qc_ultra',
      title: 'Bose QuietComfort Ultra Wireless Earbuds with Spatial Audio',
      slug: 'bose-quietcomfort-ultra-earbuds',
      brand: 'Bose',
      category: 'Audio & Soundbars',
      price: 24900,
      minPrice: 24900,
      originalPrice: 29900,
      discountPct: 16,
      description: 'World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for more immersive listening no matter the content. CustomTune technology shapes sound to your ears.',
      media: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 3120,
      soldCount: 11200,
      inStock: true,
      isDeal: false,
      specs: {
        'Noise Cancellation': 'CustomTune acoustic calibration with Quiet, Aware & Immersion modes',
        'Battery Life': 'Up to 6 hours (up to 4 hours with Immersive Audio)',
        'Bluetooth': 'Bluetooth 5.3 with Snapdragon Sound (aptX Adaptive)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_sony_bravia_oled',
      title: 'Sony BRAVIA XR 55-inch 4K Ultra HD Smart Google OLED TV',
      slug: 'sony-bravia-xr-55inch-oled-tv',
      brand: 'Sony',
      category: 'Laptops & Computers',
      price: 149990,
      minPrice: 149990,
      originalPrice: 189990,
      discountPct: 21,
      description: 'Pure OLED black and stunning brightness driven by the intelligent Cognitive Processor XR. Acoustic Surface Audio+ turns the screen into a multi-channel speaker.',
      media: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 1420,
      soldCount: 4100,
      inStock: true,
      isDeal: true,
      specs: {
        'Display': '55-inch 4K OLED (3840 x 2160) 120Hz Cognitive XR',
        'Audio': 'Acoustic Surface Audio+ with built-in dual subwoofers (50W)',
        'Smart TV': 'Google TV with hands-free voice search & Apple AirPlay 2',
        'Gaming': 'HDMI 2.1, 4K/120fps, VRR, ALLM, Auto HDR Tone Mapping',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_dyson_v12',
      title: 'Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner',
      slug: 'dyson-v12-detect-slim-vacuum',
      brand: 'Dyson',
      category: 'Gaming & Desk',
      price: 49900,
      minPrice: 49900,
      originalPrice: 59900,
      discountPct: 16,
      description: 'Dyson’s lightest intelligent cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor counts and measures dust particles for scientific proof of deep cleaning.',
      media: [
        'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 2120,
      soldCount: 6800,
      inStock: true,
      isDeal: false,
      specs: {
        'Suction Power': '150 Air Watts Dyson Hyperdymium Motor (125,000 RPM)',
        'Run Time': 'Up to 60 minutes fade-free suction',
        'Filtration': 'Whole-machine HEPA filtration traps 99.99% of particles down to 0.1 microns',
        'Weight': '2.2 kg ultra-lightweight',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_rayban_meta',
      title: 'Ray-Ban Meta Wayfarer Smart Glasses (Matte Black, Polarized)',
      slug: 'ray-ban-meta-wayfarer-smart-glasses',
      brand: 'Ray-Ban',
      category: 'Smart Watches',
      price: 29990,
      minPrice: 29990,
      originalPrice: 34990,
      discountPct: 14,
      description: 'Next-generation smart glasses with ultra-wide 12MP camera, 5-microphone array for spatial audio, open-ear custom speakers, and hands-free Meta AI voice assistance.',
      media: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 3840,
      soldCount: 12100,
      inStock: true,
      isDeal: true,
      specs: {
        'Camera': '12 MP ultra-wide sensor, 1080p 60fps video capture',
        'Audio': '2 custom-built open-ear micro-speakers with directional audio',
        'Microphone': '5-mic array with wind noise suppression',
        'Storage': '32 GB flash memory (holds 500+ photos or 100+ 30s videos)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_oneplus_12',
      title: 'OnePlus 12 5G (Flowy Emerald, 16GB RAM, 512GB Storage)',
      slug: 'oneplus-12-5g-512gb',
      brand: 'OnePlus',
      category: 'Mobiles & Tablets',
      price: 64999,
      minPrice: 64999,
      originalPrice: 69999,
      discountPct: 7,
      description: 'Powered by Snapdragon 8 Gen 3 with 4th Gen Hasselblad Camera for Mobile, 2K 120Hz ProXDR Display, and ultra-fast 100W SUPERVOOC charging.',
      media: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 5410,
      soldCount: 18200,
      inStock: true,
      isDeal: true,
      specs: {
        'Processor': 'Snapdragon 8 Gen 3 Mobile Platform',
        'RAM': '16 GB LPDDR5X',
        'Storage': '512 GB UFS 4.0',
        'Charging': '100W SUPERVOOC wired + 50W AIRVOOC wireless',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_nothing_phone_2',
      title: 'Nothing Phone (2) (Dark Grey, 12GB RAM, 256GB Storage)',
      slug: 'nothing-phone-2-256gb',
      brand: 'Nothing',
      category: 'Mobiles & Tablets',
      price: 36999,
      minPrice: 36999,
      originalPrice: 44999,
      discountPct: 17,
      description: 'Iconic transparent back design with Glyph Interface LED notification glyphs. Snapdragon 8+ Gen 1 chip and 50MP Sony dual camera setup.',
      media: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.6,
      ratingCount: 4210,
      soldCount: 14800,
      inStock: true,
      isDeal: false,
      specs: {
        'Display': '6.7-inch Flexible LTPO OLED (1-120Hz)',
        'Processor': 'Snapdragon 8+ Gen 1 (4nm)',
        'Glyph Interface': '33 addressable LED lighting zones',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_dell_xps_15',
      title: 'Dell XPS 15 9530 (13th Gen Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070)',
      slug: 'dell-xps-15-9530-oled',
      brand: 'Dell',
      category: 'Laptops & Computers',
      price: 239990,
      minPrice: 239990,
      originalPrice: 269990,
      discountPct: 11,
      description: 'Immersive 3.5K OLED InfinityEdge touch display with CNC machined aluminum chassis, carbon fiber palm rest, and NVIDIA GeForce RTX 4070 power.',
      media: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 1120,
      soldCount: 3900,
      inStock: true,
      isDeal: false,
      specs: {
        'Processor': '13th Gen Intel Core i9-13900H (14 Cores, 20 Threads)',
        'Display': '15.6-inch 3.5K (3456x2160) OLED Touch (400 nits)',
        'Graphics': 'NVIDIA GeForce RTX 4070 (8GB GDDR6)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_lenovo_legion',
      title: 'Lenovo Legion Pro 7i Gaming Laptop (Core i9-14900HX, RTX 4080, 32GB)',
      slug: 'lenovo-legion-pro-7i-rtx4080',
      brand: 'Lenovo',
      category: 'Laptops & Computers',
      price: 254990,
      minPrice: 254990,
      originalPrice: 289990,
      discountPct: 12,
      description: 'AI-tuned gaming beast with Legion Coldfront 5.0 vapor chamber cooling, 16-inch 240Hz WQXGA PureSight Gaming display, and Per-Key RGB keyboard.',
      media: [
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 1680,
      soldCount: 4500,
      inStock: true,
      isDeal: true,
      specs: {
        'Processor': 'Intel Core i9-14900HX (24 Cores, 32 Threads)',
        'Graphics': 'NVIDIA GeForce RTX 4080 (12GB GDDR6, 175W TGP)',
        'Display': '16-inch WQXGA (2560x1600) 240Hz 500 nits 100% DCI-P3',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_sennheiser_m4',
      title: 'Sennheiser Momentum 4 Wireless ANC Headphones (60-Hour Battery)',
      slug: 'sennheiser-momentum-4-wireless',
      brand: 'Sennheiser',
      category: 'Audio & Soundbars',
      price: 24990,
      minPrice: 24990,
      originalPrice: 34990,
      discountPct: 28,
      description: 'Audiophile-inspired 42mm transducer system delivering brilliant dynamics, clarity, and musicality. Next-generation Adaptive Noise Cancellation with unmatched 60h playback.',
      media: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 4120,
      soldCount: 14200,
      inStock: true,
      isDeal: true,
      specs: {
        'Battery Life': 'Unsurpassed 60-hour playtime on a single charge',
        'Drivers': '42mm audiophile-grade dynamic drivers',
        'ANC': 'Adaptive Noise Cancellation with Transparency mode',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_marshall_emberton',
      title: 'Marshall Emberton II Portable Bluetooth Speaker (Black & Brass)',
      slug: 'marshall-emberton-ii-speaker',
      brand: 'Marshall',
      category: 'Audio & Soundbars',
      price: 14999,
      minPrice: 14999,
      originalPrice: 17999,
      discountPct: 16,
      description: 'Iconic Marshall design in a pocket-sized waterproof speaker. 30+ hours of portable playtime on a single charge with multi-host Stack Mode pairing.',
      media: [
        'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 3820,
      soldCount: 16800,
      inStock: true,
      isDeal: false,
      specs: {
        'Battery Life': '30+ hours of portable playtime',
        'Water Resistance': 'IP67 dust and water resistance',
        'Audio': 'True Stereophonic 360-degree multidirectional sound',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_garmin_fenix_7',
      title: 'Garmin Fenix 7 Pro Sapphire Solar GPS Multisport Watch',
      slug: 'garmin-fenix-7-pro-sapphire-solar',
      brand: 'Garmin',
      category: 'Smart Watches',
      price: 89990,
      minPrice: 89990,
      originalPrice: 99990,
      discountPct: 10,
      description: 'The ultimate multisport GPS watch with scratch-resistant Power Sapphire solar charging lens, built-in LED flashlight, multi-band GPS, and 22-day solar battery life.',
      media: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 1450,
      soldCount: 4200,
      inStock: true,
      isDeal: false,
      specs: {
        'Glass': 'Power Sapphire Solar Charging lens',
        'Bezel': 'Titanium with Diamond-Like Carbon (DLC) coating',
        'Battery': 'Up to 22 days in smartwatch mode with solar',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_pixel_watch_2',
      title: 'Google Pixel Watch 2 (Matte Black Aluminum, Obsidian Active Band)',
      slug: 'google-pixel-watch-2',
      brand: 'Google',
      category: 'Smart Watches',
      price: 32990,
      minPrice: 32990,
      originalPrice: 39990,
      discountPct: 17,
      description: 'All-new quad-core CPU with Fitbit heart rate tracking, cEDA stress management, skin temperature sensor, and seamless Google Assistant integration.',
      media: [
        'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.6,
      ratingCount: 2840,
      soldCount: 9800,
      inStock: true,
      isDeal: true,
      specs: {
        'Battery': '24-hour battery with Always-on Display + fast charging',
        'Sensors': 'Multi-path optical heart rate sensor, cEDA electrical sensor',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_canon_r6_ii',
      title: 'Canon EOS R6 Mark II Mirrorless Camera (Body Only)',
      slug: 'canon-eos-r6-mark-ii',
      brand: 'Canon',
      category: 'Cameras & Drones',
      price: 215995,
      minPrice: 215995,
      originalPrice: 243995,
      discountPct: 11,
      description: '24.2 MP full-frame CMOS sensor with up to 40 fps electronic shutter burst, 6K oversampled 4K 60p uncropped video recording, and Dual Pixel CMOS AF II.',
      media: [
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 920,
      soldCount: 3100,
      inStock: true,
      isDeal: false,
      specs: {
        'Sensor': '24.2 Megapixel Full-Frame CMOS Sensor',
        'Burst Shooting': 'Up to 40 fps with electronic shutter',
        'Image Stabilization': 'In-Body Image Stabilizer up to 8 stops of shake correction',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_gopro_hero12',
      title: 'GoPro HERO12 Black Waterproof Action Camera (5.3K 60fps)',
      slug: 'gopro-hero12-black-action-camera',
      brand: 'GoPro',
      category: 'Cameras & Drones',
      price: 37990,
      minPrice: 37990,
      originalPrice: 45000,
      discountPct: 15,
      description: 'Incredible 5.3K 60fps and 4K 120fps video with Emmy-award winning HyperSmooth 6.0 video stabilization, HDR photo and video, and rugged waterproof up to 33ft.',
      media: [
        'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 4890,
      soldCount: 19400,
      inStock: true,
      isDeal: true,
      specs: {
        'Video Resolution': '5.3K60, 4K120, 2.7K240 slo-mo video',
        'Stabilization': 'HyperSmooth 6.0 with 360-degree Horizon Lock',
        'Waterproof': 'Rugged + waterproof down to 10m (33ft) without housing',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_xbox_series_x',
      title: 'Microsoft Xbox Series X 1TB Gaming Console (True 4K Gaming)',
      slug: 'microsoft-xbox-series-x-1tb',
      brand: 'Microsoft',
      category: 'Gaming & Desk',
      price: 47990,
      minPrice: 47990,
      originalPrice: 55990,
      discountPct: 14,
      description: 'The fastest, most powerful Xbox ever. 12 teraflops of raw graphic processing power, DirectX ray tracing, custom 1TB NVMe SSD, and 120 FPS gaming.',
      media: [
        'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 8210,
      soldCount: 28400,
      inStock: true,
      isDeal: true,
      specs: {
        'Processing Power': '12 Teraflops GPU with AMD RDNA 2 Architecture',
        'Storage': '1TB Custom NVMe SSD with Xbox Velocity Architecture',
        'Performance Target': 'True 4K Gaming at up to 120 FPS, 8K HDR Ready',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_nintendo_switch_oled',
      title: 'Nintendo Switch OLED Model with White Joy-Con (64GB)',
      slug: 'nintendo-switch-oled-white',
      brand: 'Nintendo',
      category: 'Gaming & Desk',
      price: 28990,
      minPrice: 28990,
      originalPrice: 34990,
      discountPct: 17,
      description: 'Features a vibrant 7-inch OLED screen with vivid colors and crisp contrast, a wide adjustable stand, a dock with a wired LAN port, and enhanced audio.',
      media: [
        'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 11200,
      soldCount: 46000,
      inStock: true,
      isDeal: false,
      specs: {
        'Screen': '7.0-inch OLED multi-touch screen (1280x720)',
        'Storage': '64 GB internal storage (expandable via microSD)',
        'Battery Life': 'Approximately 4.5 to 9 hours',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_yeezy_350_onyx',
      title: 'Adidas Yeezy Boost 350 V2 "Onyx" (Triple Black Sneaker)',
      slug: 'adidas-yeezy-boost-350-v2-onyx',
      brand: 'Adidas',
      category: 'Sneakers & Fashion',
      price: 22999,
      minPrice: 22999,
      originalPrice: 26999,
      discountPct: 15,
      description: 'Re-engineered Primeknit upper in stealthy monochrome Onyx palette with signature post-dyed monofilament side stripe and full-length responsive Boost cushioning.',
      media: [
        'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 2940,
      soldCount: 9200,
      inStock: true,
      isDeal: true,
      specs: {
        'Upper': 'Re-engineered Primeknit with translucent side stripe',
        'Midsole': 'Full-length adidas Boost technology in ribbed TPU cage',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_nike_dunk_panda',
      title: 'Nike Dunk Low Retro "Panda" (White/Black Classic)',
      slug: 'nike-dunk-low-retro-panda',
      brand: 'Nike',
      category: 'Sneakers & Fashion',
      price: 8695,
      minPrice: 8695,
      originalPrice: 10995,
      discountPct: 21,
      description: 'The basketball icon of the 80s returns with crisp leather overlays and original color-blocking. Padded, low-cut collar looks sleek and feels comfortable.',
      media: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 9400,
      soldCount: 38200,
      inStock: true,
      isDeal: false,
      specs: {
        'Upper Material': 'Crisp real leather with vintage softness',
        'Outsole': 'Classic hoops pivot circle rubber outsole',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_iphone_15_base',
      title: 'Apple iPhone 15 (Blue, 128 GB)',
      slug: 'apple-iphone-15-128gb-blue',
      brand: 'Apple',
      category: 'Mobiles & Tablets',
      price: 71999,
      minPrice: 71999,
      originalPrice: 79900,
      discountPct: 10,
      description: 'Dynamic Island bubbles up alerts and Live Activities. 48MP Main camera with 2x Telephoto. Color-infused glass and aluminum design with USB-C.',
      media: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 16840,
      soldCount: 54200,
      inStock: true,
      isDeal: true,
      specs: {
        'Display': '6.1-inch Super Retina XDR OLED',
        'Processor': 'A16 Bionic chip',
        'Camera': '48MP Main + 12MP Ultra Wide with 2x Telephoto',
        'Connector': 'USB-C',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_pixel_8a',
      title: 'Google Pixel 8a (Aloe, 128 GB)',
      slug: 'google-pixel-8a-aloe-128gb',
      brand: 'Google',
      category: 'Mobiles & Tablets',
      price: 49999,
      minPrice: 49999,
      originalPrice: 52999,
      discountPct: 6,
      description: 'Delightful AI phone with Google Tensor G3, Best Take, Audio Magic Eraser, and 7 years of OS and security updates with matte back finish.',
      media: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.6,
      ratingCount: 3820,
      soldCount: 11200,
      inStock: true,
      isDeal: false,
      specs: {
        'Processor': 'Google Tensor G3 with Titan M2 security coprocessor',
        'Display': '6.1-inch Actua Display (60-120Hz OLED)',
        'Camera': '64MP Quad PD wide + 13MP ultrawide',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_samsung_zflip5',
      title: 'Samsung Galaxy Z Flip5 5G (Mint, 256 GB)',
      slug: 'samsung-galaxy-z-flip5-mint',
      brand: 'Samsung',
      category: 'Mobiles & Tablets',
      price: 79999,
      minPrice: 79999,
      originalPrice: 99999,
      discountPct: 20,
      description: 'Pocket-sized fold with huge 3.4-inch Flex Window cover screen, zero-gap Flex Hinge, hands-free FlexCam selfies, and IPX8 water resistance.',
      media: [
        'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 5120,
      soldCount: 17400,
      inStock: true,
      isDeal: true,
      specs: {
        'Main Screen': '6.7-inch Dynamic AMOLED 2X (120Hz Adaptive)',
        'Cover Screen': '3.4-inch Super AMOLED 60Hz Flex Window',
        'Processor': 'Snapdragon 8 Gen 2 Mobile Platform for Galaxy',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_macbook_pro_16',
      title: 'Apple MacBook Pro 16-inch M3 Max (36GB Unified Memory, 1TB SSD)',
      slug: 'apple-macbook-pro-16-m3-max',
      brand: 'Apple',
      category: 'Laptops & Computers',
      price: 349900,
      minPrice: 349900,
      originalPrice: 379900,
      discountPct: 8,
      description: 'The pinnacle of laptop performance with Apple M3 Max (14-core CPU, 30-core GPU), Liquid Retina XDR display with 1600 nits peak, and Space Black finish.',
      media: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 940,
      soldCount: 2800,
      inStock: true,
      isDeal: false,
      specs: {
        'Processor': 'Apple M3 Max (14-Core CPU, 30-Core GPU, 16-Core Neural Engine)',
        'Memory': '36 GB Unified Memory (300GB/s memory bandwidth)',
        'Display': '16.2-inch Liquid Retina XDR (3456x2234 at 120Hz ProMotion)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_asus_zenbook_duo',
      title: 'ASUS Zenbook Duo Dual 14-inch 3K OLED (Intel Core Ultra 9, 32GB, 1TB)',
      slug: 'asus-zenbook-duo-dual-oled',
      brand: 'ASUS',
      category: 'Laptops & Computers',
      price: 199990,
      minPrice: 199990,
      originalPrice: 229990,
      discountPct: 13,
      description: 'Revolutionary dual-screen laptop featuring two 14-inch 3K 120Hz ASUS Lumina OLED touchscreens with a detachable Bluetooth keyboard and built-in kickstand.',
      media: [
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 820,
      soldCount: 2400,
      inStock: true,
      isDeal: true,
      specs: {
        'Screens': 'Dual 14.0-inch 3K (2880 x 1800) OLED 120Hz 0.2ms touchscreens',
        'Processor': 'Intel Core Ultra 9 Processor 185H with Intel AI Boost NPU',
        'Weight': '1.35 kg (without keyboard) / 1.65 kg (with keyboard)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_airpods_max',
      title: 'Apple AirPods Max Wireless Over-Ear Headphones (Space Grey)',
      slug: 'apple-airpods-max-space-grey',
      brand: 'Apple',
      category: 'Audio & Soundbars',
      price: 59900,
      minPrice: 59900,
      originalPrice: 64900,
      discountPct: 8,
      description: 'High-fidelity audio with computational audio powered by Apple H1 chip. Active Noise Cancellation with Transparency mode and spatial audio with dynamic head tracking.',
      media: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.7,
      ratingCount: 6840,
      soldCount: 19200,
      inStock: true,
      isDeal: true,
      specs: {
        'Acoustic Design': 'Apple-designed dynamic driver with dual neodymium ring magnet',
        'Materials': 'Knit-mesh canopy and memory foam acoustic ear cushions',
        'Battery': 'Up to 20 hours listening time on a single charge with ANC on',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_jbl_partybox_320',
      title: 'JBL PartyBox Stage 320 Portable Party Speaker (240W RMS, Lightshow)',
      slug: 'jbl-partybox-stage-320',
      brand: 'JBL',
      category: 'Audio & Soundbars',
      price: 39999,
      minPrice: 39999,
      originalPrice: 47999,
      discountPct: 17,
      description: 'Transform any space into a party with 240W of powerful JBL Pro Sound, dynamic starry lightshow, telescopic handle and wide sturdy wheels, and 18h playtime.',
      media: [
        'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 3120,
      soldCount: 8400,
      inStock: true,
      isDeal: false,
      specs: {
        'Output Power': '240W RMS with AI Sound Boost technology',
        'Playtime': 'Up to 18 hours with replaceable battery pack',
        'Splashproof': 'IPX4 splashproof rating',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_sony_wf1000xm5',
      title: 'Sony WF-1000XM5 Truly Wireless Noise Cancelling Earbuds (Black)',
      slug: 'sony-wf-1000xm5-wireless-earbuds',
      brand: 'Sony',
      category: 'Audio & Soundbars',
      price: 21990,
      minPrice: 21990,
      originalPrice: 29990,
      discountPct: 27,
      description: 'The best noise cancelling truly wireless earbuds with Integrated Processor V2, Dynamic Driver X for wide frequency reproduction, and AI-based bone conduction sensors.',
      media: [
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 7820,
      soldCount: 26400,
      inStock: true,
      isDeal: true,
      specs: {
        'Processor': 'HD Noise Cancelling Processor QN2e + Integrated Processor V2',
        'Driver Unit': '8.4mm Dynamic Driver X',
        'Battery Life': 'Up to 8 hours (24 hours total with charging case)',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_apple_watch_s9',
      title: 'Apple Watch Series 9 GPS 45mm (Midnight Aluminum, Sport Band)',
      slug: 'apple-watch-series-9-45mm',
      brand: 'Apple',
      category: 'Smart Watches',
      price: 44900,
      minPrice: 44900,
      originalPrice: 47900,
      discountPct: 6,
      description: 'Smarter, brighter, and mightier with the S9 SiP chip. A magical new Double Tap gesture to interact without touching the screen, and up to 2000 nits display brightness.',
      media: [
        'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 6410,
      soldCount: 22100,
      inStock: true,
      isDeal: false,
      specs: {
        'Chip': 'S9 SiP with 64-bit dual-core processor and 4-core Neural Engine',
        'Display': 'Always-On Retina LTPO OLED display up to 2000 nits',
        'Sensors': 'Blood Oxygen, ECG, Temperature sensing, Crash Detection',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_dji_osmo_pocket_3',
      title: 'DJI Osmo Pocket 3 Creator Combo (1-inch CMOS 4K 120fps Gimbal)',
      slug: 'dji-osmo-pocket-3-creator-combo',
      brand: 'DJI',
      category: 'Cameras & Drones',
      price: 54990,
      minPrice: 54990,
      originalPrice: 62990,
      discountPct: 13,
      description: 'Pocket-sized gimbal camera with 1-inch CMOS sensor, 4K/120fps video, 3-axis mechanical stabilization, 2-inch rotatable OLED touchscreen, and DJI Mic 2 transmitter included.',
      media: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 2120,
      soldCount: 6800,
      inStock: true,
      isDeal: true,
      specs: {
        'Sensor': '1-inch CMOS Sensor with 10-bit D-Log M and HLG',
        'Screen': '2.0-inch rotatable OLED display (314x556)',
        'Audio': 'Three-microphone array with omnidirectional stereo recording',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_insta360_x4',
      title: 'Insta360 X4 8K 360-Degree Waterproof Action Camera',
      slug: 'insta360-x4-8k-action-camera',
      brand: 'Insta360',
      category: 'Cameras & Drones',
      price: 44990,
      minPrice: 44990,
      originalPrice: 51990,
      discountPct: 13,
      description: 'Unbelievable 8K 30fps 360-degree capture with 5.7K 60fps, 4K 100fps bullet time, Invisible Selfie Stick effect, FlowState Stabilization, and rugged waterproof to 10m.',
      media: [
        'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 1640,
      soldCount: 5200,
      inStock: true,
      isDeal: false,
      specs: {
        'Video Resolution': '8K at 30fps, 5.7K at 60fps, 4K at 100fps',
        'Battery': 'Heavy-duty 2290mAh battery (up to 135 minutes recording)',
        'Touchscreen': '2.5-inch Corning Gorilla Glass touchscreen',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_steam_deck_oled',
      title: 'Valve Steam Deck OLED 512GB Handheld Gaming Console',
      slug: 'valve-steam-deck-oled-512gb',
      brand: 'Valve',
      category: 'Gaming & Desk',
      price: 59999,
      minPrice: 59999,
      originalPrice: 69999,
      discountPct: 14,
      description: 'Brilliant 7.4-inch 90Hz HDR OLED screen with pure blacks and striking colors. Custom 6nm AMD APU, faster Wi-Fi 6E, and 50W battery for longer AAA gaming sessions.',
      media: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 3820,
      soldCount: 11400,
      inStock: true,
      isDeal: true,
      specs: {
        'Screen': '7.4-inch diagonal 90Hz HDR OLED display (1280 x 800)',
        'Processor': '6nm AMD APU (Zen 2 4c/8t, 8 RDNA 2 CUs)',
        'Storage': '512GB NVMe SSD with high-speed microSD slot',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_logitech_g_pro_superlight',
      title: 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse',
      slug: 'logitech-g-pro-x-superlight-2',
      brand: 'Logitech',
      category: 'Gaming & Desk',
      price: 14995,
      minPrice: 14995,
      originalPrice: 16995,
      discountPct: 12,
      description: 'Engineered with esports pros. LIGHTFORCE hybrid optical-mechanical switches, HERO 2 sensor with 32,000 DPI, and sub-60 gram ultra-lightweight design.',
      media: [
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 6410,
      soldCount: 24800,
      inStock: true,
      isDeal: false,
      specs: {
        'Sensor': 'HERO 2 with 32,000 DPI and over 500 IPS tracking',
        'Weight': '60 grams featherlight',
        'Battery Life': 'Up to 95 hours constant motion',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_new_balance_9060',
      title: 'New Balance 9060 "Sea Salt" Chunky Retro Running Sneaker',
      slug: 'new-balance-9060-sea-salt',
      brand: 'New Balance',
      category: 'Sneakers & Fashion',
      price: 14999,
      minPrice: 14999,
      originalPrice: 17999,
      discountPct: 17,
      description: 'The 9060 reinterprets familiar elements from classic 99X models with a warped sensibility inspired by the proudly futuristic, visible tech aesthetic of the Y2K era.',
      media: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.8,
      ratingCount: 3410,
      soldCount: 12800,
      inStock: true,
      isDeal: true,
      specs: {
        'Cushioning': 'Dual-density midsole featuring ABZORB and SBS cushioning',
        'Upper': 'Mesh upper with premium pigskin suede overlays',
      },
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'prod_dyson_airwrap',
      title: 'Dyson Airwrap Multi-Styler Complete Long (Nickel / Copper)',
      slug: 'dyson-airwrap-multi-styler-complete',
      brand: 'Dyson',
      category: 'Beauty & Makeup',
      price: 49900,
      minPrice: 49900,
      originalPrice: 54900,
      discountPct: 9,
      description: 'Style with air, not extreme heat. Harnesses the Coanda effect to curl, shape, and hide flyaways using the digital motor V9 and intelligent heat control.',
      media: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      ],
      ratingAvg: 4.9,
      ratingCount: 4120,
      soldCount: 16400,
      inStock: true,
      isDeal: false,
      specs: {
        'Airflow': '13 litres/min powered by Dyson digital motor V9',
        'Heat Control': 'Measures airflow temperature over 40 times a second',
        'Attachments': 'Includes 6 re-engineered styling attachments + travel pouch',
      },
      createdAt: new Date().toISOString(),
    },
    {
      "_id": "prod_re_hunter_350",
      "title": "Royal Enfield Hunter 350 (Dapper Ash, Dual-Channel ABS)",
      "slug": "royal-enfield-hunter-350-dapper-ash",
      "brand": "Royal Enfield",
      "category": "Bikes & Automotive",
      "price": 169900,
      "minPrice": 169900,
      "originalPrice": 179900,
      "discountPct": 6,
      "description": "Built for city streets. Powered by the proven 349cc J-series fuel-injected engine delivering 20.2 bhp and 27 Nm torque, wide handlebars, dual-channel ABS, and retro-metro styling.",
      "media": [
            "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 5120,
      "soldCount": 14200,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Engine": "349cc Single Cylinder, 4-stroke, Air-Oil Cooled",
            "Power": "20.2 bhp @ 6100 rpm",
            "Torque": "27 Nm @ 4000 rpm",
            "Brakes": "Dual Channel ABS (300mm Front Disc / 270mm Rear Disc)",
            "Fuel Tank": "13 Litres"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_yamaha_r15_v4",
      "title": "Yamaha YZF R15 V4 (Racing Blue, Quick Shifter & Traction Control)",
      "slug": "yamaha-yzf-r15-v4-racing-blue",
      "brand": "Yamaha",
      "category": "Bikes & Automotive",
      "price": 187900,
      "minPrice": 187900,
      "originalPrice": 195900,
      "discountPct": 4,
      "description": "Born of Yamaha racing DNA. Features 155cc liquid-cooled 4-valve engine with Variable Valve Actuation (VVA), Assist & Slipper Clutch, upside down front forks, and aerodynamic fairing.",
      "media": [
            "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 7890,
      "soldCount": 22100,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Engine": "155cc Liquid-cooled 4-stroke SOHC 4-valve with VVA",
            "Power": "18.4 PS @ 10000 rpm",
            "Electronics": "Traction Control System, Quick Shifter, Y-Connect App",
            "Suspension": "Upside Down Telescopic Front Fork"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_ather_450x",
      "title": "Ather 450X Gen 3 High-Performance Electric Scooter (Space Grey)",
      "slug": "ather-450x-gen-3-electric-scooter",
      "brand": "Ather",
      "category": "Bikes & Automotive",
      "price": 144900,
      "minPrice": 144900,
      "originalPrice": 159900,
      "discountPct": 9,
      "description": "The fastest, smartest electric scooter. 3.7 kWh lithium-ion battery with 150 km certified range, Warp Mode delivering 0-40 km/h in 3.3s, and 7-inch interactive touchscreen with Google Maps navigation.",
      "media": [
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 3890,
      "soldCount": 11400,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "TrueRange": "105 km (Eco Mode) / 150 km IDC",
            "Acceleration": "0-40 km/h in 3.3 seconds (Warp Mode)",
            "Battery": "3.7 kWh Lithium-ion (IP67 Water & Dust Resistant)",
            "Dashboard": "7-inch TFT Touchscreen with Snapdragon Quad-Core"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_steelbird_sba1_helmet",
      "title": "Steelbird SBA-1 Pro Full Face ISI Certified Helmet (Matte Black)",
      "slug": "steelbird-sba-1-pro-full-face-helmet",
      "brand": "Steelbird",
      "category": "Bikes & Automotive",
      "price": 1699,
      "minPrice": 1699,
      "originalPrice": 2499,
      "discountPct": 32,
      "description": "High impact ABS shell engineered with dynamic ventilation system, anti-scratch polycarbonate quick-release visor, and hygienic breathable interior padding.",
      "media": [
            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 18450,
      "soldCount": 65000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Certification": "ISI Certified IS:4151 & DOT Compliant",
            "Material": "High-Impact Thermoplastic ABS Shell",
            "Visor": "Optical Grade UV Protected Anti-Scratch Visor"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_vega_bolt_helmet",
      "title": "Vega Bolt Bunny Black Neon Full Face Helmet with Dual Visor",
      "slug": "vega-bolt-bunny-full-face-helmet",
      "brand": "Vega",
      "category": "Bikes & Automotive",
      "price": 2150,
      "minPrice": 2150,
      "originalPrice": 2899,
      "discountPct": 26,
      "description": "Aggressive aerodynamic spoiler styling with drop-down sun shield visor, removable washable cheek pads, and high-density multi-channel EPS liner.",
      "media": [
            "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 9230,
      "soldCount": 38000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Visor": "Dual Visor (Clear Outer + Tinted Drop-down Sun Shield)",
            "Safety": "ISI Certified & Multi-Density EPS",
            "Weight": "1350g (+/- 50g)"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_motul_7100_oil",
      "title": "Motul 7100 4T 10W-50 100% Synthetic 1L Motorcycle Engine Oil",
      "slug": "motul-7100-4t-10w50-synthetic-oil",
      "brand": "Motul",
      "category": "Bikes & Automotive",
      "price": 899,
      "minPrice": 899,
      "originalPrice": 1150,
      "discountPct": 22,
      "description": "Formulated with Ester Core technology for high-performance 4-stroke engines. Delivers extreme shear stability, smooth gear shifting, and superior thermal resistance.",
      "media": [
            "https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 14200,
      "soldCount": 89000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Standards": "API SN / JASO MA2 (M033MOT161)",
            "Viscosity": "10W-50 Ester Technology",
            "Volume": "1 Litre"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_bosch_tyre_inflator",
      "title": "Bosch EasyPump Cordless Electric Air Compressor Tyre Pump (150 PSI)",
      "slug": "bosch-easypump-cordless-electric-air-compressor",
      "brand": "Bosch",
      "category": "Bikes & Automotive",
      "price": 4999,
      "minPrice": 4999,
      "originalPrice": 6500,
      "discountPct": 23,
      "description": "Compact, ergonomic tyre inflator with digital display, preset auto-shutoff up to 10.3 bar / 150 PSI, integrated LED light, and USB-C fast charging.",
      "media": [
            "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 6310,
      "soldCount": 24500,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Pressure Range": "0.3 - 10.3 bar (5 - 150 PSI) with Auto-Stop",
            "Battery": "3.6V / 3.0 Ah Lithium-Ion (USB-C Rechargeable)",
            "Display": "Digital backlit screen with real-time pressure readout"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_tvs_apache_160",
      "title": "TVS Apache RTR 160 4V (Knight Black, SmartXonnect Bluetooth)",
      "slug": "tvs-apache-rtr-160-4v-knight-black",
      "brand": "TVS",
      "category": "Bikes & Automotive",
      "price": 134900,
      "minPrice": 134900,
      "originalPrice": 142000,
      "discountPct": 5,
      "description": "Track-tuned 159.7cc oil-cooled 4-valve engine with 3 ride modes (Urban, Rain, Sport), Super-Moto ABS, Glide Through Technology (GTT), and race telemetry app.",
      "media": [
            "https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 4210,
      "soldCount": 16800,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Engine": "159.7cc Oil Cooled, 4 Valve, SOHC, Fi",
            "Power": "17.55 PS @ 9250 rpm (Sport Mode)",
            "Modes": "Urban, Rain, Sport Ride Modes"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_70mai_dash_cam",
      "title": "70mai Smart Dash Cam Pro Plus+ A500S (Sony IMX335, Dual Channel)",
      "slug": "70mai-smart-dash-cam-pro-plus-a500s",
      "brand": "70mai",
      "category": "Bikes & Automotive",
      "price": 9999,
      "minPrice": 9999,
      "originalPrice": 14999,
      "discountPct": 33,
      "description": "Crystal clear 1944P Ultra HD front camera and 1080P rear recording with Sony IMX335 sensor, built-in GPS with route logging, ADAS lane departure alerts, and 24h parking surveillance.",
      "media": [
            "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 8120,
      "soldCount": 31000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Resolution": "1944P Front + 1080P Rear Recording",
            "Sensor": "Sony IMX335 Sensor with 3D DNR & WDR Night Vision",
            "Smart Features": "Built-in GPS, ADAS Voice Alerts, G-Sensor Emergency Lock"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_rynox_riding_jacket",
      "title": "Rynox Stealth Evo V3 All-Weather Armoured Motorcycle Riding Jacket",
      "slug": "rynox-stealth-evo-v3-riding-jacket",
      "brand": "Rynox",
      "category": "Bikes & Automotive",
      "price": 11750,
      "minPrice": 11750,
      "originalPrice": 13500,
      "discountPct": 13,
      "description": "Premium heavy-duty touring jacket equipped with KNOX Microlock CE Level 2 armours on shoulders, elbows, and back. Includes independent external waterproof rain jacket and thermal liner.",
      "media": [
            "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 3410,
      "soldCount": 12500,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Armour": "KNOX Microlock CE Level 2 at Shoulders, Elbows & Back",
            "Chassis": "600D PU coated Cordura with Invista Cordura reinforcement",
            "Weather": "Dual Liner System (Detachable Rain Jacket + Thermal Liner)"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_gopro_chin_mount",
      "title": "GoPro Professional Helmet Action Camera Chin Mount Kit",
      "slug": "gopro-professional-helmet-chin-mount-kit",
      "brand": "GoPro",
      "category": "Bikes & Automotive",
      "price": 1499,
      "minPrice": 1499,
      "originalPrice": 2499,
      "discountPct": 40,
      "description": "Precision CNC aluminum hinge mount engineered for full-face helmets. Provides POV eye-level motorcycle riding video recording with zero helmet vibration.",
      "media": [
            "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 5210,
      "soldCount": 29000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Compatibility": "GoPro Hero 12/11/10/9, Insta360, DJI Action",
            "Mounting": "Industrial 3M VHB Curved Adhesive + Safety Tether"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_tusa_tpms",
      "title": "TUSA Wireless Solar Tyre Pressure Monitoring System for Cars & Bikes",
      "slug": "tusa-wireless-solar-tyre-pressure-monitoring-system",
      "brand": "TUSA",
      "category": "Bikes & Automotive",
      "price": 2999,
      "minPrice": 2999,
      "originalPrice": 4999,
      "discountPct": 40,
      "description": "Real-time tire pressure and temperature monitoring with external IP67 waterproof sensors, tempered solar panel charging, and audible leak warning alarms.",
      "media": [
            "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 4620,
      "soldCount": 19800,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Power": "Dual Charging (Solar Panel + Micro-USB)",
            "Sensors": "4 External IP67 Waterproof Sensors with Anti-Theft Nuts",
            "Alerts": "High/Low Pressure, High Temp, Fast Air Leakage"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_maybelline_matte_ink",
      "title": "Maybelline New York Super Stay Matte Ink Liquid Lipstick (Pioneer)",
      "slug": "maybelline-superstay-matte-ink-lipstick-pioneer",
      "brand": "Maybelline",
      "category": "Beauty & Makeup",
      "price": 489,
      "minPrice": 489,
      "originalPrice": 699,
      "discountPct": 30,
      "description": "Flawless matte finish that lasts up to 16 hours. Features a unique arrow applicator for precise application, waterproof formula, and highly pigmented rich red hue.",
      "media": [
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 32100,
      "soldCount": 142000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Finish": "Long-wear Transfer-proof Matte",
            "Stay Time": "Up to 16 Hours",
            "Shade": "20 Pioneer (True Iconic Red)"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_loreal_hyaluronic_serum",
      "title": "L'Oreal Paris Revitalift 1.5% Pure Hyaluronic Acid Plumping Face Serum (30ml)",
      "slug": "loreal-paris-revitalift-hyaluronic-acid-serum",
      "brand": "L'Oreal",
      "category": "Beauty & Makeup",
      "price": 699,
      "minPrice": 699,
      "originalPrice": 999,
      "discountPct": 30,
      "description": "Dermatologist-validated lightweight plumping face serum with 1.5% pure Hyaluronic Acid. Instantly hydrates, reduces fine lines by 60%, fragrance-free and paraben-free.",
      "media": [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 28400,
      "soldCount": 98000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Active Ingredient": "1.5% Pure Hyaluronic Acid (Micro + Macro Molecules)",
            "Benefits": "Instant hydration, radiance & 60% fine line reduction",
            "Formula": "Non-sticky, fragrance-free, suitable for all skin types"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_mac_studio_fix",
      "title": "M.A.C Studio Fix Fluid SPF 15 24hr Matte Foundation (NC30, 30ml)",
      "slug": "mac-studio-fix-fluid-foundation-nc30",
      "brand": "M.A.C",
      "category": "Beauty & Makeup",
      "price": 3600,
      "minPrice": 3600,
      "originalPrice": 4000,
      "discountPct": 10,
      "description": "The gold standard of liquid foundations. Provides 24-hour buildable medium-to-full coverage with a natural matte finish, oil control, and broad spectrum SPF 15.",
      "media": [
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 16400,
      "soldCount": 54000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Coverage": "Buildable Medium to Full Coverage",
            "Finish": "Natural Matte with 24-hour Wear",
            "Protection": "Broad Spectrum SPF 15 UVA/UVB"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_minimalist_niacinamide",
      "title": "Minimalist 10% Niacinamide + 1% Zinc Daily Blemish Clarifying Serum (30ml)",
      "slug": "minimalist-10-niacinamide-zinc-serum",
      "brand": "Minimalist",
      "category": "Beauty & Makeup",
      "price": 569,
      "minPrice": 569,
      "originalPrice": 599,
      "discountPct": 5,
      "description": "Pure Niacinamide (Vitamin B3) and Zinc PCA formula clinically proven to fade dark acne spots, regulate sebum production, and strengthen skin barrier.",
      "media": [
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 22100,
      "soldCount": 110000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Formulation": "10% Niacinamide with Zinc PCA + Eugenol",
            "Targets": "Acne Marks, Blemishes, Excess Sebum, Open Pores",
            "Skin Type": "Oily, Combination & Acne-Prone Skin"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_dyson_supersonic",
      "title": "Dyson Supersonic Hair Dryer (Iron / Fuchsia with 5 Styling Attachments)",
      "slug": "dyson-supersonic-hair-dryer-iron-fuchsia",
      "brand": "Dyson",
      "category": "Beauty & Makeup",
      "price": 34900,
      "minPrice": 34900,
      "originalPrice": 39900,
      "discountPct": 13,
      "description": "Fast drying with no extreme heat. Intelligent heat control measures air temperature 40 times a second to prevent extreme heat damage and protect hair shine.",
      "media": [
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 8900,
      "soldCount": 28000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Motor": "Dyson digital motor V9 spinning up to 110,000rpm",
            "Heat Control": "Intelligent microprocessor measures air 40x per second",
            "Attachments": "Flyaway attachment, Styling concentrator, Diffuser, Gentle air"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_philips_trimmer_5000",
      "title": "Philips BeardTrimmer Series 5000 (0.2mm Precision, 90 Mins Run Time)",
      "slug": "philips-beard-trimmer-series-5000",
      "brand": "Philips",
      "category": "Beauty & Makeup",
      "price": 2499,
      "minPrice": 2499,
      "originalPrice": 3495,
      "discountPct": 29,
      "description": "Self-sharpening full metal blades with Lift & Trim PRO system. 40 lock-in length settings with 0.2mm precision steps, 100% waterproof for easy cleaning.",
      "media": [
            "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 19800,
      "soldCount": 78000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Precision": "40 length settings (0.4mm - 20mm with 0.2mm increments)",
            "Battery": "Li-Ion battery with 90 mins runtime / 1 hr full charge",
            "Waterproofing": "100% fully washable under the tap"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_forest_essentials_cream",
      "title": "Forest Essentials Soundarya Radiance Cream with 24K Gold & SPF 25 (50g)",
      "slug": "forest-essentials-soundarya-radiance-cream",
      "brand": "Forest Essentials",
      "category": "Beauty & Makeup",
      "price": 5850,
      "minPrice": 5850,
      "originalPrice": 6200,
      "discountPct": 6,
      "description": "Ancient Ayurvedic formulation infused with 24 Karat Gold Bhasma, pure saffron extract, and cold-pressed organic sweet almond oil to visibly firm and impart a golden glow.",
      "media": [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 4120,
      "soldCount": 15400,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Key Ingredients": "24 Karat Pure Gold Bhasma, Saffron (Kesar), Yashad Bhasma",
            "SPF": "SPF 25 PA++ Natural Sun Protection",
            "Texture": "Ultra-rich restorative Ayurvedic cream"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_huda_eyeshadow_palette",
      "title": "Huda Beauty Empowered Eyeshadow Palette (18 Highly Pigmented Shades)",
      "slug": "huda-beauty-empowered-eyeshadow-palette",
      "brand": "Huda Beauty",
      "category": "Beauty & Makeup",
      "price": 5400,
      "minPrice": 5400,
      "originalPrice": 6100,
      "discountPct": 11,
      "description": "Ultimate luxury eyeshadow palette featuring 18 rich shades in buttery mattes, high-shine wet metallics, multi-reflective shimmer, and innovative hybrid gel eyeliner shades.",
      "media": [
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 6780,
      "soldCount": 22000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Shades": "18 versatile shades (Gold, Bronze, Berry, Copper & Neutrals)",
            "Formulas": "Velvet Mattes, Gel-to-Powder Liners, High-Shine Metallics"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_laneige_lip_mask",
      "title": "Laneige Lip Sleeping Mask EX (Berry Fruit Complex & Vitamin C, 20g)",
      "slug": "laneige-lip-sleeping-mask-berry",
      "brand": "Laneige",
      "category": "Beauty & Makeup",
      "price": 1350,
      "minPrice": 1350,
      "originalPrice": 1500,
      "discountPct": 10,
      "description": "Cult-favorite leave-on lip mask that melts away dead skin cells and delivers intensive moisture while you sleep. Infused with Berry Fruit Complex, Murumuru butter, and Shea butter.",
      "media": [
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 24100,
      "soldCount": 88000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Formula": "Berry Fruit Complex with Vitamin C & Coconut Oil",
            "Technology": "Moisture Wrap network locking in active ingredients overnight"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_carolina_herrera_good_girl",
      "title": "Carolina Herrera Good Girl Eau De Parfum (80ml Stiletto Bottle)",
      "slug": "carolina-herrera-good-girl-edp-80ml",
      "brand": "Carolina Herrera",
      "category": "Beauty & Makeup",
      "price": 9200,
      "minPrice": 9200,
      "originalPrice": 10500,
      "discountPct": 12,
      "description": "Sensual, sophisticated fragrance combining luminous jasmine and tuberose with dark roasted tonka bean and cocoa. Housed in the iconic midnight blue stiletto heel bottle.",
      "media": [
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 11400,
      "soldCount": 39000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Type": "Eau De Parfum (Long-lasting luxury fragrance)",
            "Top Notes": "Almond, Coffee, Bergamot, Lemon",
            "Heart Notes": "Tuberose, Jasmine Sambac, Orange Blossom",
            "Base Notes": "Tonka Bean, Cacao, Vanilla, Praline, Sandalwood"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_dior_sauvage",
      "title": "Dior Sauvage Eau De Toilette (100ml Fresh Bergamot & Ambroxan)",
      "slug": "dior-sauvage-edt-100ml",
      "brand": "Dior",
      "category": "Beauty & Makeup",
      "price": 11500,
      "minPrice": 11500,
      "originalPrice": 12900,
      "discountPct": 11,
      "description": "A radically fresh composition, dictated by a name that has the ring of a manifesto. Radiant top notes burst with the juicy freshness of Reggio di Calabria Bergamot.",
      "media": [
            "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 18900,
      "soldCount": 62000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Fragrance Family": "Earthy & Woody Citrus",
            "Key Notes": "Calabrian Bergamot, Pepper, Ambroxan, Cedar",
            "Bottle": "Heavy glass with magnetic closure"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_cetaphil_cleanser",
      "title": "Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin (500ml)",
      "slug": "cetaphil-gentle-skin-cleanser-500ml",
      "brand": "Cetaphil",
      "category": "Beauty & Makeup",
      "price": 749,
      "minPrice": 749,
      "originalPrice": 999,
      "discountPct": 25,
      "description": "Creamy, non-foaming gentle cleanser enriched with Niacinamide, Panthenol, and hydrating Glycerin. Clinically proven to hydrate while removing dirt, makeup and impurities without stripping.",
      "media": [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 38200,
      "soldCount": 165000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Formula": "Soap-Free, Fragrance-Free, Hypoallergenic & Non-Comedogenic",
            "Ingredients": "Niacinamide (Vitamin B3), Panthenol (Pro-Vitamin B5), Glycerin",
            "Volume": "500ml Pump Bottle"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_olaplex_no3",
      "title": "Olaplex No. 3 Hair Perfector Repairing Bond Multiplier Treatment (100ml)",
      "slug": "olaplex-no-3-hair-perfector-treatment",
      "brand": "Olaplex",
      "category": "Beauty & Makeup",
      "price": 2950,
      "minPrice": 2950,
      "originalPrice": 3400,
      "discountPct": 13,
      "description": "The global #1 bond-building hair treatment. Repairs damaged and compromised hair by repairing broken disulfide bonds from thermal, chemical, and mechanical damage.",
      "media": [
            "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 14700,
      "soldCount": 49000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Patented Active": "Bis-Aminopropyl Diglycol Dimaleate",
            "Hair Types": "Color-treated, chemically straightened, bleached & heat-styled"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_urban_decay_setting_spray",
      "title": "Urban Decay All Nighter Waterproof Long-Lasting Makeup Setting Spray (118ml)",
      "slug": "urban-decay-all-nighter-setting-spray",
      "brand": "Urban Decay",
      "category": "Beauty & Makeup",
      "price": 3100,
      "minPrice": 3100,
      "originalPrice": 3600,
      "discountPct": 14,
      "description": "Award-winning makeup finishing spray with patented Temperature Control Technology that lowers makeup temperature to keep foundation, eyeshadow, and blush locked in for up to 16 hours.",
      "media": [
            "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 12300,
      "soldCount": 41000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Wear Time": "Up to 16 Hours Transfer-Resistant",
            "Technology": "Patented Temperature Control cooling mist"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_manyavar_sherwani",
      "title": "Manyavar Men's Royal Silk Blend Embroidered Sherwani & Kurta Set",
      "slug": "manyavar-mens-embroidered-sherwani-set",
      "brand": "Manyavar",
      "category": "Textiles & Ethnic Wear",
      "price": 14999,
      "minPrice": 14999,
      "originalPrice": 19999,
      "discountPct": 25,
      "description": "Regal wedding attire hand-embroidered with zari and resham threadwork on fine art silk fabric. Features mandarin collar, jewelled buttons, inner kurta, and churidar pajama.",
      "media": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 3820,
      "soldCount": 14200,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Fabric": "Art Silk Blend with Intricate Zari Handwork",
            "Occasion": "Weddings, Groom Wear & Grand Receptions",
            "Set Includes": "Sherwani Jacket, Inner Kurta & Churidar"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_fabindia_chanderi_saree",
      "title": "Fabindia Handwoven Pure Chanderi Silk Saree with Real Zari Border",
      "slug": "fabindia-chanderi-silk-saree-zari",
      "brand": "Fabindia",
      "category": "Textiles & Ethnic Wear",
      "price": 8490,
      "minPrice": 8490,
      "originalPrice": 10990,
      "discountPct": 23,
      "description": "Timeless traditional heritage piece crafted by master weavers from Chanderi, Madhya Pradesh. Sheer gossamer silk with woven gold butis and unstitched matching blouse piece.",
      "media": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 5120,
      "soldCount": 18900,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Fabric": "100% Pure Chanderi Silk & Cotton Warp",
            "Weave": "Handloom Zari Buti with Traditional Pallu",
            "Length": "6.3 Metres (Includes 80cm Blouse Piece)"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_levis_511_denim",
      "title": "Levi's Men's 511 Slim Fit Selvedge Stretch Denim Jeans (Dark Indigo)",
      "slug": "levis-511-slim-fit-selvedge-denim",
      "brand": "Levi's",
      "category": "Textiles & Ethnic Wear",
      "price": 3899,
      "minPrice": 3899,
      "originalPrice": 5999,
      "discountPct": 35,
      "description": "The modern classic slim fit jeans cut close without feeling restricted. Crafted from premium Japanese selvedge woven denim with +Levi's Flex advanced stretch for maximum comfort.",
      "media": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 19400,
      "soldCount": 72000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Fit": "Slim Through Seat & Thigh, Slim Leg Opening",
            "Fabric": "99% Cotton, 1% Elastane Premium Shuttle-Loomed Selvedge",
            "Closure": "Zip fly with metal rivet hardware"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_peter_england_shirt",
      "title": "Peter England Men's Slim Fit Premium 100% Cotton Formal Twill Shirt",
      "slug": "peter-england-formal-cotton-twill-shirt",
      "brand": "Peter England",
      "category": "Textiles & Ethnic Wear",
      "price": 1199,
      "minPrice": 1199,
      "originalPrice": 1799,
      "discountPct": 33,
      "description": "Crisp formal shirt tailored from two-ply compact cotton twill. Features stiffened spread collar, French placket, and wrinkle-resistant easy-iron finish.",
      "media": [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 14200,
      "soldCount": 61000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Material": "100% Superfine Compact Cotton Twill",
            "Finish": "Wrinkle-Resistant Easy Iron Treatment",
            "Collar": "Semi-Cutaway Stiffened Formal Collar"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_biba_anarkali_set",
      "title": "Biba Women's Printed Anarkali Kurta with Churidar & Chiffon Dupatta",
      "slug": "biba-womens-printed-anarkali-kurta-set",
      "brand": "Biba",
      "category": "Textiles & Ethnic Wear",
      "price": 3499,
      "minPrice": 3499,
      "originalPrice": 5995,
      "discountPct": 42,
      "description": "Flared tiered anarkali silhouette highlighted with golden foil geometric print, gota patti lace border, round neckline with keyhole button, and sheer dupatta.",
      "media": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 8900,
      "soldCount": 34000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Kurta Fabric": "Pure Rayon Viscose with Gold Foil Accents",
            "Dupatta": "Lightweight Poly Chiffon with Gota Patti Hem",
            "Length": "Calf Length Floor Flared Hemline"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_raymond_suit_length",
      "title": "Raymond Fine Wool Rich Charcoal Blend Blazer & Trouser Suit Fabric (3m)",
      "slug": "raymond-fine-wool-rich-suit-length",
      "brand": "Raymond",
      "category": "Textiles & Ethnic Wear",
      "price": 6999,
      "minPrice": 6999,
      "originalPrice": 9500,
      "discountPct": 26,
      "description": "Premium bespoke suiting fabric crafted from Australian Merino wool blend. Breathable, natural drape, crease-recovery properties, and deep charcoal micro-herringbone weave.",
      "media": [
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 3200,
      "soldCount": 11000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Composition": "70% Merino Wool, 30% Polyester Microfibre",
            "Length": "3.00 Metres (Ideal for 2-Piece Suit)",
            "Weave": "120s Superfine Micro Herringbone"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_allen_solly_chinos",
      "title": "Allen Solly Men's Flat-Front Prime Stretch Cotton Chino Trousers (Khaki)",
      "slug": "allen-solly-stretch-cotton-chino-trousers",
      "brand": "Allen Solly",
      "category": "Textiles & Ethnic Wear",
      "price": 1499,
      "minPrice": 1499,
      "originalPrice": 2299,
      "discountPct": 35,
      "description": "Versatile work-to-weekend trousers crafted from washed stretch cotton twill. Mid-rise with clean flat-front tailoring, slant pockets, and subtle embroidered stag logo.",
      "media": [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 11200,
      "soldCount": 45000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Fabric": "98% Combed Cotton, 2% Spandex Twill",
            "Fit": "Contemporary Slim Fit Tapered",
            "Pockets": "2 Front Cross Pockets, 2 Rear Buttoned Welt Pockets"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_w_for_woman_kurta",
      "title": "W for Woman Festive Printed Rayon Straight Kurta (Maroon & Gold)",
      "slug": "w-for-woman-festive-printed-kurta",
      "brand": "W for Woman",
      "category": "Textiles & Ethnic Wear",
      "price": 1299,
      "minPrice": 1299,
      "originalPrice": 2499,
      "discountPct": 48,
      "description": "Chic contemporary straight-cut festive kurta with Mandarin slit neck, three-quarter sleeves, metallic foil block prints, and side slits.",
      "media": [
            "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 7600,
      "soldCount": 29000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Fabric": "100% Breathable Rayon Viscose",
            "Print": "Metallic Gold Foil Ethnic Motif",
            "Sleeves": "Three-Quarter Sleeves with Folded Cuffs"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_zara_linen_shirt",
      "title": "Zara Men's 100% European Linen Camp Collar Casual Shirt (White)",
      "slug": "zara-mens-100-linen-camp-collar-shirt",
      "brand": "Zara",
      "category": "Textiles & Ethnic Wear",
      "price": 2990,
      "minPrice": 2990,
      "originalPrice": 3990,
      "discountPct": 25,
      "description": "Relaxed resort-style camp collar shirt woven from pure European flax linen. Naturally breathable, lightweight, and washed for a soft lived-in touch.",
      "media": [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 8400,
      "soldCount": 31000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Fabric": "100% European Flax Pure Linen",
            "Collar": "Cuban Camp Collar Open V-Neck",
            "Cut": "Relaxed Boxy Fit with Straight Hem"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_kanchipuram_silk_saree",
      "title": "Kanchipuram Pure Silk Handloom Bridal Wedding Saree (Crimson & Gold)",
      "slug": "kanchipuram-pure-silk-bridal-saree",
      "brand": "Kanchi Silk Guild",
      "category": "Textiles & Ethnic Wear",
      "price": 24999,
      "minPrice": 24999,
      "originalPrice": 32000,
      "discountPct": 22,
      "description": "Authentic Silk Mark certified bridal Kanjivaram woven with pure mulberry silk and pure silver zari plated with 24k gold. Heavy korvai temple border and intricate peacock pallu.",
      "media": [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 5,
      "ratingCount": 2190,
      "soldCount": 8400,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Silk Mark": "100% Certified Mulberry Raw Silk",
            "Zari": "Traditional Korvai Pure Silver Zari electroplated with Gold",
            "Origin": "Handloom Woven in Kanchipuram, Tamil Nadu"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_hm_heavyweight_hoodie",
      "title": "H&M Relaxed Fit Heavyweight French Terry Cotton Zip Hoodie (Grey Melange)",
      "slug": "hm-heavyweight-french-terry-hoodie",
      "brand": "H&M",
      "category": "Textiles & Ethnic Wear",
      "price": 1999,
      "minPrice": 1999,
      "originalPrice": 2999,
      "discountPct": 33,
      "description": "Premium streetwear essential made from 460 GSM heavyweight looped French terry cotton. Double-layered hood, dropped shoulders, and robust YKK two-way zipper.",
      "media": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 16200,
      "soldCount": 58000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Fabric Weight": "460 GSM Heavyweight 100% Cotton French Terry",
            "Fit": "Oversized Relaxed Streetwear Silhouette",
            "Hardware": "Two-Way Antique Silver Metal Zipper"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_tommy_polo_shirt",
      "title": "Tommy Hilfiger Men's Core Flag Logo Pique Cotton Polo T-Shirt (Navy)",
      "slug": "tommy-hilfiger-core-flag-polo-shirt",
      "brand": "Tommy Hilfiger",
      "category": "Textiles & Ethnic Wear",
      "price": 2799,
      "minPrice": 2799,
      "originalPrice": 3999,
      "discountPct": 30,
      "description": "Classic American cool staple polo crafted from breathable organic cotton honeycomb pique. Ribbed knit collar and cuffs with signature tri-color embroidered flag chest crest.",
      "media": [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 12900,
      "soldCount": 47000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Material": "100% Organic Breathable Cotton Pique",
            "Fit": "Custom Regular Fit",
            "Details": "Two-Button Mother of Pearl Placket"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_global_desi_dress",
      "title": "Global Desi Floral Tiered Maxi Indo-Western Dress (Mustard Yellow)",
      "slug": "global-desi-floral-tiered-maxi-dress",
      "brand": "Global Desi",
      "category": "Textiles & Ethnic Wear",
      "price": 1899,
      "minPrice": 1899,
      "originalPrice": 3499,
      "discountPct": 45,
      "description": "Bohemian fusion tiered maxi dress featuring romantic meadow floral digital print, tassel tie-up neck, smocked elasticated waist, and breezy tiered sweep skirt.",
      "media": [
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 6800,
      "soldCount": 26000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Fabric": "Lightweight Poly Georgette with Cotton Voile Lining",
            "Silhouette": "Fit and Flare Tiered Maxi",
            "Neckline": "Split V-Neck with Braided Tassel Cords"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_van_heusen_giza_shirt",
      "title": "Van Heusen Men's Non-Iron 100% Giza Cotton Luxury Formal Shirt (Sky Blue)",
      "slug": "van-heusen-giza-cotton-formal-shirt",
      "brand": "Van Heusen",
      "category": "Textiles & Ethnic Wear",
      "price": 2499,
      "minPrice": 2499,
      "originalPrice": 3499,
      "discountPct": 28,
      "description": "Tailored from Egyptian Extra Long Staple Giza 88 cotton with silk-like sheen and patented tape-sealed armholes that stay wrinkle-free all day without ironing.",
      "media": [
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 9400,
      "soldCount": 39000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Yarn": "100% Egyptian Giza 88 Extra Long Staple Cotton",
            "Technology": "Tape-Sealed Seams with Zero-Wrinkle Performance"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_galaxy_tab_s9_ultra",
      "title": "Samsung Galaxy Tab S9 Ultra (14.6\" Dynamic AMOLED 2X, 12GB/256GB, S Pen)",
      "slug": "samsung-galaxy-tab-s9-ultra",
      "brand": "Samsung",
      "category": "Mobiles & Tablets",
      "price": 108999,
      "minPrice": 108999,
      "originalPrice": 121999,
      "discountPct": 11,
      "description": "The ultimate productivity tablet. Massive 14.6-inch 120Hz Dynamic AMOLED display, IP68 water resistance on both tablet and included S Pen, Snapdragon 8 Gen 2 for Galaxy, and DeX workstation mode.",
      "media": [
            "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 4210,
      "soldCount": 16500,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Display": "14.6-inch Dynamic AMOLED 2X (2960 x 1848, 120Hz, HDR10+)",
            "Processor": "Qualcomm Snapdragon 8 Gen 2 for Galaxy",
            "Battery": "11,200 mAh with 45W Super Fast Charging",
            "Durability": "Armor Aluminum frame & IP68 Dust/Water Resistant"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_oneplus_pad_2",
      "title": "OnePlus Pad 2 (11.61\" 3K 144Hz Display, Snapdragon 8 Gen 3, 12GB/256GB)",
      "slug": "oneplus-pad-2-3k-display-tablet",
      "brand": "OnePlus",
      "category": "Mobiles & Tablets",
      "price": 39999,
      "minPrice": 39999,
      "originalPrice": 44999,
      "discountPct": 11,
      "description": "Industry-first tablet with Snapdragon 8 Gen 3. 7:5 ReadFit 3K display with ultra-smooth 144Hz refresh rate, 6 omnibearing speakers, and 67W SUPERVOOC charging.",
      "media": [
            "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 3820,
      "soldCount": 13900,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Screen": "11.61-inch 3K (3000 x 2120) 144Hz 7:5 ReadFit Display",
            "Chipset": "Snapdragon 8 Gen 3 (4nm flagship silicon)",
            "Audio": "6 Hi-Res Spatial Audio Speakers"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_ps_vr2_bundle",
      "title": "Sony PlayStation VR2 Horizon Call of the Mountain Bundle",
      "slug": "sony-playstation-vr2-horizon-bundle",
      "brand": "Sony",
      "category": "Gaming & Desk",
      "price": 57999,
      "minPrice": 57999,
      "originalPrice": 61999,
      "discountPct": 6,
      "description": "Next-gen virtual reality for PS5. 4K HDR OLED displays with 110-degree field of view, intelligent eye tracking, headset feedback, 3D audio, and PS VR2 Sense controllers with haptic feedback.",
      "media": [
            "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 3100,
      "soldCount": 11200,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Display": "Dual OLED (2000 x 2040 per eye, 90Hz/120Hz, 110 FOV)",
            "Sensors": "6-axis motion sensing, IR proximity, 4 embedded cameras",
            "Controllers": "PS VR2 Sense Controllers with Adaptive Triggers"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_razer_blackwidow_v4",
      "title": "Razer BlackWidow V4 Pro Mechanical Gaming Keyboard (Green Clicky Switches)",
      "slug": "razer-blackwidow-v4-pro-keyboard",
      "brand": "Razer",
      "category": "Gaming & Desk",
      "price": 19999,
      "minPrice": 19999,
      "originalPrice": 24999,
      "discountPct": 20,
      "description": "The battlestation command center. Features Razer Command Dial, 8 dedicated macro keys, 8000Hz hyperpolling rate, per-key RGB with 3-side underglow, and plush magnetic leatherette wrist rest.",
      "media": [
            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 5200,
      "soldCount": 18400,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Switches": "Razer Green Mechanical (Tactile & Clicky)",
            "Polling": "8000Hz Razer HyperPolling Rate (0.125ms latency)",
            "Chassis": "5052 Aluminium Alloy Top Plate with Sound Dampening Foam"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_bose_soundbar_900",
      "title": "Bose Smart Soundbar 900 with Dolby Atmos & Alexa Voice Built-in",
      "slug": "bose-smart-soundbar-900-dolby-atmos",
      "brand": "Bose",
      "category": "Audio & Soundbars",
      "price": 84900,
      "minPrice": 84900,
      "originalPrice": 104900,
      "discountPct": 19,
      "description": "Immersive home theatre soundbar with custom upward-firing dipole transducers. Proprietary TrueSpace spatial processing upmixes non-Atmos content for full overhead sound.",
      "media": [
            "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 6190,
      "soldCount": 19800,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Audio Formats": "Dolby Atmos, Dolby Digital, Dolby TrueHD, Bose TrueSpace",
            "Connectivity": "HDMI eARC, Optical, Wi-Fi, Bluetooth 5.0, AirPlay 2",
            "Build": "Premium polished tempered glass top & metal grille"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_anker_prime_powerbank",
      "title": "Anker Prime 27,650mAh Power Bank (250W Total Multi-Device Fast Output)",
      "slug": "anker-prime-27650mah-powerbank-250w",
      "brand": "Anker",
      "category": "Gaming & Desk",
      "price": 12999,
      "minPrice": 12999,
      "originalPrice": 16999,
      "discountPct": 24,
      "description": "Ultra-fast charging hub for power users. Can fast charge a 16-inch MacBook Pro to 50% in 28 minutes with 140W single-port PD 3.1 output. Smart digital display shows real-time wattage.",
      "media": [
            "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 8410,
      "soldCount": 31200,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Capacity": "27,650 mAh (99.54 Wh airline flight-approved)",
            "Output": "250W Total Output (Dual 140W USB-C + 65W USB-A)",
            "Screen": "Smart Digital Color Screen with App Bluetooth Control"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_kindle_paperwhite_sig",
      "title": "Kindle Paperwhite Signature Edition (32GB, Wireless Charging, 6.8\" Screen)",
      "slug": "kindle-paperwhite-signature-edition",
      "brand": "Amazon",
      "category": "Gaming & Desk",
      "price": 17999,
      "minPrice": 17999,
      "originalPrice": 19999,
      "discountPct": 10,
      "description": "The premier e-reader experience. 6.8-inch 300 ppi glare-free display with auto-adjusting front warm light, 32GB storage for thousands of books, IPX8 waterproof, and 10 weeks battery life.",
      "media": [
            "https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 16800,
      "soldCount": 52000,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Display": "6.8\" 300 ppi glare-free Paperwhite with 17 LEDs",
            "Battery": "Up to 10 weeks on a single charge",
            "Storage": "32 GB Internal Storage + Qi Wireless Charging"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_marshall_minor_3",
      "title": "Marshall Minor III True Wireless Earbuds (Black Textured Vinyl)",
      "slug": "marshall-minor-iii-tws-earbuds",
      "brand": "Marshall",
      "category": "Audio & Soundbars",
      "price": 9999,
      "minPrice": 9999,
      "originalPrice": 12999,
      "discountPct": 23,
      "description": "Iconic Marshall rock audio in a pocketable wireless bud. Custom-tuned 12mm drivers deliver loud, crisp bass and balanced mids. 25 hours total playtime with wireless charging case.",
      "media": [
            "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 9100,
      "soldCount": 38000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Drivers": "12 mm Dynamic Drivers (32 Ohm)",
            "Playtime": "5 hours in earbuds / 25 hours with case (Qi wireless)",
            "Bluetooth": "Bluetooth 5.2 with Touch Controls & IPX4 Water Resistance"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_fujifilm_instax_mini12",
      "title": "Fujifilm Instax Mini 12 Instant Camera (Clay White with 20 Film Sheets)",
      "slug": "fujifilm-instax-mini-12-camera",
      "brand": "Fujifilm",
      "category": "Cameras & Drones",
      "price": 6499,
      "minPrice": 6499,
      "originalPrice": 7999,
      "discountPct": 19,
      "description": "Fun, vibrant instant camera with automatic exposure control, built-in selfie mirror, close-up mode with parallax correction, and credit card sized physical photo prints.",
      "media": [
            "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 14900,
      "soldCount": 68000,
      "inStock": true,
      "isDeal": true,
      "specs": {
            "Film": "Fujifilm Instant Colour Film (instax mini)",
            "Flash": "Constant firing flash with automatic light adjustment",
            "Shutter": "Programmed electronic shutter (1/2 to 1/250 sec)"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
},
    {
      "_id": "prod_nanoleaf_shapes_hex",
      "title": "Nanoleaf Shapes Hexagons Smarter Kit (9 Modular RGB LED Wall Panels)",
      "slug": "nanoleaf-shapes-hexagons-smarter-kit",
      "brand": "Nanoleaf",
      "category": "Gaming & Desk",
      "price": 16999,
      "minPrice": 16999,
      "originalPrice": 21999,
      "discountPct": 23,
      "description": "Modular ultra-thin smart LED light panels with Connect+ technology. Features Rhythm Music Visualizer, screen mirror with PC games, touch control, and 16 million colors.",
      "media": [
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 4890,
      "soldCount": 17200,
      "inStock": true,
      "isDeal": false,
      "specs": {
            "Luminous Flux": "100 lumens per panel (16M+ colors & tunable whites)",
            "Features": "Screen Mirror, Rhythm Music Sync, Touch Interactive Games",
            "Ecosystem": "Apple Home, Google Home, Alexa, Razer Chroma RGB"
      },
      "createdAt": "2026-10-26T20:24:26.345Z"
    },
    {
      "_id": "prod_bike_hunter350",
      "title": "Royal Enfield Hunter 350 (Dapper Ash, Retro Roadster)",
      "slug": "royal-enfield-hunter-350-dapper-ash",
      "brand": "Royal Enfield",
      "category": "Bikes & Automotive",
      "price": 169900,
      "minPrice": 169900,
      "originalPrice": 174900,
      "discountPct": 3,
      "description": "The Hunter 350 brings a stylish, youthful vibe to Royal Enfield with retro flair, agile handling, 349cc single-cylinder J-platform engine, dual-channel ABS, and twin down-tube frame.",
      "media": [
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 3410,
      "soldCount": 12400,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Engine": "349cc Single Cylinder J-Series",
        "Power": "20.2 bhp @ 6100 rpm",
        "Brakes": "Dual-Channel ABS Disc",
        "Fuel Tank": "13 Litres"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_r15_v4",
      "title": "Yamaha YZF R15 V4 (Racing Blue, 155cc VVA)",
      "slug": "yamaha-yzf-r15-v4-racing-blue",
      "brand": "Yamaha",
      "category": "Bikes & Automotive",
      "price": 182000,
      "minPrice": 182000,
      "originalPrice": 189000,
      "discountPct": 4,
      "description": "Track-bred supersport machine featuring 155cc liquid-cooled 4-valve SOHC VVA engine, traction control system, quick shifter, inverted USD front forks, and Class D Bi-functional LED headlight.",
      "media": [
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 4210,
      "soldCount": 15600,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Displacement": "155 cc Liquid Cooled",
        "Power": "18.4 PS @ 10,000 RPM",
        "Suspension": "Upside Down Telescopic",
        "Transmission": "6-Speed with Assist & Slipper Clutch"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_ather450x",
      "title": "Ather 450X Gen 3 (Space Grey, Smart Electric Scooter)",
      "slug": "ather-450x-gen-3-space-grey",
      "brand": "Ather",
      "category": "Bikes & Automotive",
      "price": 144999,
      "minPrice": 144999,
      "originalPrice": 158999,
      "discountPct": 9,
      "description": "High-performance connected electric scooter with Warp Mode accelerating 0-40 in 3.3s, 3.7 kWh IP67 lithium-ion battery delivering 150 km certified range, 7-inch touchscreen with Google Maps, and auto-hold.",
      "media": [
        "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 1850,
      "soldCount": 8900,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Battery": "3.7 kWh Li-ion IP67",
        "Top Speed": "90 km/h",
        "Display": "7-inch Touch TFT",
        "Fast Charging": "Ather Grid 1.5km/min"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_apache_rtr",
      "title": "TVS Apache RTR 160 4V Special Edition (Matte Black)",
      "slug": "tvs-apache-rtr-160-4v-special-edition",
      "brand": "TVS",
      "category": "Bikes & Automotive",
      "price": 132000,
      "minPrice": 132000,
      "originalPrice": 138000,
      "discountPct": 4,
      "description": "Race-inspired roadster with 3 riding modes (Urban, Rain, Sport), SmartXonnect Bluetooth console with voice assistance, Bullpup exhaust note, and race-tuned fuel injection.",
      "media": [
        "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 2190,
      "soldCount": 9400,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Power": "17.55 PS @ 9250 rpm",
        "Brakes": "Wave Disc with Super-Moto ABS",
        "Mileage": "48 kmpl"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_steelbird_helmet",
      "title": "Steelbird SBH-17 Terminator Full Face Helmet (Matte Black & Red)",
      "slug": "steelbird-sbh-17-terminator-helmet",
      "brand": "Steelbird",
      "category": "Bikes & Automotive",
      "price": 2499,
      "minPrice": 2499,
      "originalPrice": 3899,
      "discountPct": 36,
      "description": "Aggressive street fighter full-face helmet with ISI and DOT certification, quick release anti-scratch polycarbonate visor, dual air exhaust vents, and odorless breathable cheek pads.",
      "media": [
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 8940,
      "soldCount": 34000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Size": "Large (600mm)",
        "Weight": "1350g",
        "Material": "High Impact ABS"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_vega_bolt",
      "title": "Vega Bolt Bunny Full Face Graphic Helmet (ISI Certified)",
      "slug": "vega-bolt-bunny-full-face-helmet",
      "brand": "Vega",
      "category": "Bikes & Automotive",
      "price": 1949,
      "minPrice": 1949,
      "originalPrice": 2899,
      "discountPct": 33,
      "description": "Aerodynamic shell graphic helmet with UV protected scratch resistant clear visor, removable washable inner lining, micrometric chin strap buckle, and high impact polystyrene lining.",
      "media": [
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 6120,
      "soldCount": 22000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Certification": "ISI / DOT",
        "Visor": "Clear UV Protected",
        "Weight": "1400g"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_motul_oil",
      "title": "Motul 7100 4T 10W-40 Fully Synthetic Engine Oil (1 Litre)",
      "slug": "motul-7100-4t-10w40-fully-synthetic-oil",
      "brand": "Motul",
      "category": "Bikes & Automotive",
      "price": 899,
      "minPrice": 899,
      "originalPrice": 1250,
      "discountPct": 28,
      "description": "100% synthetic Ester technology motorcycle lubricant engineered for high performance modern sport and street bikes. Provides optimal gear protection, wet-clutch anti-slip response, and reduced engine friction.",
      "media": [
        "https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 14200,
      "soldCount": 52000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Viscosity": "10W-40",
        "Volume": "1 Litre",
        "Grade": "Fully Synthetic Ester"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_bosch_inflator",
      "title": "Bosch EasyPump Cordless High-Pressure Electric Tire Inflator (150 PSI)",
      "slug": "bosch-easypump-cordless-tire-inflator",
      "brand": "Bosch",
      "category": "Bikes & Automotive",
      "price": 4999,
      "minPrice": 4999,
      "originalPrice": 7999,
      "discountPct": 37,
      "description": "Pocket-sized electric air pump with real-time pressure measurement, auto-stop at target PSI/bar, integrated LED worklight, USB-C recharging, and universal adapters for bikes, motorcycles, cars, and balls.",
      "media": [
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 3120,
      "soldCount": 11000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Max Pressure": "10.3 bar / 150 PSI",
        "Battery": "3.0 Ah Li-ion",
        "Charging": "USB-C"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_alpinestars_gloves",
      "title": "Alpinestars SMX-1 Air V2 Breathable Motorcycle Riding Gloves",
      "slug": "alpinestars-smx-1-air-v2-riding-gloves",
      "brand": "Alpinestars",
      "category": "Bikes & Automotive",
      "price": 4499,
      "minPrice": 4499,
      "originalPrice": 5999,
      "discountPct": 25,
      "description": "Premium full-grain goat leather palm and 3D air mesh chassis gloves. Engineered with carbon-look hard polymer knuckle protector, touchscreen compatible fingertips, and ergonomic wrist closure.",
      "media": [
        "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 1650,
      "soldCount": 6800,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Material": "Chassis Leather & 3D Mesh",
        "Knuckle": "Hard Polymer CE Level 1"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_cover",
      "title": "Solimo Heavy Duty 100% Waterproof Bike Cover with Mirror Pockets",
      "slug": "solimo-heavy-duty-waterproof-bike-cover",
      "brand": "Solimo",
      "category": "Bikes & Automotive",
      "price": 649,
      "minPrice": 649,
      "originalPrice": 1499,
      "discountPct": 57,
      "description": "All-weather tear-resistant polyester cover with double stitched seams, elastic bottom hem, heavy-duty windproof center buckle, and reflective safety strips. Fits all standard 100cc to 350cc motorcycles.",
      "media": [
        "https://images.unsplash.com/photo-1558980664-2506fca6bfc2?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.4,
      "ratingCount": 11200,
      "soldCount": 48000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Material": "Polyester Taffeta with PU Coating",
        "Color": "Navy Blue & Silver"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_studds_ninja",
      "title": "Studds Ninja 3G Flip-Up Dual Visor Motorbike Helmet",
      "slug": "studds-ninja-3g-flip-up-helmet",
      "brand": "Studds",
      "category": "Bikes & Automotive",
      "price": 2199,
      "minPrice": 2199,
      "originalPrice": 2995,
      "discountPct": 27,
      "description": "Modular flip-up motorcycle helmet with one-button chin guard release, secondary tinted drop-down sun visor, regulated density EPS concussion padding, and ISI safety hallmark.",
      "media": [
        "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 7850,
      "soldCount": 29000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Certification": "ISI marked",
        "Weight": "1550g",
        "Type": "Modular Flip-Up"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_castrol_oil",
      "title": "Castrol POWER1 4T 15W-50 Synthetic Technology Motorcycle Oil (1 Litre)",
      "slug": "castrol-power1-15w50-engine-oil",
      "brand": "Castrol",
      "category": "Bikes & Automotive",
      "price": 549,
      "minPrice": 549,
      "originalPrice": 799,
      "discountPct": 31,
      "description": "Advanced semi-synthetic 4-stroke engine oil with Power Release Technology that flows fast and reduces internal friction for sustained high-temperature engine performance in cruiser motorcycles.",
      "media": [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 8900,
      "soldCount": 35000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Viscosity": "15W-50",
        "Volume": "1 Litre",
        "Compatibility": "Royal Enfield / Pulsar"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_hella_horn",
      "title": "Hella 3FH 007 728-831 Midnight Black Twin Tone Horn Set (12V)",
      "slug": "hella-twin-tone-horn-set-12v",
      "brand": "Hella",
      "category": "Bikes & Automotive",
      "price": 1199,
      "minPrice": 1199,
      "originalPrice": 1890,
      "discountPct": 37,
      "description": "German engineered high-decibel acoustic trumpet horns with penetrating sound propagation, water spray resistance, teflon pillar filter, and dual high/low frequency harmonic tone.",
      "media": [
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 5420,
      "soldCount": 19000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Voltage": "12V",
        "Decibels": "110 dB(A)",
        "Frequency": "500 Hz High / 400 Hz Low"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_phone_mount",
      "title": "BOBO BM4 Claw Anti-Vibration Aluminum Mobile Holder for Bikes",
      "slug": "bobo-bm4-claw-bike-mobile-mount",
      "brand": "BOBO",
      "category": "Bikes & Automotive",
      "price": 1499,
      "minPrice": 1499,
      "originalPrice": 2499,
      "discountPct": 40,
      "description": "CNC machined aerospace-grade aluminum handlebar phone mount with built-in 4-point silicone vibration damper to protect smartphone optical image stabilization (OIS) during rugged rides.",
      "media": [
        "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 9240,
      "soldCount": 38000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Material": "CNC Machined Aircraft Aluminum",
        "Handlebar Diameter": "22mm - 32mm"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_bike_3m_shampoo",
      "title": "3M Car & Bike Wash Shampoo pH-Balanced Concentrated Formula (500 ml)",
      "slug": "3m-car-bike-wash-shampoo-500ml",
      "brand": "3M",
      "category": "Bikes & Automotive",
      "price": 299,
      "minPrice": 299,
      "originalPrice": 480,
      "discountPct": 38,
      "description": "Super high-foaming concentrated automotive wash shampoo with neutral pH that effortlessly lifts road dust, bug splatters, and road film without stripping paint sealant or wax protection.",
      "media": [
        "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 16800,
      "soldCount": 62000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Volume": "500 ml",
        "pH": "Balanced Neutral 7.0"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_maybelline_matte",
      "title": "Maybelline New York Super Stay Matte Ink Liquid Lipstick (Ruler, 5ml)",
      "slug": "maybelline-super-stay-matte-ink-ruler",
      "brand": "Maybelline",
      "category": "Beauty & Makeup",
      "price": 499,
      "minPrice": 499,
      "originalPrice": 699,
      "discountPct": 29,
      "description": "Intensely pigmented longwear liquid lipstick that lasts up to 16 hours. Non-drying transfer-proof matte finish with unique arrow precision tip applicator for crisp contours.",
      "media": [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 22400,
      "soldCount": 88000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Shade": "80 Ruler (Deep Berry Mauve)",
        "Volume": "5 ml",
        "Finish": "Super Matte"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_loreal_serum",
      "title": "L'Oreal Paris Revitalift 1.5% Hyaluronic Acid Hydrating Face Serum (30ml)",
      "slug": "loreal-revitalift-hyaluronic-acid-serum",
      "brand": "L'Oreal Paris",
      "category": "Beauty & Makeup",
      "price": 699,
      "minPrice": 699,
      "originalPrice": 999,
      "discountPct": 30,
      "description": "Lightweight dermatologist-validated face serum packed with micro-hyaluronic acid that penetrates deep into epidermis to deliver intense 60% plumper, radiant, youthful skin.",
      "media": [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 31200,
      "soldCount": 115000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Volume": "30 ml",
        "Skin Type": "All Skin Types",
        "Concentration": "1.5% Pure HA"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_mac_foundation",
      "title": "M.A.C Studio Fix Fluid SPF 15 24HR Matte Foundation (NC25, 30ml)",
      "slug": "mac-studio-fix-fluid-foundation-nc25",
      "brand": "M.A.C",
      "category": "Beauty & Makeup",
      "price": 3600,
      "minPrice": 3600,
      "originalPrice": 3900,
      "discountPct": 8,
      "description": "Iconic modern matte foundation with medium-to-full buildable coverage and 24-hour shine control. Protects with broad-spectrum SPF 15 and leaves an oil-free, non-settling velvet finish.",
      "media": [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 18400,
      "soldCount": 65000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Shade": "NC25 (Golden Olive)",
        "Coverage": "Medium to Full",
        "Volume": "30 ml"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_minimalist_niacinamide",
      "title": "Minimalist 10% Niacinamide Face Serum with Zinc for Blemish & Pore Control (30ml)",
      "slug": "minimalist-10-niacinamide-serum-30ml",
      "brand": "Minimalist",
      "category": "Beauty & Makeup",
      "price": 569,
      "minPrice": 569,
      "originalPrice": 599,
      "discountPct": 5,
      "description": "Nourishing daily face serum formulated with pure EU-grade Vitamin B3 and Zinc PCA. Clinically proven to reduce acne marks, control excess sebum, and strengthen barrier within 2 weeks.",
      "media": [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 42000,
      "soldCount": 154000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Volume": "30 ml",
        "Active": "10% Niacinamide + 1% Zinc PCA",
        "pH": "5.5 - 6.5"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_dyson_hairdryer",
      "title": "Dyson Supersonic Hair Dryer (Iron/Fuchsia) with 5 Styling Attachments",
      "slug": "dyson-supersonic-hair-dryer-fuchsia",
      "brand": "Dyson",
      "category": "Beauty & Makeup",
      "price": 34900,
      "minPrice": 34900,
      "originalPrice": 39900,
      "discountPct": 13,
      "description": "Fast drying with no extreme heat damage. Powered by Dyson V9 digital motor spinning at 110,000 RPM. Comes with Flyaway attachment, styling concentrator, diffuser, and gentle air attachment.",
      "media": [
        "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 3910,
      "soldCount": 13500,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Power": "1600 W",
        "Motor": "Dyson Digital V9",
        "Cable Length": "2.8 Metres",
        "Airflow": "41 L/s"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_philips_trimmer",
      "title": "Philips BT3231/15 Smart Beard Trimmer with Lift & Trim System (Quick Charge)",
      "slug": "philips-bt3231-15-beard-trimmer",
      "brand": "Philips",
      "category": "Beauty & Makeup",
      "price": 1899,
      "minPrice": 1899,
      "originalPrice": 2495,
      "discountPct": 24,
      "description": "Innovative Lift & Trim technology captures 30% more low-lying hairs. Self-sharpening titanium coated blades with 20 lock-in length settings and 60 minutes cordless runtime on USB quick charge.",
      "media": [
        "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 28400,
      "soldCount": 92000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Run Time": "60 Mins",
        "Charging": "USB Quick Charge",
        "Precision": "0.5mm Steps"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_forest_cream",
      "title": "Forest Essentials Soundarya Radiance Cream with 24K Gold & SPF 25 (50g)",
      "slug": "forest-essentials-soundarya-radiance-cream-gold",
      "brand": "Forest Essentials",
      "category": "Beauty & Makeup",
      "price": 6275,
      "minPrice": 6275,
      "originalPrice": 6600,
      "discountPct": 5,
      "description": "Handcrafted luxury Ayurvedic day cream infused with 24 Karat Gold Bhasma, pure saffron, and ashwagandha. Deeply hydrates, tones elasticity, and protects against environmental photo-aging.",
      "media": [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 2840,
      "soldCount": 9800,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Weight": "50 g",
        "Key Ingredient": "24K Gold Bhasma, Saffron, Ashwagandha"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_huda_palette",
      "title": "Huda Beauty Empowered Eyeshadow Palette (18 Highly Pigmented Shades)",
      "slug": "huda-beauty-empowered-eyeshadow-palette",
      "brand": "Huda Beauty",
      "category": "Beauty & Makeup",
      "price": 5350,
      "minPrice": 5350,
      "originalPrice": 5900,
      "discountPct": 9,
      "description": "The ultimate everyday-to-editorial palette with 18 high-impact shades in buttery smooth mattes, shimmering wet-look metallics, and hybrid gel-liner textures that blend seamlessly.",
      "media": [
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 3120,
      "soldCount": 11000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Shades": "18 Shades (Mattes, Wet Shimmers, Metallic Flakes)",
        "Net Weight": "16.8 g"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_lakme_primer",
      "title": "Lakme Absolute Blur Perfect Matte Face Primer (30g)",
      "slug": "lakme-absolute-blur-perfect-primer-30g",
      "brand": "Lakme",
      "category": "Beauty & Makeup",
      "price": 525,
      "minPrice": 525,
      "originalPrice": 850,
      "discountPct": 38,
      "description": "Silky smooth makeup primer that instantly blurs open pores, controls T-zone shine, and smooths uneven skin texture for flawless all-day foundation wear.",
      "media": [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 34100,
      "soldCount": 120000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Weight": "30 g",
        "Texture": "Silky Gel Cream",
        "Finish": "Matte"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_kama_kumkumadi",
      "title": "Kama Ayurveda Kumkumadi Miraculous Beauty Ayurvedic Night Serum (12ml)",
      "slug": "kama-ayurveda-kumkumadi-beauty-serum",
      "brand": "Kama Ayurveda",
      "category": "Beauty & Makeup",
      "price": 3195,
      "minPrice": 3195,
      "originalPrice": 3450,
      "discountPct": 7,
      "description": "Prescribed in authentic Ayurveda as a miraculous night beauty tailam. Formulated with pure Kashmiri Saffron, Sandalwood, and Indian Madder to illuminate complexion and fade blemishes.",
      "media": [
        "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 4210,
      "soldCount": 14500,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Volume": "12 ml",
        "Ingredients": "Kashmiri Saffron, Sandalwood, Indian Madder"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_ordinary_glycolic",
      "title": "The Ordinary Glycolic Acid 7% Exfoliating Toning Solution (240ml)",
      "slug": "the-ordinary-glycolic-acid-7-toner",
      "brand": "The Ordinary",
      "category": "Beauty & Makeup",
      "price": 1250,
      "minPrice": 1250,
      "originalPrice": 1400,
      "discountPct": 11,
      "description": "Direct exfoliating water-based toner that gently buffs away surface dead cells to restore radiant clarity. Contains Tasmanian Pepperberry derivative to visibly reduce irritation.",
      "media": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 19800,
      "soldCount": 78000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Volume": "240 ml",
        "Acid": "7% Glycolic Acid (pH 3.6)"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_plum_facewash",
      "title": "Plum Green Tea Pore Cleansing Face Wash with Glycolic Acid (120ml)",
      "slug": "plum-green-tea-pore-cleansing-face-wash",
      "brand": "Plum",
      "category": "Beauty & Makeup",
      "price": 299,
      "minPrice": 299,
      "originalPrice": 395,
      "discountPct": 24,
      "description": "Soap-free, non-drying foaming cleanser with organic green tea extracts and gentle cellulose micro-beads. Washes away excess oil and grime without compromising moisture barrier.",
      "media": [
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 27500,
      "soldCount": 94000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Volume": "120 ml",
        "Skin Type": "Oily & Acne Prone"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_nykaa_lipstick",
      "title": "Nykaa Matte to Last Liquid Lipstick (Chai, 4.5ml Transfer-Proof)",
      "slug": "nykaa-matte-to-last-liquid-lipstick-chai",
      "brand": "Nykaa",
      "category": "Beauty & Makeup",
      "price": 479,
      "minPrice": 479,
      "originalPrice": 649,
      "discountPct": 26,
      "description": "Ultra-lightweight whipped liquid lipstick infused with Vitamin E and Jojoba oil. Dries down to an unyielding transfer-proof matte that feels soft and featherlight on lips all day.",
      "media": [
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 16400,
      "soldCount": 58000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Shade": "Chai 18 (Warm Caramel Nude)",
        "Volume": "4.5 ml"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_sugar_highlighter",
      "title": "SUGAR Cosmetics Contour De Force Mini Highlighter (Champagne Champion)",
      "slug": "sugar-contour-de-force-mini-highlighter",
      "brand": "SUGAR",
      "category": "Beauty & Makeup",
      "price": 349,
      "minPrice": 349,
      "originalPrice": 449,
      "discountPct": 22,
      "description": "Featherlight baked powder highlighter infused with micro-pearl particles that deliver a sculpted lit-from-within glow without any visible chunky glitter fallout.",
      "media": [
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 9400,
      "soldCount": 32000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Shade": "01 Champagne Champion",
        "Weight": "4 g"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_biotique_shampoo",
      "title": "Biotique Bio Kelp Protein Shampoo for Hair Fall Control (650ml)",
      "slug": "biotique-bio-kelp-protein-shampoo-650ml",
      "brand": "Biotique",
      "category": "Beauty & Makeup",
      "price": 389,
      "minPrice": 389,
      "originalPrice": 590,
      "discountPct": 34,
      "description": "Nourishing botanical hair wash infused with cold pure kelp, natural protein, peppermint oil, and mint leaf extract. Invigorates hair follicles for thicker, stronger hair growth.",
      "media": [
        "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.4,
      "ratingCount": 22100,
      "soldCount": 84000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Volume": "650 ml Family Pack",
        "Hair Type": "Weak & Thinning Hair"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_clinique_moisture",
      "title": "Clinique Moisture Surge 100H Auto-Replenishing Hydrator Gel-Cream (50ml)",
      "slug": "clinique-moisture-surge-100h-hydrator",
      "brand": "Clinique",
      "category": "Beauty & Makeup",
      "price": 2950,
      "minPrice": 2950,
      "originalPrice": 3300,
      "discountPct": 11,
      "description": "Oil-free refreshing gel-cream moisturizer with Aloe Bio-Ferment and Hyaluronic Acid that penetrates 10+ layers deep into skin, delivering 100 continuous hours of soothing hydration.",
      "media": [
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 14200,
      "soldCount": 49000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Volume": "50 ml",
        "Formula": "Oil-Free Gel Cream"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_cetaphil_cleanser",
      "title": "Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin (500ml)",
      "slug": "cetaphil-gentle-skin-cleanser-500ml",
      "brand": "Cetaphil",
      "category": "Beauty & Makeup",
      "price": 1149,
      "minPrice": 1149,
      "originalPrice": 1399,
      "discountPct": 18,
      "description": "Dermatologist-recommended non-comedogenic gentle cleanser clinically tested to preserve skin natural protective barrier. Defends against dryness, irritation, roughness, and tightness.",
      "media": [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 46200,
      "soldCount": 168000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Volume": "500 ml Pump Pack",
        "Form": "Lotion Cleanser"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_beauty_laneige_lipmask",
      "title": "Laneige Lip Sleeping Mask (Berry Flavor, 20g Overnight Repair)",
      "slug": "laneige-lip-sleeping-mask-berry-20g",
      "brand": "Laneige",
      "category": "Beauty & Makeup",
      "price": 1320,
      "minPrice": 1320,
      "originalPrice": 1550,
      "discountPct": 15,
      "description": "Cult-favorite leave-on lip mask enriched with antioxidant-rich Berry Fruit Complex and Vitamin C. Melts away dry flakes overnight to reveal ultra-soft, plump, deeply hydrated lips.",
      "media": [
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 24800,
      "soldCount": 94000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Flavor": "Berry",
        "Weight": "20 g",
        "Usage": "Overnight Sleeping Mask"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_manyavar_sherwani",
      "title": "Manyavar Pure Silk Blend Handcrafted Royal Wedding Sherwani Set (Ivory & Gold)",
      "slug": "manyavar-pure-silk-blend-royal-wedding-sherwani",
      "brand": "Manyavar",
      "category": "Textiles & Ethnic Wear",
      "price": 14999,
      "minPrice": 14999,
      "originalPrice": 18999,
      "discountPct": 21,
      "description": "Regal bridal wedding sherwani handcrafted in raw silk blend with intricate zardozi and resham embroidery. Complete set includes mandarin collar coat, matching churidar, and brocade stole.",
      "media": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 1480,
      "soldCount": 5200,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Fabric": "Raw Silk Blend with Satin Lining",
        "Fit": "Royal Tailored Fit",
        "Care": "Dry Clean Only"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_fabindia_saree",
      "title": "Fabindia Chanderi Silk Zari Woven Saree with Running Blouse Piece (Emerald Green)",
      "slug": "fabindia-chanderi-silk-zari-saree-green",
      "brand": "Fabindia",
      "category": "Textiles & Ethnic Wear",
      "price": 6490,
      "minPrice": 6490,
      "originalPrice": 7990,
      "discountPct": 19,
      "description": "Authentic handloom Chanderi silk saree featuring delicate metallic gold zari motifs across the body and heavy woven pallu. Comes with an unstitched 80cm blouse piece.",
      "media": [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 2240,
      "soldCount": 7900,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Length": "6.3 Metres (with Blouse)",
        "Fabric": "Chanderi Silk Cotton Blend"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_kanchipuram_silk",
      "title": "Kanchipuram Pure Mulberry Silk Brocade Bridal Saree with Silk Mark (Ruby Red)",
      "slug": "kanchipuram-pure-mulberry-silk-bridal-saree",
      "brand": "Nalli Silks",
      "category": "Textiles & Ethnic Wear",
      "price": 18499,
      "minPrice": 18499,
      "originalPrice": 24999,
      "discountPct": 26,
      "description": "Heirloom South Indian bridal saree handwoven with 100% pure mulberry silk and authentic gold zari. Korvai border technique with temple vanki motifs. Silk Mark Certified.",
      "media": [
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 3820,
      "soldCount": 12500,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Zari": "Tested High-Grade Zari",
        "Certification": "Silk Mark India",
        "Weight": "850 g"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_peter_england_shirt",
      "title": "Peter England Men Premium 100% Egyptian Cotton Slim Fit Formal Shirt (Sky Blue)",
      "slug": "peter-england-cotton-slim-fit-formal-shirt",
      "brand": "Peter England",
      "category": "Textiles & Ethnic Wear",
      "price": 1299,
      "minPrice": 1299,
      "originalPrice": 1999,
      "discountPct": 35,
      "description": "Tailored executive formal shirt crafted from long staple Egyptian combed cotton. Features wrinkle-resistant easy care finish, semi-spread collar, and mitered button cuffs.",
      "media": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 14800,
      "soldCount": 52000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Fit": "Slim Fit",
        "Sleeve": "Full Sleeve with Mitered Cuffs",
        "Weave": "Fine Poplin"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_levis_511",
      "title": "Levi's 511 Slim Fit Stretch Denim Jeans (Dark Indigo Wash)",
      "slug": "levis-511-slim-fit-stretch-jeans",
      "brand": "Levi's",
      "category": "Textiles & Ethnic Wear",
      "price": 2499,
      "minPrice": 2499,
      "originalPrice": 3999,
      "discountPct": 38,
      "description": "A modern slim with room to move. Built with Levis Flex advanced stretch technology for optimal mobility, classic 5-pocket styling, and signature back pocket red tab.",
      "media": [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 24100,
      "soldCount": 89000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Material": "99% Cotton, 1% Elastane",
        "Rise": "Mid Rise",
        "Leg Opening": "14.5 inch"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_w_kurta",
      "title": "W for Woman Geometric Print Straight Rayon Kurta with Pocket (Teal Blue)",
      "slug": "w-for-woman-geometric-print-straight-kurta",
      "brand": "W",
      "category": "Textiles & Ethnic Wear",
      "price": 1199,
      "minPrice": 1199,
      "originalPrice": 2499,
      "discountPct": 52,
      "description": "Effortlessly chic everyday ethnic tunic cut in breathable Liva rayon viscose. Features mandarin keyhole neck, 3/4th sleeves, side slits, and one convenient side seam pocket.",
      "media": [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 8400,
      "soldCount": 31000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Length": "Calf Length (44 inch)",
        "Pattern": "Geometric Floral",
        "Sleeves": "3/4th Sleeve"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_biba_suit",
      "title": "Biba Women Pure Cotton Straight Embroidered Kurta Pants & Dupatta Set",
      "slug": "biba-pure-cotton-embroidered-kurta-set",
      "brand": "Biba",
      "category": "Textiles & Ethnic Wear",
      "price": 2999,
      "minPrice": 2999,
      "originalPrice": 4995,
      "discountPct": 40,
      "description": "Festive ready 3-piece coordinated suit set crafted in pure breathable cotton. Highlights thread embroidery on the neckline, elasticated trousers with pockets, and printed cotton voile dupatta.",
      "media": [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 11200,
      "soldCount": 42000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Set Contents": "Kurta, Bottom Pants, Dupatta",
        "Fabric": "100% Cotton"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_raymond_suit",
      "title": "Raymond Fine Wool Blend Unstitched Premium Suit Fabric (Charcoal Grey, 3 Metres)",
      "slug": "raymond-wool-blend-suit-fabric-charcoal",
      "brand": "Raymond",
      "category": "Textiles & Ethnic Wear",
      "price": 3499,
      "minPrice": 3499,
      "originalPrice": 4999,
      "discountPct": 30,
      "description": "Bespoke suit and tuxedo suiting fabric woven with fine Merino wool and anti-crease polyester. Imparts an elegant drape, all-weather comfort, and authentic Raymond selvedge branding.",
      "media": [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 4620,
      "soldCount": 16000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Length": "3.00 Metres (Width 147 cm)",
        "Composition": "65% Poly, 35% Merino Wool"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_allen_solly_chinos",
      "title": "Allen Solly Men Slim Fit Stretch Cotton Chinos (Khaki Beige)",
      "slug": "allen-solly-slim-fit-stretch-cotton-chinos",
      "brand": "Allen Solly",
      "category": "Textiles & Ethnic Wear",
      "price": 1499,
      "minPrice": 1499,
      "originalPrice": 2299,
      "discountPct": 35,
      "description": "Smart casual Friday work chinos crafted in soft combed twill with 2% elastane stretch. Features flat front styling, slant pockets, and subtle embroidered logo at the back welt pocket.",
      "media": [
        "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.5,
      "ratingCount": 9800,
      "soldCount": 35000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Fit": "Slim Fit",
        "Material": "Cotton Twill Stretch",
        "Closure": "Zip Fly with Button"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_aurelia_kurta",
      "title": "Aurelia Gold Print Round Neck Straight Festive Kurta (Burgundy)",
      "slug": "aurelia-gold-print-straight-festive-kurta",
      "brand": "Aurelia",
      "category": "Textiles & Ethnic Wear",
      "price": 899,
      "minPrice": 899,
      "originalPrice": 1799,
      "discountPct": 50,
      "description": "Radiant festive kurta embellished with gold leaf foil prints across the front panel. Tailored with a graceful round neck and side vents, pairing effortlessly with gold churidar.",
      "media": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.4,
      "ratingCount": 6540,
      "soldCount": 24000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Fabric": "Liva Viscose Rayon",
        "Pattern": "Gold Foil Print"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_libas_anarkali",
      "title": "Libas Cotton Floral Tiered Anarkali Kurta Set with Chiffon Dupatta (Pastel Pink)",
      "slug": "libas-cotton-floral-anarkali-kurta-set",
      "brand": "Libas",
      "category": "Textiles & Ethnic Wear",
      "price": 1999,
      "minPrice": 1999,
      "originalPrice": 3999,
      "discountPct": 50,
      "description": "Romantic floor-grazing flared Anarkali kurta tailored with delicate handblock floral motifs, tasseled drawstring waist, narrow pants, and ethereal lightweight chiffon dupatta.",
      "media": [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 14100,
      "soldCount": 51000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Length": "Ankle Length (48 inch)",
        "Flare": "3.2 Metre Hem Gher"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_banarasi_saree",
      "title": "Varanasi Weavers Banarasi Georgette Handloom Silk Saree with Antique Zari (Royal Blue)",
      "slug": "banarasi-georgette-handloom-silk-saree",
      "brand": "Varanasi Weavers",
      "category": "Textiles & Ethnic Wear",
      "price": 8990,
      "minPrice": 8990,
      "originalPrice": 12900,
      "discountPct": 30,
      "description": "Lustrous Varanasi handloom saree handwoven in pure Khaddi Georgette silk with antique matte gold zari floral jaal. Soft, graceful drape suitable for grand receptions and parties.",
      "media": [
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 2180,
      "soldCount": 8200,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Fabric": "Pure Khaddi Georgette Silk",
        "Zari": "Antique Dull Gold Weft"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_van_heusen_blazer",
      "title": "Van Heusen Men Single-Breasted Textured Slim Fit Casual Blazer (Navy Blue)",
      "slug": "van-heusen-single-breasted-casual-blazer",
      "brand": "Van Heusen",
      "category": "Textiles & Ethnic Wear",
      "price": 4999,
      "minPrice": 4999,
      "originalPrice": 7999,
      "discountPct": 37,
      "description": "Modern textured blazer with sharp notch lapel, dual button front closure, chest welt pocket, and dual side vents. Designed to transition smoothly from boardroom to evening dinner.",
      "media": [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.7,
      "ratingCount": 3950,
      "soldCount": 14000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Material": "Poly-Viscose Stretch Twill",
        "Fit": "Ultra Slim Fit"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_soch_tunic",
      "title": "Soch Chanderi Embroidered Straight Tunic with Zari Borders (Mustard Gold)",
      "slug": "soch-chanderi-embroidered-straight-tunic",
      "brand": "Soch",
      "category": "Textiles & Ethnic Wear",
      "price": 1598,
      "minPrice": 1598,
      "originalPrice": 3198,
      "discountPct": 50,
      "description": "Vibrant mustard Chanderi silk tunic adorned with traditional mirror and thread embroidery across the neckline. Lined with butter crepe for breathable all-day festive comfort.",
      "media": [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.6,
      "ratingCount": 4800,
      "soldCount": 18000,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Fabric": "Chanderi with Butter Crepe Lining",
        "Care": "Dry Clean Preferred"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_fabindia_kurta_pyjama",
      "title": "Fabindia Men Cotton Silk Long Kurta with Churidar Pyjama Set (Garnet Maroon)",
      "slug": "fabindia-cotton-silk-long-kurta-pyjama",
      "brand": "Fabindia",
      "category": "Textiles & Ethnic Wear",
      "price": 3690,
      "minPrice": 3690,
      "originalPrice": 4590,
      "discountPct": 20,
      "description": "Rich handwoven cotton-silk long kurta with traditional Chinese bandhgala collar, natural coconut shell buttons, and deep side pockets. Accompanied by pure white cotton churidar.",
      "media": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.8,
      "ratingCount": 3100,
      "soldCount": 11000,
      "inStock": true,
      "isDeal": false,
      "specs": {
        "Fabric": "70% Cotton, 30% Silk",
        "Length": "Knee Length"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_raw_silk_fabric",
      "title": "Bhagalpur Weavers 100% Pure Tussar Raw Silk Unstitched Fabric (Golden Honey, 3 Metres)",
      "slug": "bhagalpur-pure-tussar-raw-silk-fabric",
      "brand": "Bhagalpur Handlooms",
      "category": "Textiles & Ethnic Wear",
      "price": 2799,
      "minPrice": 2799,
      "originalPrice": 3999,
      "discountPct": 30,
      "description": "Silk Mark certified genuine wild Tussar raw silk fabric from the silk city of Bhagalpur. Natural coarse slub texture with rich organic golden sheen, ideal for kurtas and waistcoats.",
      "media": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 1850,
      "soldCount": 6500,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Length": "3 Metres (Width 112 cm)",
        "Certification": "Silk Mark"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    },
    {
      "_id": "prod_textile_pashmina_shawl",
      "title": "Kashmir Origin 100% Pure Handwoven Cashmere Pashmina Shawl (Natural Oatmeal)",
      "slug": "kashmir-pure-handwoven-cashmere-pashmina-shawl",
      "brand": "Kashmir Crafts",
      "category": "Textiles & Ethnic Wear",
      "price": 9499,
      "minPrice": 9499,
      "originalPrice": 14500,
      "discountPct": 34,
      "description": "Ultra-luxurious authentic Kashmiri Cashmere Pashmina hand-spun by master artisans in the Kashmir valley. Feathery soft 14-micron wool that easily passes the traditional wedding ring test.",
      "media": [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"
      ],
      "ratingAvg": 4.9,
      "ratingCount": 2190,
      "soldCount": 7800,
      "inStock": true,
      "isDeal": true,
      "specs": {
        "Dimensions": "100 cm x 200 cm (Full Stole / Shawl)",
        "Composition": "100% Cashmere Wool"
      },
      "createdAt": "2026-10-26T21:00:00.000Z"
    }
  ];

  for (const p of sampleProducts) {
    if (!db.findById('products', p._id)) {
      db.insertOne('products', p);
    }
  }

  // 3. Admin & Demo Users
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminPasswordHash = crypto
    .createHash('sha256')
    .update('Admin12345!' + adminSalt)
    .digest('hex');

  if (!db.findOne('users', { email: 'admin@hukum.local' })) {
    db.insertOne('users', {
      _id: 'usr_admin',
      email: 'admin@hukum.local',
      name: 'Hukum Master Admin',
      phone: '9800000000',
      passwordHash: adminPasswordHash,
      salt: adminSalt,
      role: 'admin',
      isHukumPlus: true,
      addresses: [],
      createdAt: new Date().toISOString(),
    });
  }

  const shopperSalt = crypto.randomBytes(16).toString('hex');
  const shopperPasswordHash = crypto
    .createHash('sha256')
    .update('Shopper123!' + shopperSalt)
    .digest('hex');

  if (!db.findOne('users', { email: 'vardhan@gmail.com' })) {
    db.insertOne('users', {
      _id: 'usr_vardhan',
      email: 'vardhan@gmail.com',
      name: 'Vardhan',
      phone: '9840123456',
      passwordHash: shopperPasswordHash,
      salt: shopperSalt,
      role: 'customer',
      isHukumPlus: true,
      addresses: [
        {
          id: 'addr_1',
          name: 'Muthuvel',
          phone: '+91 98401 23456',
          pincode: '600017',
          addressLine: '24, Gandhi Road, T. Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
    });
  }

  // 4. Pre-seeded Authentic Order for instant tracking & workflow verification
  if (!db.findById('orders', 'ord_demo_1')) {
    db.insertOne('orders', {
      _id: 'ord_demo_1',
      userId: 'usr_demo_shopper',
      items: [
        {
          productId: 'prod_ip15_pro',
          title: 'Apple iPhone 15 Pro Max',
          price: 154900,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        },
      ],
      address: {
        name: 'Muthuvel',
        street: '24, Gandhi Road, T. Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017',
        phone: '+91 98401 23456',
      },
      amount: {
        subtotal: 154900,
        discount: 5000,
        shipping: 0,
        total: 149900,
      },
      status: 'CONFIRMED',
      paymentMethod: 'simulated_gateway',
      idempotencyKey: 'idemp_demo_seed_001',
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'PLACED', at: new Date(Date.now() - 3600000).toISOString(), note: 'Order placed by customer' },
        { status: 'CONFIRMED', at: new Date(Date.now() - 3000000).toISOString(), note: 'Payment verified and order confirmed' },
      ],
    });
  }

  // 4. Pre-seeded Short Link (for demo flow)
  if (!db.findById('links', 'aB3xY9q')) {
    db.insertOne('links', {
      _id: 'aB3xY9q',
      longUrl: 'http://localhost:3000/products/apple-iphone-15-pro-max-256gb',
      type: 'product',
      clicks: 142,
      createdAt: new Date().toISOString(),
    });
  }

  // 5. Rebuild Autocomplete Trie
  rebuildAutocompleteTrie();

  console.log(`✅ Seed completed: ${categories.length} categories, ${sampleProducts.length} authentic products seeded.`);
}
