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
  image?: string | null;
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
    description: 'Extremely popular, highly fuel-efficient hatchback with sharp styling, low maintenance costs, and great city maneuverability.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
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
    description: 'Affordable electric hatchback perfect for daily city commutes, offering low running costs and a 4-star safety rating.',
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
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
    description: 'Premium hatchback featuring a sporty design, spacious cabin, and advanced infotainment tech with standard safety packages.',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80'
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
    description: 'Highly popular compact SUV, famous for being the first Indian car to achieve a 5-star GNCAP safety rating. Excellent build quality.',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
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
    description: "India's best-selling electric SUV offering an impressive real-world range, premium cabin features, and robust 5-star safety.",
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
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
    description: 'The undisputed segment-leader midsize SUV, renowned for its luxurious ride quality, panoramic sunroof, and extremely strong resale value.',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
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
    description: 'Aggressive and tech-loaded midsize SUV offering a futuristic cabin, dual-screen setup, robust performance, and sporty dynamics.',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
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
    description: 'Premium 5 or 7 seater family SUV boasting an advanced ADAS suite, powerful engine options, 5-star safety, and massive road presence.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
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
    description: 'The legendary midsize sedan offering exceptional cabin comfort, bulletproof i-VTEC engine reliability, and elegant high-speed stability.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
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
    description: 'Futuristic sedan featuring a 5-star safety rating, spacious cabin, premium Bose sound system, and segment-first heated and ventilated seats.',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
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
    description: 'Compact sedan providing unmatched CNG mileage, high interior passenger space, extreme durability, and legendary Suzuki resale value.',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80'
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
    description: 'The ultimate budget 7-seater family MPV offering flexible cabin spacing, exceptionally low maintenance, and excellent fuel economy.',
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80'
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
    description: 'Ultra-premium self-charging hybrid MPV featuring luxurious ottoman seats, stellar 23 kmpl efficiency, and legendary Toyota reliability.',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80'
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
    description: 'Rugged, full-size 4x4 SUV with unmatched road presence, bulletproof engine reliability, massive resale value, and heavy off-road capability.',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=800&q=80'
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
    description: 'Punchy micro-SUV with 5-star GNCAP safety, high driving position, superb ground clearance, and an affordable entry price.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
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
    description: 'High-end electric SUV with a 50.3 kWh battery, dual-pane panoramic sunroof, 360-degree camera, and exceptional ride quietness.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'
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
    description: 'Ultimate luxury long-wheelbase sedan, offering sports-car dynamics, unmatched rear legroom, high-end materials, and immense premium status.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
  }
];
