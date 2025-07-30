export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export type OrderStatus = 'pending' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'promptpay' | 'cash' | 'card';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'merchant' | 'customer';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

export interface SalesData {
  date: string;
  totalSales: number;
  orderCount: number;
  averageOrderValue: number;
}