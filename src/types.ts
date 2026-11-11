export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'member';
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  category: string;
  description: string;
  capacity: number;
  area: string;
  amenities: string[];
  price: number; // 0 for free reservation
  imageUrl: string;
  status: 'available' | 'maintenance' | 'offline';
  availableTimeSlots: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  timeSlot: string;
  attendeesCount: number;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotAvailability {
  slot: string;
  available: boolean;
}

export interface AdminStats {
  totalRooms: number;
  activeRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  todayBookings: number;
  totalMembers: number;
  roomBookingCounts: Record<string, number>;
}

export interface SchemaDocs {
  title: string;
  description: string;
  sqliteDDL: string;
  mongoSchema: string;
  deploymentGuide: string;
}
