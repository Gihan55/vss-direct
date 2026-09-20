// Seed Data for VSS (Vehicle Sourcing & Selling Platform)
// Core Policy: No Open Papers. Direct Owner Verified.

export const INITIAL_VEHICLES = [
  {
    id: 'veh-001',
    title: '2022 Toyota Land Cruiser Prado TX-L',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2022,
    bodyType: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    mileage: 28400,
    engineCc: '2800cc Turbo',
    exteriorColor: 'Pearl White Crystal',
    interiorColor: 'Black Leather',
    listingType: 'auction', // 'auction' | 'direct'
    startingPrice: 62000,
    reservePrice: 68000,
    buyNowPrice: 74500,
    currentBid: 69500,
    bidCount: 14,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18 hrs from now
    isReserveMet: true,
    status: 'active', // 'active' | 'pending_verification' | 'sold' | 'rejected'
    featured: true,
    location: 'Colombo / Western Province',
    licensePlate: 'CBA-8821',
    isPlateMasked: true,
    images: [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    ],
    // Clean Title & No Open Papers Verification Details
    verification: {
      status: 'verified', // 'verified' | 'pending' | 'rejected'
      badge: '100% Clean Title • Direct Registered Owner',
      verifiedAt: '2026-09-01T08:30:00Z',
      auditedBy: 'Chief Legal Registrar - VSS Bureau',
      registrationDocNumber: 'CR-7844091-WP',
      chassisNumber: 'GDJ150-0089211',
      engineNumber: '1GD-FTV-99321',
      registeredOwnerName: 'Dinesh Wickramasinghe',
      ownerIdNumber: 'NIC: 198421004822',
      ownershipType: '1st Registered Owner (Direct from Brand New)',
      revenueLicenseValidUntil: '2027-04-30',
      financeEmbargo: 'None (Absolute Clear Title - Lien Cleared)',
      noOpenPapersDeclarationSigned: true,
      inspectionScore: 96, // out of 100
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    // Seller details (Privacy Shielded)
    seller: {
      id: 'sel-101',
      name: 'Dinesh W.',
      maskedPhone: '+94 77 ••• ••92',
      fullPhone: '+94 77 348 1192',
      memberSince: 'March 2024',
      rating: 4.9,
      directSellerConfirmed: true,
      brokerFlagScore: 0 // 0 means genuine private seller
    },
    specs: {
      seating: '7 Seater',
      drivetrain: '4WD Full-Time',
      sunroof: 'Yes',
      audio: 'JBL Premium Surround 14 Speakers',
      keys: '2 Original Smart Keys Available',
      serviceRecords: '100% Agent Maintained with all invoices',
      district: 'Colombo', city: 'Colombo 07', mapLat: 6.9271, mapLng: 79.8612, conditionGrade: 'A',
      noDamage: true, damageZones: [],
      videoUrl: 'https://example.com/walkaround/veh-001',
      odometerPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ratingSum: 47, ratingCount: 10
    },
    bids: [
      { id: 'bid-14', bidder: 'Verified Bidder #712', amount: 69500, time: '14 mins ago', isWinning: true },
      { id: 'bid-13', bidder: 'Verified Bidder #409', amount: 68500, time: '42 mins ago', isWinning: false },
      { id: 'bid-12', bidder: 'Verified Bidder #712', amount: 67000, time: '2 hours ago', isWinning: false },
      { id: 'bid-11', bidder: 'Verified Bidder #318', amount: 65000, time: '4 hours ago', isWinning: false },
      { id: 'bid-10', bidder: 'Verified Bidder #104', amount: 63000, time: '8 hours ago', isWinning: false }
    ],
    savingsVsMiddleman: 4800, // Direct buyer/seller saving
    viewsCount: 1420
  },
  {
    id: 'veh-002',
    title: '2023 Porsche Cayenne E-Hybrid Platinum Edition',
    make: 'Porsche',
    model: 'Cayenne E-Hybrid',
    year: 2023,
    bodyType: 'SUV',
    transmission: 'PDK 8-Speed',
    fuelType: 'Plug-in Hybrid',
    mileage: 14200,
    engineCc: '3.0L V6 Turbo + 100kW E-Motor (462 hp)',
    exteriorColor: 'Chromite Black Metallic',
    interiorColor: 'Crayon & Slate Grey Two-Tone',
    listingType: 'auction',
    startingPrice: 115000,
    reservePrice: 125000,
    buyNowPrice: 139000,
    currentBid: 126500,
    bidCount: 22,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 mins from now (Hot!)
    isReserveMet: true,
    status: 'active',
    featured: true,
    location: 'Colombo 07 / Western Province',
    licensePlate: 'CBB-4001',
    isPlateMasked: true,
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
    ],
    verification: {
      status: 'verified',
      badge: '100% Clean Title • Direct Registered Owner',
      verifiedAt: '2026-09-03T11:15:00Z',
      auditedBy: 'Senior Registrar - Title Assurance Desk',
      registrationDocNumber: 'CR-9042215-WP',
      chassisNumber: 'WP1ZZZ9Y8PDA41209',
      engineNumber: 'DCU-108233',
      registeredOwnerName: 'Dr. Shanaka Perera',
      ownerIdNumber: 'NIC: 197819001923',
      ownershipType: '1st Registered Owner',
      revenueLicenseValidUntil: '2027-02-28',
      financeEmbargo: 'None (Full Bank NOC Cleared)',
      noOpenPapersDeclarationSigned: true,
      inspectionScore: 99,
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    seller: {
      id: 'sel-102',
      name: 'Dr. Shanaka P.',
      maskedPhone: '+94 71 ••• ••14',
      fullPhone: '+94 71 882 1914',
      memberSince: 'January 2025',
      rating: 5.0,
      directSellerConfirmed: true,
      brokerFlagScore: 0
    },
    specs: {
      seating: '5 Seater',
      drivetrain: 'AWD',
      sunroof: 'Panoramic Glass Roof',
      audio: 'Bose Surround Sound System',
      keys: '2 Original Keys + Smart Card',
      serviceRecords: 'Official Porsche Centre Records Up-to-Date',
      district: 'Colombo', city: 'Colombo 07', mapLat: 6.9061, mapLng: 79.8996, conditionGrade: 'A',
      noDamage: true, damageZones: [],
      videoUrl: 'https://example.com/walkaround/veh-002',
      odometerPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ratingSum: 58, ratingCount: 12
    },
    bids: [
      { id: 'bid-22', bidder: 'Verified Bidder #990', amount: 126500, time: '2 mins ago', isWinning: true },
      { id: 'bid-21', bidder: 'Verified Bidder #331', amount: 125000, time: '11 mins ago', isWinning: false },
      { id: 'bid-20', bidder: 'Verified Bidder #990', amount: 123000, time: '25 mins ago', isWinning: false }
    ],
    savingsVsMiddleman: 8500,
    viewsCount: 3120
  },
  {
    id: 'veh-003',
    title: '2021 Mercedes-Benz C200 AMG Line (W206)',
    make: 'Mercedes-Benz',
    model: 'C-Class C200',
    year: 2021,
    bodyType: 'Sedan',
    transmission: '9G-Tronic Automatic',
    fuelType: 'Mild Hybrid Petrol',
    mileage: 32000,
    engineCc: '1500cc Turbo + EQ Boost',
    exteriorColor: 'Selenite Grey Metallic',
    interiorColor: 'Sienna Brown & Black Nappa',
    listingType: 'direct', // Direct buy / make an offer
    directPrice: 49500,
    status: 'active',
    featured: false,
    location: 'Kandy / Central Province',
    licensePlate: 'CAR-5512',
    isPlateMasked: true,
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617814076668-8dfc6cb330fb?auto=format&fit=crop&w=1200&q=80'
    ],
    verification: {
      status: 'verified',
      badge: '100% Clean Title • Direct Registered Owner',
      verifiedAt: '2026-08-28T14:00:00Z',
      auditedBy: 'VSS Title Auditor Team',
      registrationDocNumber: 'CR-6541299-CP',
      chassisNumber: 'W1K2060422R198214',
      engineNumber: '254915-300412',
      registeredOwnerName: 'Malik Jayawardena',
      ownerIdNumber: 'NIC: 198930101188',
      ownershipType: '1st Registered Owner',
      revenueLicenseValidUntil: '2027-01-15',
      financeEmbargo: 'None (Clean Title)',
      noOpenPapersDeclarationSigned: true,
      inspectionScore: 94,
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    seller: {
      id: 'sel-103',
      name: 'Malik J.',
      maskedPhone: '+94 70 ••• ••39',
      fullPhone: '+94 70 219 4439',
      memberSince: 'June 2024',
      rating: 4.8,
      directSellerConfirmed: true,
      brokerFlagScore: 0
    },
    specs: {
      seating: '5 Seater',
      drivetrain: 'RWD',
      sunroof: 'Panoramic Sunroof',
      audio: 'Burmester 3D Surround',
      keys: '2 Keys',
      serviceRecords: 'Complete DIMO Service History',
      district: 'Kandy', city: 'Kandy', mapLat: 7.2906, mapLng: 80.6337, conditionGrade: 'B',
      noDamage: false, damageZones: ['lf-door'],
      videoUrl: null,
      odometerPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ratingSum: 40, ratingCount: 9
    },
    savingsVsMiddleman: 3200,
    viewsCount: 1890
  },
  {
    id: 'veh-004',
    title: '2023 Hyundai Ioniq 5 Long Range AWD',
    make: 'Hyundai',
    model: 'Ioniq 5',
    year: 2023,
    bodyType: 'Electric Crossover',
    transmission: 'Single-Speed Reduction Gear',
    fuelType: 'Electric',
    mileage: 18900,
    engineCc: '77.4 kWh Battery Dual Motor (320 hp)',
    exteriorColor: 'Gravity Gold Matte',
    interiorColor: 'Dark Pebble Grey Eco-Leather',
    listingType: 'auction',
    startingPrice: 42000,
    reservePrice: 46000,
    buyNowPrice: 51000,
    currentBid: 47200,
    bidCount: 9,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hrs
    isReserveMet: true,
    status: 'active',
    featured: true,
    location: 'Negombo / Western Province',
    licensePlate: 'CBA-1194',
    isPlateMasked: true,
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
    ],
    verification: {
      status: 'verified',
      badge: '100% Clean Title • Direct Registered Owner',
      verifiedAt: '2026-09-02T16:20:00Z',
      auditedBy: 'EV & Title Specialist Unit',
      registrationDocNumber: 'CR-8821034-WP',
      chassisNumber: 'KMHC85LE9PU102834',
      engineNumber: 'EM17-098231',
      registeredOwnerName: 'Kasun Fernando',
      ownerIdNumber: 'NIC: 199104509122',
      ownershipType: '1st Owner',
      revenueLicenseValidUntil: '2027-08-30',
      financeEmbargo: 'None',
      noOpenPapersDeclarationSigned: true,
      inspectionScore: 98,
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    seller: {
      id: 'sel-104',
      name: 'Kasun F.',
      maskedPhone: '+94 77 ••• ••81',
      fullPhone: '+94 77 910 2281',
      memberSince: 'February 2025',
      rating: 4.9,
      directSellerConfirmed: true,
      brokerFlagScore: 0
    },
    specs: {
      seating: '5 Seater',
      drivetrain: 'AWD Dual Motor',
      sunroof: 'Vision Roof',
      audio: 'Bose Sound',
      keys: '2 Keys + Digital Key Card',
      serviceRecords: '100% Agent records, Battery SOH 99%',
      district: 'Gampaha', city: 'Negombo', mapLat: 7.2083, mapLng: 79.8358, conditionGrade: 'A',
      noDamage: true, damageZones: [],
      videoUrl: 'https://example.com/walkaround/veh-004',
      odometerPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ratingSum: 33, ratingCount: 7
    },
    bids: [
      { id: 'bid-9', bidder: 'Verified Bidder #552', amount: 47200, time: '1 hour ago', isWinning: true },
      { id: 'bid-8', bidder: 'Verified Bidder #119', amount: 46000, time: '3 hours ago', isWinning: false }
    ],
    savingsVsMiddleman: 3500,
    viewsCount: 2240
  },
  {
    id: 'veh-005',
    title: '2020 Honda Civic RS Turbo (FK7)',
    make: 'Honda',
    model: 'Civic RS Turbo',
    year: 2020,
    bodyType: 'Hatchback',
    transmission: 'CVT with Paddle Shifters',
    fuelType: 'Petrol',
    mileage: 41000,
    engineCc: '1500cc VTEC Turbo',
    exteriorColor: 'Sonic Gray Pearl',
    interiorColor: 'Black with Red Sport Stitching',
    listingType: 'auction',
    startingPrice: 28000,
    reservePrice: 32000,
    buyNowPrice: 35000,
    currentBid: 30500,
    bidCount: 7,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), // 4 hrs from now
    isReserveMet: false, // Reserve NOT met yet demonstration!
    status: 'active',
    featured: false,
    location: 'Galle / Southern Province',
    licensePlate: 'CBH-2918',
    isPlateMasked: true,
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80'
    ],
    verification: {
      status: 'verified',
      badge: '100% Clean Title • Direct Registered Owner',
      verifiedAt: '2026-09-04T09:45:00Z',
      auditedBy: 'VSS Title Auditor Team',
      registrationDocNumber: 'CR-5419902-SP',
      chassisNumber: 'FK7-1209381',
      engineNumber: 'L15C-109244',
      registeredOwnerName: 'Nuwan Thushara',
      ownerIdNumber: 'NIC: 199320801944',
      ownershipType: '2nd Registered Owner (Transferred in 2022 legally)',
      revenueLicenseValidUntil: '2027-03-31',
      financeEmbargo: 'None',
      noOpenPapersDeclarationSigned: true,
      inspectionScore: 92,
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    seller: {
      id: 'sel-105',
      name: 'Nuwan T.',
      maskedPhone: '+94 76 ••• ••55',
      fullPhone: '+94 76 551 8855',
      memberSince: 'May 2024',
      rating: 4.7,
      directSellerConfirmed: true,
      brokerFlagScore: 0
    },
    specs: {
      seating: '5 Seater',
      drivetrain: 'FWD',
      sunroof: 'Electric Sunroof',
      audio: 'Honda Display Audio with Apple CarPlay',
      keys: '2 Smart Keys',
      serviceRecords: 'Stafford Motors Service Records',
      district: 'Galle', city: 'Galle', mapLat: 6.0535, mapLng: 80.2210, conditionGrade: 'B',
      noDamage: false, damageZones: ['rear-bumper'],
      videoUrl: null,
      odometerPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ratingSum: 26, ratingCount: 6
    },
    bids: [
      { id: 'bid-7', bidder: 'Verified Bidder #204', amount: 30500, time: '25 mins ago', isWinning: true },
      { id: 'bid-6', bidder: 'Verified Bidder #811', amount: 29500, time: '1 hour ago', isWinning: false }
    ],
    savingsVsMiddleman: 2100,
    viewsCount: 1650
  },
  // Item pending Admin Verification (Shows the Audit Workflow in Admin Portal!)
  {
    id: 'veh-006',
    title: '2021 Suzuki Swift RS Turbo (ZC13S)',
    make: 'Suzuki',
    model: 'Swift RS Turbo',
    year: 2021,
    bodyType: 'Hatchback',
    transmission: '6-Speed Automatic with Paddle Shift',
    fuelType: 'Petrol Boosterjet',
    mileage: 38000,
    engineCc: '1000cc 3-Cylinder Turbo',
    exteriorColor: 'Burning Red Pearl Metallic',
    interiorColor: 'Sport Dark Fabric',
    listingType: 'auction',
    startingPrice: 19000,
    reservePrice: 21500,
    buyNowPrice: 23500,
    currentBid: 19000,
    bidCount: 0,
    auctionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    isReserveMet: false,
    status: 'pending_verification', // PENDING ADMIN AUDIT!
    featured: false,
    location: 'Kurunegala / North Western',
    licensePlate: 'CBE-9941',
    isPlateMasked: true,
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
    ],
    verification: {
      status: 'pending',
      badge: 'Verification In Progress',
      submittedAt: '2026-09-06T07:15:00Z',
      registrationDocNumber: 'CR-4829104-NWP',
      chassisNumber: 'ZC13S-104921',
      engineNumber: 'K10C-409122',
      registeredOwnerName: 'Chaminda Bandara',
      ownerIdNumber: 'NIC: 198614400192',
      ownershipType: '1st Registered Owner',
      revenueLicenseValidUntil: '2027-05-31',
      financeEmbargo: 'Commercial Bank Lease (Lease settlement letter attached)',
      noOpenPapersDeclarationSigned: true,
      inspectionScore: null,
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    seller: {
      id: 'sel-106',
      name: 'Chaminda B.',
      maskedPhone: '+94 71 ••• ••41',
      fullPhone: '+94 71 440 9941',
      memberSince: 'September 2026',
      rating: 4.5,
      directSellerConfirmed: true,
      brokerFlagScore: 5 // minor alert to check lease clearance
    },
    specs: {
      seating: '5 Seater',
      drivetrain: 'FWD',
      sunroof: 'No',
      audio: 'Android Auto & Carplay',
      keys: '2 Smart Keys',
      serviceRecords: 'AMW agent records',
      district: 'Kurunegala', city: 'Kurunegala', mapLat: 7.4863, mapLng: 80.3623, conditionGrade: 'C',
      noDamage: false, damageZones: ['hood'],
      videoUrl: null,
      odometerPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ratingSum: 0, ratingCount: 0
    },
    bids: [],
    savingsVsMiddleman: 1500,
    viewsCount: 140
  },
  // Flagged Middleman Listing Attempt (For Admin Middleman Radar Demo)
  {
    id: 'veh-007',
    title: '2019 Toyota Aqua G Soft Leather Selection',
    make: 'Toyota',
    model: 'Aqua G',
    year: 2019,
    bodyType: 'Hatchback',
    transmission: 'e-CVT',
    fuelType: 'Hybrid',
    mileage: 64000,
    engineCc: '1500cc Hybrid',
    exteriorColor: 'Silver Metallic',
    interiorColor: 'Black Soft Leather',
    listingType: 'direct',
    directPrice: 22000,
    status: 'flagged_middleman', // SUSPECTED BROKER / OPEN PAPERS!
    featured: false,
    location: 'Dehiwala / Western Province',
    licensePlate: 'CAD-3129',
    isPlateMasked: false,
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80'
    ],
    verification: {
      status: 'rejected',
      badge: 'FLAGGED: Suspicious Open Paper / Broker Submission',
      submittedAt: '2026-09-05T18:00:00Z',
      registrationDocNumber: 'CR-1192834-WP',
      chassisNumber: 'NHP10-2194821',
      engineNumber: '1NZ-FXE-8812',
      registeredOwnerName: 'Sunil Weerasinghe (CR Name)',
      ownerIdNumber: 'NIC mismatch: Submitter is "Ranjan Car Brokers"',
      ownershipType: 'Open Paper / Blank MTA Forms Found',
      revenueLicenseValidUntil: '2025-10-31 (EXPIRED)',
      financeEmbargo: 'Unknown / Undisclosed',
      noOpenPapersDeclarationSigned: false,
      rejectionReason: 'Seller name does not match CR Registered Owner. Open paper transfer detected without legal transfer deed. Middleman multiple listing alert triggered.',
      titleCertDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ownerIdDocUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    },
    seller: {
      id: 'sel-999',
      name: 'Ranjan Deals (Unverified Broker)',
      maskedPhone: '+94 77 ••• ••00',
      fullPhone: '+94 77 999 0000',
      memberSince: 'September 2026',
      rating: 1.2,
      directSellerConfirmed: false,
      brokerFlagScore: 95 // HIGH BROKER ALERT!
    },
    specs: {
      seating: '5 Seater',
      drivetrain: 'FWD',
      sunroof: 'No',
      audio: 'Standard Japanese Setup',
      keys: '1 Key Only',
      serviceRecords: 'Missing records'
    },
    bids: [],
    savingsVsMiddleman: 0,
    viewsCount: 65
  }
];

