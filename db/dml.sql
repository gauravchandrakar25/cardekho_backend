-- DML: Insert seed data into Cars table
-- Clean out any existing cars first
DELETE FROM cars;

INSERT INTO cars (name, brand, body_type, fuel_type, price_min, price_max, mileage, safety_rating, transmission, description) VALUES
('Swift', 'Maruti Suzuki', 'Hatchback', 'Petrol', 6.49, 9.64, 24.80, 4.0, 'Manual/Automatic', 'Extremely popular, highly fuel-efficient hatchback with sharp styling, low maintenance costs, and great city maneuverability.'),
('Tiago EV', 'Tata', 'Hatchback', 'EV', 7.99, 11.89, 315.00, 4.0, 'Automatic', 'Affordable electric hatchback perfect for daily city commutes, offering low running costs and a 4-star safety rating.'),
('i20', 'Hyundai', 'Hatchback', 'Petrol', 7.04, 11.21, 16.00, 3.0, 'Manual/Automatic', 'Premium hatchback featuring a sporty design, spacious cabin, and advanced infotainment tech with standard safety packages.'),
('Nexon', 'Tata', 'SUV', 'Petrol', 7.99, 15.60, 17.40, 5.0, 'Manual/Automatic', 'Highly popular compact SUV, famous for being the first Indian car to achieve a 5-star GNCAP safety rating. Excellent build quality.'),
('Nexon EV', 'Tata', 'SUV', 'EV', 14.49, 19.29, 465.00, 5.0, 'Automatic', 'India''s best-selling electric SUV offering an impressive real-world range, premium cabin features, and robust 5-star safety.'),
('Creta', 'Hyundai', 'SUV', 'Diesel', 12.45, 20.15, 19.10, 3.0, 'Manual/Automatic', 'The undisputed segment-leader midsize SUV, renowned for its luxurious ride quality, panoramic sunroof, and extremely strong resale value.'),
('Seltos', 'Kia', 'SUV', 'Petrol', 10.90, 20.30, 17.00, 3.0, 'Manual/Automatic', 'Aggressive and tech-loaded midsize SUV offering a futuristic cabin, dual-screen setup, robust performance, and sporty dynamics.'),
('XUV700', 'Mahindra', 'SUV', 'Diesel', 13.99, 26.99, 14.50, 5.0, 'Manual/Automatic', 'Premium 5 or 7 seater family SUV boasting an advanced ADAS suite, powerful engine options, 5-star safety, and massive road presence.'),
('City', 'Honda', 'Sedan', 'Petrol', 11.82, 16.35, 17.80, 5.0, 'Manual/Automatic', 'The legendary midsize sedan offering exceptional cabin comfort, bulletproof i-VTEC engine reliability, and elegant high-speed stability.'),
('Verna', 'Hyundai', 'Sedan', 'Petrol', 11.00, 17.42, 18.60, 5.0, 'Manual/Automatic', 'Futuristic sedan featuring a 5-star safety rating, spacious cabin, premium Bose sound system, and segment-first heated and ventilated seats.'),
('Dzire', 'Maruti Suzuki', 'Sedan', 'CNG', 6.79, 10.14, 31.12, 5.0, 'Manual/Automatic', 'Compact sedan providing unmatched CNG mileage, high interior passenger space, extreme durability, and legendary Suzuki resale value.'),
('Ertiga', 'Maruti Suzuki', 'MPV', 'CNG', 10.78, 13.03, 26.11, 3.0, 'Manual', 'The ultimate budget 7-seater family MPV offering flexible cabin spacing, exceptionally low maintenance, and excellent fuel economy.'),
('Innova Hycross', 'Toyota', 'MPV', 'Petrol', 19.77, 30.98, 23.24, 5.0, 'Automatic', 'Ultra-premium self-charging hybrid MPV featuring luxurious ottoman seats, stellar 23 kmpl efficiency, and legendary Toyota reliability.'),
('Fortuner', 'Toyota', 'SUV', 'Diesel', 33.43, 51.44, 14.40, 5.0, 'Manual/Automatic', 'Rugged, full-size 4x4 SUV with unmatched road presence, bulletproof engine reliability, massive resale value, and heavy off-road capability.'),
('Punch', 'Tata', 'SUV', 'Petrol', 6.13, 10.20, 20.09, 5.0, 'Manual/Automatic', 'Punchy micro-SUV with 5-star GNCAP safety, high driving position, superb ground clearance, and an affordable entry price.'),
('ZS EV', 'MG', 'SUV', 'EV', 18.98, 25.44, 461.00, 5.0, 'Automatic', 'High-end electric SUV with a 50.3 kWh battery, dual-pane panoramic sunroof, 360-degree camera, and exceptional ride quietness.'),
('3 Series Gran Limousine', 'BMW', 'Sedan', 'Petrol', 60.60, 65.00, 13.00, 5.0, 'Automatic', 'Ultimate luxury long-wheelbase sedan, offering sports-car dynamics, unmatched rear legroom, high-end materials, and immense premium status.');
