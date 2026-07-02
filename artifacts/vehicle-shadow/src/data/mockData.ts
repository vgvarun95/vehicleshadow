export type LicenceRow = {
  id: number;
  dlNumber: string;
  name: string;
  dob: string;
  issueDate: string;
  expiry: string;
  status: "valid" | "expired" | "expiring";
  vehicleClass: string;
  address: string;
};

export type Challan = {
  id: string;
  type: string;
  amount: string;
  date: string;
  location: string;
  status: string;
};

export type VehicleRow = {
  id: number;
  name: string;
  number: string;
  color: string;
  year: number;
  owner: string;
  rto: string;
  fuelType: string;
  age: string;
  status: "Active" | "Inactive";
  fitness: { status: string; expiry: string; registrationNo: string };
  insurance: { status: string; expiry: string; policyNo: string };
  puc: { status: string; expiry: string; certNo: string };
  challans: Challan[];
};

export const LICENCES: LicenceRow[] = [
  { id: 1, dlNumber: "DL-0420110149646", name: "Rahul Sharma", dob: "15 Aug 1992", issueDate: "10 Jan 2011", expiry: "14 Aug 2030", status: "valid", vehicleClass: "LMV / MCWG", address: "Sector 14, Gurgaon, Haryana" },
  { id: 2, dlNumber: "DL-0219980034521", name: "Rahul Sharma", dob: "15 Aug 1992", issueDate: "05 Mar 1998", expiry: "14 Aug 2023", status: "expired", vehicleClass: "MCWG", address: "Sector 14, Gurgaon, Haryana" },
  { id: 3, dlNumber: "DL-0920150987654", name: "Amit Patel", dob: "22 Oct 1985", issueDate: "12 Sep 2015", expiry: "30 Jun 2026", status: "expiring", vehicleClass: "LMV", address: "Paldi, Ahmedabad, Gujarat" },
  { id: 4, dlNumber: "DL-1420181234567", name: "Vikram Singh", dob: "05 Jan 1995", issueDate: "20 May 2018", expiry: "19 May 2038", status: "valid", vehicleClass: "LMV / MCWG", address: "Vaishali Nagar, Jaipur, Rajasthan" },
  { id: 5, dlNumber: "DL-0320050543210", name: "Priya Nair", dob: "14 Feb 1980", issueDate: "18 Feb 2005", expiry: "17 Feb 2025", status: "expired", vehicleClass: "LMV", address: "Kalyan Nagar, Bangalore, Karnataka" },
  { id: 6, dlNumber: "DL-1220190876543", name: "Rajesh Kumar", dob: "30 Jul 1988", issueDate: "15 Aug 2019", expiry: "14 Aug 2039", status: "valid", vehicleClass: "LMV / MCWG", address: "Salt Lake, Kolkata, West Bengal" },
  { id: 7, dlNumber: "DL-1120120011223", name: "Sunita Devi", dob: "12 Dec 1975", issueDate: "15 Jan 2012", expiry: "14 Jul 2026", status: "expiring", vehicleClass: "LMV", address: "Gomti Nagar, Lucknow, Uttar Pradesh" },
  { id: 8, dlNumber: "DL-1320080055443", name: "Anjali Gupta", dob: "09 Sep 1990", issueDate: "10 Oct 2008", expiry: "09 Oct 2023", status: "expired", vehicleClass: "MCWG", address: "Andheri West, Mumbai, Maharashtra" },
];

