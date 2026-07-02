import { db, garagesTable, sparePartsTable } from "@workspace/db";

async function seed() {
  console.log("Seeding garages...");
  await db.insert(garagesTable).values([
    { name: "AutoCare Gurgaon", address: "Plot 12, Sector 14, Gurgaon", city: "Gurgaon", state: "Haryana", phone: "9810001111", rating: "4.8", specialties: "Engine, AC, Tyres", openTime: "8:00 AM", closeTime: "8:00 PM" },
    { name: "GoMechanic Service", address: "DLF Phase 2, Gurgaon", city: "Gurgaon", state: "Haryana", phone: "9810002222", rating: "4.5", specialties: "Full Service, Denting, Painting", openTime: "9:00 AM", closeTime: "7:00 PM" },
    { name: "Mahindra First Choice", address: "NH-48, Sector 18, Gurgaon", city: "Gurgaon", state: "Haryana", phone: "9810003333", rating: "4.6", specialties: "All Brands, Wheel Alignment", openTime: "9:00 AM", closeTime: "6:30 PM" },
    { name: "Delhi Auto Works", address: "Connaught Place, New Delhi", city: "Delhi", state: "Delhi", phone: "9810004444", rating: "4.3", specialties: "Electrical, AC, Engine", openTime: "9:00 AM", closeTime: "7:00 PM" },
    { name: "Maruti True Value", address: "Janakpuri, New Delhi", city: "Delhi", state: "Delhi", phone: "9810005555", rating: "4.7", specialties: "Maruti Specialist, General Service", openTime: "8:30 AM", closeTime: "7:30 PM" },
  ]).onConflictDoNothing();

  console.log("Seeding spare parts...");
  await db.insert(sparePartsTable).values([
    { brand: "Maruti Suzuki", carModel: "Swift", category: "Engine", subCategory: "Oil & Filters", name: "Engine Oil Filter - Swift", price: "349", stock: 50 },
    { brand: "Maruti Suzuki", carModel: "Swift", category: "Brakes", subCategory: "Brake Pads", name: "Front Brake Pad Set - Swift", price: "1299", stock: 30 },
    { brand: "Maruti Suzuki", carModel: "Swift", category: "Electrical", subCategory: "Batteries", name: "Amaron Battery 35Ah - Swift", price: "4299", stock: 15 },
    { brand: "Maruti Suzuki", carModel: "Swift", category: "Tyres", subCategory: "Tubeless Tyres", name: "Apollo Alnac 4G 175/65 R15", price: "3899", stock: 20 },
    { brand: "Maruti Suzuki", carModel: "Baleno", category: "Engine", subCategory: "Oil & Filters", name: "Air Filter - Baleno 1.2L", price: "499", stock: 40 },
    { brand: "Maruti Suzuki", carModel: "Baleno", category: "Electrical", subCategory: "Headlights", name: "LED Headlight Bulb H4 - Baleno", price: "899", stock: 25 },
    { brand: "Hyundai", carModel: "i20", category: "Engine", subCategory: "Oil & Filters", name: "Oil Filter - i20 1.2 Petrol", price: "299", stock: 60 },
    { brand: "Hyundai", carModel: "i20", category: "Brakes", subCategory: "Brake Pads", name: "Rear Brake Pad Set - i20", price: "1099", stock: 35 },
    { brand: "Hyundai", carModel: "i20", category: "Suspension", subCategory: "Shock Absorbers", name: "Front Shock Absorber - i20", price: "2499", stock: 12 },
    { brand: "Hyundai", carModel: "Creta", category: "Engine", subCategory: "Oil & Filters", name: "Cabin Air Filter - Creta", price: "699", stock: 30 },
    { brand: "Hyundai", carModel: "Creta", category: "Tyres", subCategory: "Tubeless Tyres", name: "Michelin Energy XM2 215/60 R16", price: "5499", stock: 18 },
    { brand: "Honda", carModel: "City", category: "Engine", subCategory: "Spark Plugs", name: "NGK Iridium Spark Plug - City", price: "799", stock: 45 },
    { brand: "Honda", carModel: "City", category: "Brakes", subCategory: "Brake Discs", name: "Front Brake Disc - City 2023", price: "2999", stock: 10 },
    { brand: "Honda", carModel: "Activa", category: "Engine", subCategory: "Oil & Filters", name: "Engine Oil - Activa 10W30", price: "449", stock: 80 },
    { brand: "Honda", carModel: "Activa", category: "Electrical", subCategory: "Batteries", name: "Exide 12V 3Ah Battery - Activa", price: "899", stock: 40 },
    { brand: "Tata", carModel: "Nexon", category: "Engine", subCategory: "Oil & Filters", name: "Oil Filter - Nexon EV", price: "399", stock: 25 },
    { brand: "Tata", carModel: "Nexon", category: "Suspension", subCategory: "Shock Absorbers", name: "Rear Shock Absorber - Nexon", price: "3299", stock: 8 },
    { brand: "Tata", carModel: "Punch", category: "Brakes", subCategory: "Brake Pads", name: "Front Brake Pad - Tata Punch", price: "1199", stock: 22 },
    { brand: "Mahindra", carModel: "Scorpio", category: "Engine", subCategory: "Oil & Filters", name: "Fuel Filter - Scorpio Diesel", price: "649", stock: 30 },
    { brand: "Mahindra", carModel: "Scorpio", category: "Suspension", subCategory: "Shock Absorbers", name: "Front Shock Absorber - Scorpio", price: "4999", stock: 6 },
  ]).onConflictDoNothing();

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
