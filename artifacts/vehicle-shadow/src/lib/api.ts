const BASE = "/api";

function token() {
  return localStorage.getItem("vs_token") ?? "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token()}` };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

/* ── Auth ── */
export const api = {
  auth: {
    signup: (name: string, email: string, password: string, phone?: string) =>
      request<{ token: string; user: User }>("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      }),

    login: (email: string, password: string) =>
      request<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),

    forgotPassword: (email: string) =>
      request<{ message: string; otp: string }>("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),

    verifyOtp: (email: string, otp: string) =>
      request<{ message: string }>("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      }),

    resetPassword: (email: string, otp: string, newPassword: string) =>
      request<{ message: string }>("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      }),
  },

  user: {
    profile: () => request<User>("/user/profile", { headers: authHeaders() }),
    update: (name: string, phone?: string) =>
      request<User>("/user/profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ name, phone }),
      }),
  },

  licences: {
    list: () => request<Licence[]>("/licences", { headers: authHeaders() }),
    add: (data: LicenceInput) =>
      request<Licence>("/licences", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<LicenceInput>) =>
      request<Licence>(`/licences/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/licences/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
  },

  vehicles: {
    list: () => request<Vehicle[]>("/vehicles", { headers: authHeaders() }),
    add: (data: VehicleInput) =>
      request<Vehicle>("/vehicles", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<VehicleInput>) =>
      request<Vehicle>(`/vehicles/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/vehicles/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
  },

  parts: {
    list: (filters?: { brand?: string; carModel?: string; category?: string; subCategory?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (filters?.brand) params.set("brand", filters.brand);
      if (filters?.carModel) params.set("carModel", filters.carModel);
      if (filters?.category) params.set("category", filters.category);
      if (filters?.subCategory) params.set("subCategory", filters.subCategory);
      if (filters?.search) params.set("search", filters.search);
      return request<Part[]>(`/parts${params.toString() ? "?" + params : ""}`, {
        headers: { "Content-Type": "application/json" },
      });
    },
  },

  cart: {
    list: () => request<CartItem[]>("/cart", { headers: authHeaders() }),
    add: (partId: number, quantity?: number) =>
      request<CartItem>("/cart", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ partId, quantity }),
      }),
    remove: (id: number) =>
      request<{ message: string }>(`/cart/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      }),
  },

  garages: {
    list: (city?: string, state?: string) => {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (state) params.set("state", state);
      return request<Garage[]>(`/garages${params.toString() ? "?" + params : ""}`);
    },
  },

  bookings: {
    list: () => request<Booking[]>("/bookings", { headers: authHeaders() }),
    add: (data: BookingInput) =>
      request<Booking>("/bookings", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
  },

  gps: {
    vehicles: () => request<GpsVehicle[]>("/gps/vehicles", { headers: authHeaders() }),
    addVehicle: (data: Partial<GpsVehicle>) =>
      request<GpsVehicle>("/gps/vehicles", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    trips: (vehicleId: number) => request<GpsTrip[]>(`/gps/trips/${vehicleId}`, { headers: authHeaders() }),
    alerts: (vehicleId: number) => request<GpsAlert[]>(`/gps/alerts/${vehicleId}`, { headers: authHeaders() }),
    geofences: (vehicleId: number) => request<Geofence[]>(`/gps/geofences/${vehicleId}`, { headers: authHeaders() }),
    addGeofence: (data: Partial<Geofence>) =>
      request<Geofence>("/gps/geofences", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
      }),
    toggleGeofence: (id: number) =>
      request<Geofence>(`/gps/geofences/${id}/toggle`, { method: "PATCH", headers: authHeaders() }),
    command: (vehicleId: number, command: "immobilize" | "mobilize") =>
      request<{ message: string; immobilized: boolean }>(`/gps/command/${vehicleId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ command }),
      }),
  },
};

/* ── Types ── */
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  createdAt?: string;
}

export interface Licence {
  id: number;
  userId: number;
  licenceNumber: string;
  type: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  state: string;
  status: string;
  createdAt: string;
}

export interface LicenceInput {
  licenceNumber: string;
  type: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  state: string;
  status?: string;
}

export interface Vehicle {
  id: number;
  userId: number;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  insuranceExpiry?: string | null;
  pucExpiry?: string | null;
  status: string;
  createdAt: string;
}

export interface VehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType?: string;
  insuranceExpiry?: string;
  pucExpiry?: string;
  status?: string;
}

export interface Part {
  id: number;
  brand: string;
  carModel: string;
  category: string;
  subCategory: string;
  name: string;
  price: string;
  stock: number;
  imageUrl?: string | null;
}

export interface CartItem {
  id: number;
  partId: number;
  quantity: number;
  name: string;
  price: string;
  brand: string;
  category: string;
  imageUrl?: string | null;
}

export interface Garage {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: string;
  specialties: string;
  openTime: string;
  closeTime: string;
}

export interface BookingInput {
  vehicleId?: number;
  serviceType: string;
  bookingDate: string;
  timeSlot: string;
  garageName?: string;
  notes?: string;
}

export interface Booking {
  id: number;
  userId: number;
  vehicleId?: number | null;
  serviceType: string;
  bookingDate: string;
  timeSlot: string;
  garageName?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
}

export interface GpsVehicle {
  id: number;
  userId: number;
  vehicleId: number;
  name: string;
  number: string;
  status: string;
  speed: number;
  signal: number;
  battery: number;
  address?: string | null;
  lat?: string | null;
  lng?: string | null;
  immobilized: boolean;
  lastUpdated?: string | null;
}

export interface GpsTrip {
  id: number;
  gpsVehicleId: number;
  fromAddress: string;
  toAddress: string;
  startTime: string;
  endTime: string;
  distanceKm: string;
  topSpeedKmph: number;
  idleMinutes: number;
  date: string;
}

export interface GpsAlert {
  id: number;
  gpsVehicleId: number;
  type: string;
  detail: string;
  severity: string;
  vehicleNumber: string;
  createdAt: string;
}

export interface Geofence {
  id: number;
  gpsVehicleId: number;
  name: string;
  radiusM: number;
  zoneType: string;
  status: string;
  lat?: string | null;
  lng?: string | null;
  lastAlert?: string | null;
}