// Operational & Behind-The-Screens Telemetry Data
export const INITIAL_TELEMETRY = {
  activeLiveVisitors: 148,
  todayTotalVisitors: 4892,
  weeklyUniqueVisitors: 28410,
  monthlyPageViews: 194800,
  trafficGrowthRate: '+34.2% MoM',
  totalAuctionsHeld: 142,
  successfulAuctionsRatio: '91.4%',
  averageTimeOnSite: '6m 42s',
  totalBuyerSavings: 'Rs 98,550,000', // Total saved vs traditional middlemen!
  openPapersRejectedCount: 38, // Number of open paper frauds stopped by VSS!
  activeRegisteredBidders: 1840,
  
  // Weekly Traffic Breakdown
  trafficByDay: [
    { day: 'Mon', visitors: 3420, auctionsHeld: 12, bidsPlaced: 84 },
    { day: 'Tue', visitors: 3890, auctionsHeld: 15, bidsPlaced: 112 },
    { day: 'Wed', visitors: 4100, auctionsHeld: 14, bidsPlaced: 129 },
    { day: 'Thu', visitors: 4650, auctionsHeld: 18, bidsPlaced: 156 },
    { day: 'Fri', visitors: 5200, auctionsHeld: 22, bidsPlaced: 210 },
    { day: 'Sat', visitors: 6480, auctionsHeld: 29, bidsPlaced: 340 },
    { day: 'Sun', visitors: 5920, auctionsHeld: 26, bidsPlaced: 295 }
  ],

  // Traffic Sources
  trafficSources: [
    { source: 'Organic Search (Google "Clean Title Cars")', percentage: 42, visitors: 11932 },
    { source: 'Social Media Campaigns (Facebook/Instagram)', percentage: 28, visitors: 7954 },
    { source: 'Direct & Word-of-Mouth', percentage: 19, visitors: 5397 },
    { source: 'Automotive Forum Referrals', percentage: 11, visitors: 3125 }
  ],

  // Top Searched Vehicle Models
  topSearches: [
    { keyword: 'Toyota Land Cruiser Prado TX-L', count: 1840, change: '+18%' },
    { keyword: 'Clean title hybrid under Rs 9M', count: 1420, change: '+29%' },
    { keyword: 'Direct owner Mercedes C200', count: 980, change: '+12%' },
    { keyword: 'No open papers electric SUV', count: 850, change: '+44%' },
    { keyword: 'Honda Civic RS Hatchback', count: 760, change: '+8%' }
  ],

  // Monetization Revenue Metrics
  revenue: {
    totalRevenueMonth: 'Rs 5,526,000',
    featuredListingFees: 'Rs 1,305,000',
    auctionSuccessCommissions: 'Rs 2,946,000',
    certifiedInspectionReports: 'Rs 825,000',
    sponsorAdClicks: 'Rs 450,000',
    projectedNextMonth: 'Rs 7,200,000'
  }
};

// Partner Ad Placements (Monetization & Growth)
export const SPONSOR_ADS = [
  {
    id: 'ad-01',
    title: 'Pre-Approved Auto Financing from 7.9% APR',
    partner: 'Apex Commercial Bank Automotive Division',
    badge: 'Official Finance Partner',
    ctaText: 'Calculate Monthly Payment',
    tagline: 'Get instant pre-approval for VSS verified clean-title vehicles without physical branch visits.',
    partnerLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'ad-02',
    title: '150-Point Mobile Physical Inspection Service',
    partner: 'VSS Certified Roadworthiness Bureau',
    badge: 'Quality Assurance',
    ctaText: 'Book Mobile Inspection (Rs 19,500)',
    tagline: 'Paint depth analysis, OBD-II ECU diagnostic scanner, hybrid battery health and road test report delivered within 3 hours.',
    partnerLogo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=200&q=80'
  }
];
