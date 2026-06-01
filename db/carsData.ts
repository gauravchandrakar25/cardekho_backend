export interface Car {
  id?: number;
  name: string;
  brand: string;
  body_type: 'SUV' | 'Sedan' | 'Hatchback' | 'MPV';
  fuel_type: 'Petrol' | 'Diesel' | 'CNG' | 'EV';
  price_min: number; // in Lakhs
  price_max: number; // in Lakhs
  mileage: number; // in kmpl or km/charge
  safety_rating: number; // e.g. 3, 4, 5 stars
  transmission: string;
  description: string;
}

export const carsData: Car[] = [
  {
    name: 'Swift',
    brand: 'Maruti Suzuki',
    body_type: 'Hatchback',
    fuel_type: 'Petrol',
    price_min: 6.49,
    price_max: 9.64,
    mileage: 24.80,
    safety_rating: 4.0,
    transmission: 'Manual/Automatic',
    description: 'Extremely popular, highly fuel-efficient hatchback with sharp styling, low maintenance costs, and great city maneuverability.'
  },
  {
    name: 'Tiago EV',
    brand: 'Tata',
    body_type: 'Hatchback',
    fuel_type: 'EV',
    price_min: 7.99,
    price_max: 11.89,
    mileage: 315.00,
    safety_rating: 4.0,
    transmission: 'Automatic',
    description: 'Affordable electric hatchback perfect for daily city commutes, offering low running costs and a 4-star safety rating.'
  },
  {
    name: 'i20',
    brand: 'Hyundai',
    body_type: 'Hatchback',
    fuel_type: 'Petrol',
    price_min: 7.04,
    price_max: 11.21,
    mileage: 16.00,
    safety_rating: 3.0,
    transmission: 'Manual/Automatic',
    description: 'Premium hatchback featuring a sporty design, spacious cabin, and advanced infotainment tech with standard safety packages.'
  },
  {
    name: 'Nexon',
    brand: 'Tata',
    body_type: 'SUV',
    fuel_type: 'Petrol',
    price_min: 7.99,
    price_max: 15.60,
    mileage: 17.40,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'Highly popular compact SUV, famous for being the first Indian car to achieve a 5-star GNCAP safety rating. Excellent build quality.'
  },
  {
    name: 'Nexon EV',
    brand: 'Tata',
    body_type: 'SUV',
    fuel_type: 'EV',
    price_min: 14.49,
    price_max: 19.29,
    mileage: 465.00,
    safety_rating: 5.0,
    transmission: 'Automatic',
    description: "India's best-selling electric SUV offering an impressive real-world range, premium cabin features, and robust 5-star safety."
  },
  {
    name: 'Creta',
    brand: 'Hyundai',
    body_type: 'SUV',
    fuel_type: 'Diesel',
    price_min: 12.45,
    price_max: 20.15,
    mileage: 19.10,
    safety_rating: 3.0,
    transmission: 'Manual/Automatic',
    description: 'The undisputed segment-leader midsize SUV, renowned for its luxurious ride quality, panoramic sunroof, and extremely strong resale value.'
  },
  {
    name: 'Seltos',
    brand: 'Kia',
    body_type: 'SUV',
    fuel_type: 'Petrol',
    price_min: 10.90,
    price_max: 20.30,
    mileage: 17.00,
    safety_rating: 3.0,
    transmission: 'Manual/Automatic',
    description: 'Aggressive and tech-loaded midsize SUV offering a futuristic cabin, dual-screen setup, robust performance, and sporty dynamics.'
  },
  {
    name: 'XUV700',
    brand: 'Mahindra',
    body_type: 'SUV',
    fuel_type: 'Diesel',
    price_min: 13.99,
    price_max: 26.99,
    mileage: 14.50,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'Premium 5 or 7 seater family SUV boasting an advanced ADAS suite, powerful engine options, 5-star safety, and massive road presence.'
  },
  {
    name: 'City',
    brand: 'Honda',
    body_type: 'Sedan',
    fuel_type: 'Petrol',
    price_min: 11.82,
    price_max: 16.35,
    mileage: 17.80,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'The legendary midsize sedan offering exceptional cabin comfort, bulletproof i-VTEC engine reliability, and elegant high-speed stability.'
  },
  {
    name: 'Verna',
    brand: 'Hyundai',
    body_type: 'Sedan',
    fuel_type: 'Petrol',
    price_min: 11.00,
    price_max: 17.42,
    mileage: 18.60,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'Futuristic sedan featuring a 5-star safety rating, spacious cabin, premium Bose sound system, and segment-first heated and ventilated seats.'
  },
  {
    name: 'Dzire',
    brand: 'Maruti Suzuki',
    body_type: 'Sedan',
    fuel_type: 'CNG',
    price_min: 6.79,
    price_max: 10.14,
    mileage: 31.12,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'Compact sedan providing unmatched CNG mileage, high interior passenger space, extreme durability, and legendary Suzuki resale value.'
  },
  {
    name: 'Ertiga',
    brand: 'Maruti Suzuki',
    body_type: 'MPV',
    fuel_type: 'CNG',
    price_min: 10.78,
    price_max: 13.03,
    mileage: 26.11,
    safety_rating: 3.0,
    transmission: 'Manual',
    description: 'The ultimate budget 7-seater family MPV offering flexible cabin spacing, exceptionally low maintenance, and excellent fuel economy.'
  },
  {
    name: 'Innova Hycross',
    brand: 'Toyota',
    body_type: 'MPV',
    fuel_type: 'Petrol',
    price_min: 19.77,
    price_max: 30.98,
    mileage: 23.24,
    safety_rating: 5.0,
    transmission: 'Automatic',
    description: 'Ultra-premium self-charging hybrid MPV featuring luxurious ottoman seats, stellar 23 kmpl efficiency, and legendary Toyota reliability.'
  },
  {
    name: 'Fortuner',
    brand: 'Toyota',
    body_type: 'SUV',
    fuel_type: 'Diesel',
    price_min: 33.43,
    price_max: 51.44,
    mileage: 14.40,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'Rugged, full-size 4x4 SUV with unmatched road presence, bulletproof engine reliability, massive resale value, and heavy off-road capability.'
  },
  {
    name: 'Punch',
    brand: 'Tata',
    body_type: 'SUV',
    fuel_type: 'Petrol',
    price_min: 6.13,
    price_max: 10.20,
    mileage: 20.09,
    safety_rating: 5.0,
    transmission: 'Manual/Automatic',
    description: 'Punchy micro-SUV with 5-star GNCAP safety, high driving position, superb ground clearance, and an affordable entry price.'
  },
  {
    name: 'ZS EV',
    brand: 'MG',
    body_type: 'SUV',
    fuel_type: 'EV',
    price_min: 18.98,
    price_max: 25.44,
    mileage: 461.00,
    safety_rating: 5.0,
    transmission: 'Automatic',
    description: 'High-end electric SUV with a 50.3 kWh battery, dual-pane panoramic sunroof, 360-degree camera, and exceptional ride quietness.'
  },
  {
    name: '3 Series Gran Limousine',
    brand: 'BMW',
    body_type: 'Sedan',
    fuel_type: 'Petrol',
    price_min: 60.60,
    price_max: 65.00,
    mileage: 13.00,
    safety_rating: 5.0,
    transmission: 'Automatic',
    description: 'Ultimate luxury long-wheelbase sedan, offering sports-car dynamics, unmatched rear legroom, high-end materials, and immense premium status.'
  }
];
