
export enum MembershipStatus {
  ACTIVE = 'Activo',
  INACTIVE = 'Inactivo',
  PENDING = 'Pendiente',
  EXPIRED = 'Vencido'
}

export enum PaymentMethod {
  CASH = 'Efectivo',
  CARD = 'Tarjeta',
  YAPE = 'Yape/Plin',
  TRANSFER = 'Transferencia'
}

export interface Client {
  id: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string;
  joinDate: string;
  membershipType: string;
  membershipExpiry: string;
  status: MembershipStatus;
  avatarUrl: string;
}

export interface Measurement {
  id: string;
  clientId: string;
  date: string;
  weight: number;
  height: number;
  imc: number;
  waist: number;
  chest: number;
  arms: number;
  notes?: string;
}

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  concept: string; // e.g., "Mensualidad", "Proteína"
  status: 'Paid' | 'Pending';
}

export interface Staff {
  id: string;
  fullName: string;
  role: 'Entrenador' | 'Recepción' | 'Limpieza' | 'Admin';
  status: 'Active' | 'Inactive';
  phone: string;
  email: string;
  hiredDate: string;
  shiftStart: string; // HH:MM format (24h)
  shiftEnd: string;   // HH:MM format (24h)
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked?: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Suplemento' | 'Bebida' | 'Accesorio' | 'Máquina';
  stock: number;
  minStock: number;
  price: number;
  lastRestock: string;
}

// User Management Types
export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

// Additional types for components
export interface Member {
  id: string;
  fullName: string;
  email: string;
  joinDate: string;
  expirationDate: string;
  status: MembershipStatus;
  planType: 'Basic' | 'Premium' | 'VIP';
}

export interface BodyMeasurement {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bodyFatPercentage: number;
  muscleMassKg: number;
}

export interface AIAnalysisResult {
  trend: 'positive' | 'negative' | 'neutral';
  summary: string;
  advice: string;
}

export interface StaffLog {
  id: string;
  staffName: string;
  action: 'ENTRY' | 'EXIT';
  timestamp: string;
}