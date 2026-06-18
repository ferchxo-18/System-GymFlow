
import { Client, MembershipStatus, Measurement, Payment, PaymentMethod, Staff, AttendanceRecord, Product, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123',
    fullName: 'Administrador Principal',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/admin/100/100'
  },
  {
    id: 'u2',
    username: 'recepcion',
    password: '123',
    fullName: 'Maria Recepción',
    role: 'staff',
    avatarUrl: 'https://picsum.photos/seed/staff/100/100'
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    fullName: 'Carlos Rodriguez',
    dni: '12345678',
    phone: '999888777',
    email: 'carlos@example.com',
    joinDate: '2023-01-15',
    membershipType: 'Plan Trimestral',
    membershipExpiry: '2024-06-15',
    status: MembershipStatus.ACTIVE,
    avatarUrl: 'https://picsum.photos/seed/c1/100/100'
  },
  {
    id: 'c2',
    fullName: 'Ana Morales',
    dni: '87654321',
    phone: '999111222',
    email: 'ana@example.com',
    joinDate: '2023-05-10',
    membershipType: 'Plan Mensual',
    membershipExpiry: '2023-10-20',
    status: MembershipStatus.EXPIRED,
    avatarUrl: 'https://picsum.photos/seed/c2/100/100'
  },
  {
    id: 'c3',
    fullName: 'Luis Fernandez',
    dni: '45678912',
    phone: '987654321',
    email: 'luis@example.com',
    joinDate: '2023-11-01',
    membershipType: 'Plan Anual',
    membershipExpiry: '2024-11-01',
    status: MembershipStatus.ACTIVE,
    avatarUrl: 'https://picsum.photos/seed/c3/100/100'
  }
];

export const MOCK_MEASUREMENTS: Measurement[] = [
  { id: 'm1', clientId: 'c1', date: '2024-01-15', weight: 85, height: 175, imc: 27.7, waist: 95, chest: 105, arms: 38 },
  { id: 'm2', clientId: 'c1', date: '2024-02-15', weight: 83, height: 175, imc: 27.1, waist: 93, chest: 106, arms: 38.5 },
  { id: 'm3', clientId: 'c1', date: '2024-03-15', weight: 81, height: 175, imc: 26.4, waist: 90, chest: 107, arms: 39 },
  { id: 'm4', clientId: 'c1', date: '2024-04-15', weight: 80, height: 175, imc: 26.1, waist: 88, chest: 108, arms: 39.5 },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', clientId: 'c1', clientName: 'Carlos Rodriguez', amount: 300, date: '2024-01-15', method: PaymentMethod.CARD, concept: 'Plan Trimestral', status: 'Paid' },
  { id: 'p2', clientId: 'c2', clientName: 'Ana Morales', amount: 120, date: '2024-02-01', method: PaymentMethod.YAPE, concept: 'Plan Mensual', status: 'Paid' },
  { id: 'p3', clientId: 'c3', clientName: 'Luis Fernandez', amount: 1000, date: '2024-03-05', method: PaymentMethod.TRANSFER, concept: 'Plan Anual', status: 'Paid' },
  { id: 'p4', clientId: 'c1', clientName: 'Carlos Rodriguez', amount: 50, date: '2024-04-02', method: PaymentMethod.CASH, concept: 'Proteína Whey', status: 'Paid' },
];

export const MOCK_STAFF: Staff[] = [
  { id: 's1', fullName: 'Jorge Entrenador', role: 'Entrenador', status: 'Active', phone: '900111222', email: 'jorge@gym.com', hiredDate: '2022-05-01', shiftStart: '06:00', shiftEnd: '14:00' },
  { id: 's2', fullName: 'Maria Recepción', role: 'Recepción', status: 'Active', phone: '900333444', email: 'maria@gym.com', hiredDate: '2023-01-10', shiftStart: '08:00', shiftEnd: '17:00' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', staffId: 's1', date: '2024-05-20', checkIn: '06:00', checkOut: '14:00', hoursWorked: 8 },
  { id: 'a2', staffId: 's2', date: '2024-05-20', checkIn: '08:05', checkOut: '17:00', hoursWorked: 8.9 },
  { id: 'a3', staffId: 's1', date: '2024-05-21', checkIn: '06:10', checkOut: '14:30', hoursWorked: 8.3 },
];

export const MOCK_INVENTORY: Product[] = [
  { id: 'pr1', code: 'SUP001', name: 'Whey Protein 1kg', category: 'Suplemento', stock: 5, minStock: 10, price: 180, lastRestock: '2024-04-01' },
  { id: 'pr2', code: 'BEB002', name: 'Agua Mineral 500ml', category: 'Bebida', stock: 45, minStock: 20, price: 2.5, lastRestock: '2024-05-15' },
  { id: 'pr3', code: 'ACC003', name: 'Toalla Microfibra', category: 'Accesorio', stock: 12, minStock: 5, price: 35, lastRestock: '2024-02-20' },
  { id: 'pr4', code: 'BEB003', name: 'Gatorade', category: 'Bebida', stock: 8, minStock: 15, price: 5.0, lastRestock: '2024-05-10' },
];