export const VEHICLES: VehicleRow[] = [
  {
    id: 1, name: "Maruti Swift ZXI", number: "DL 01 AB 1234", color: "Silver", year: 2021, owner: "Rahul Sharma", rto: "Delhi (DL)", fuelType: "Petrol", age: "4 years", status: "Active",
    fitness: { status: "valid", expiry: "Dec 2027", registrationNo: "DL-01-2021-1234" },
    insurance: { status: "valid", expiry: "Mar 2027", policyNo: "ACK-2024-789456" },
    puc: { status: "expiring", expiry: "Jul 2026", certNo: "PUC-DL-2024-9876" },
    challans: [
      { id: "CH001", type: "Speeding", amount: "₹1,000", date: "12 Feb 2026", location: "NH-48, Delhi", status: "pending" },
      { id: "CH002", type: "Signal Jump", amount: "₹2,000", date: "03 Mar 2026", location: "CP, Delhi", status: "pending" },
    ],
  },
  {
    id: 2, name: "Honda Activa 6G", number: "DL 05 XY 5678", color: "Blue", year: 2022, owner: "Rahul Sharma", rto: "Delhi (DL)", fuelType: "Petrol", age: "3 years", status: "Active",
    fitness: { status: "valid", expiry: "Jun 2030", registrationNo: "DL-05-2022-5678" },
    insurance: { status: "expiring", expiry: "Jul 2026", policyNo: "HDFC-2024-321654" },
    puc: { status: "valid", expiry: "Nov 2026", certNo: "PUC-DL-2024-5432" },
    challans: [],
  },
  {
    id: 3, name: "Toyota Fortuner", number: "HR 26 CK 9999", color: "White", year: 2019, owner: "Amit Patel", rto: "Gurgaon (HR)", fuelType: "Diesel", age: "7 years", status: "Active",
    fitness: { status: "valid", expiry: "Oct 2029", registrationNo: "HR-26-2019-9999" },
    insurance: { status: "valid", expiry: "Dec 2026", policyNo: "ICICI-998877" },
    puc: { status: "expired", expiry: "Apr 2026", certNo: "PUC-HR-2025-0012" },
    challans: [],
  },
  {
    id: 4, name: "Hyundai i20 Asta", number: "DL 03 CC 4321", color: "Red", year: 2023, owner: "Vikram Singh", rto: "Delhi (DL)", fuelType: "Petrol", age: "3 years", status: "Active",
    fitness: { status: "valid", expiry: "Aug 2038", registrationNo: "DL-03-2023-4321" },
    insurance: { status: "valid", expiry: "Aug 2027", policyNo: "NIA-2023-112233" },
    puc: { status: "valid", expiry: "Jan 2027", certNo: "PUC-DL-2026-7788" },
    challans: [],
  },
  {
    id: 5, name: "Tata Nexon EV", number: "MH 12 NE 2022", color: "Teal", year: 2022, owner: "Priya Nair", rto: "Pune (MH)", fuelType: "Electric", age: "4 years", status: "Active",
    fitness: { status: "valid", expiry: "Mar 2037", registrationNo: "MH-12-2022-0202" },
    insurance: { status: "expired", expiry: "May 2026", policyNo: "SBI-EL-2022-77" },
    puc: { status: "valid", expiry: "Dec 2028", certNo: "PUC-MH-EXEMPT" },
    challans: [
      { id: "CH003", type: "Wrong Parking", amount: "₹500", date: "15 Apr 2026", location: "FC Road, Pune", status: "pending" },
    ],
  },
  {
    id: 6, name: "Mahindra Thar", number: "HR 20 TH 4x4", color: "Black", year: 2010, owner: "Rajesh Kumar", rto: "Hisar (HR)", fuelType: "Diesel", age: "16 years", status: "Active",
    fitness: { status: "expired", expiry: "May 2025", registrationNo: "HR-20-2010-0044" },
    insurance: { status: "valid", expiry: "Sep 2026", policyNo: "TATA-998811" },
    puc: { status: "valid", expiry: "Oct 2026", certNo: "PUC-HR-2026-99" },
    challans: [
      { id: "CH004", type: "No Seatbelt", amount: "₹1,000", date: "10 Jan 2026", location: "Hisar Main Rd", status: "pending" },
      { id: "CH005", type: "Over Speeding", amount: "₹2,000", date: "22 Feb 2026", location: "NH-9, HR", status: "pending" },
      { id: "CH006", type: "Dangerous Driving", amount: "₹5,000", date: "14 Mar 2026", location: "Bypass Road", status: "pending" },
    ],
  },
  {
    id: 7, name: "Royal Enfield Classic", number: "UP 16 RE 8888", color: "Grey", year: 2020, owner: "Sunita Devi", rto: "Noida (UP)", fuelType: "Petrol", age: "6 years", status: "Active",
    fitness: { status: "valid", expiry: "Jul 2035", registrationNo: "UP-16-2020-8888" },
    insurance: { status: "expired", expiry: "Jan 2026", policyNo: "RE-INS-2020" },
    puc: { status: "expiring", expiry: "Jun 2026", certNo: "PUC-UP-8888" },
    challans: [],
  },
  {
    id: 8, name: "BMW 3 Series", number: "MH 02 BM 3333", color: "White", year: 2018, owner: "Anjali Gupta", rto: "Mumbai (MH)", fuelType: "Petrol", age: "8 years", status: "Active",
    fitness: { status: "valid", expiry: "May 2033", registrationNo: "MH-02-2018-3333" },
    insurance: { status: "valid", expiry: "Dec 2026", policyNo: "HDFC-ERGO-333" },
    puc: { status: "valid", expiry: "Aug 2026", certNo: "PUC-MH-2026-33" },
    challans: [
      { id: "CH007", type: "Tinted Glass", amount: "₹1,500", date: "05 May 2026", location: "Bandra, Mumbai", status: "pending" },
      { id: "CH008", type: "Fancy Plate", amount: "₹1,000", date: "20 May 2026", location: "Juhu, Mumbai", status: "pending" },
    ],
  },
];
