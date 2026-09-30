export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin'
export type BikeStatus = 'available' | 'rented' | 'maintenance' | 'unavailable'
export type RentalStatus = 'active' | 'completed' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial'
export type PaymentMethod = 'transfer' | 'qris' | 'cash' | 'e-wallet'
export type QueueStatus = 'waiting' | 'notified' | 'assigned' | 'cancelled' | 'expired'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      bike_types: {
        Row: {
          id: string
          name: string
          hourly_rate: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          hourly_rate: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          hourly_rate?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bikes: {
        Row: {
          id: string
          bike_code: string
          bike_type_id: string | null
          status: BikeStatus
          current_location: string | null
          last_maintenance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bike_code: string
          bike_type_id?: string | null
          status?: BikeStatus
          current_location?: string | null
          last_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bike_code?: string
          bike_type_id?: string | null
          status?: BikeStatus
          current_location?: string | null
          last_maintenance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rentals: {
        Row: {
          id: string
          user_id: string
          bike_id: string | null
          start_time: string
          end_time: string
          actual_end_time: string | null
          duration_minutes: number | null
          is_extended: boolean
          extension_count: number
          status: RentalStatus
          total_amount: number
          paid_amount: number
          payment_status: PaymentStatus
          lock_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bike_id?: string | null
          start_time?: string
          end_time: string
          actual_end_time?: string | null
          duration_minutes?: number | null
          is_extended?: boolean
          extension_count?: number
          status?: RentalStatus
          total_amount: number
          paid_amount?: number
          payment_status?: PaymentStatus
          lock_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bike_id?: string | null
          start_time?: string
          end_time?: string
          actual_end_time?: string | null
          duration_minutes?: number | null
          is_extended?: boolean
          extension_count?: number
          status?: RentalStatus
          total_amount?: number
          paid_amount?: number
          payment_status?: PaymentStatus
          lock_version?: number
          created_at?: string
          updated_at?: string
        }
      }
      queue: {
        Row: {
          id: string
          user_id: string
          bike_id: string | null
          bike_type_id: string | null
          position: number | null
          status: QueueStatus
          joined_at: string
          notified_at: string | null
          expires_at: string | null
          assigned_bike_id: string | null
          lock_version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bike_id?: string | null
          bike_type_id?: string | null
          position?: number | null
          status?: QueueStatus
          joined_at?: string
          notified_at?: string | null
          expires_at?: string | null
          assigned_bike_id?: string | null
          lock_version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bike_id?: string | null
          bike_type_id?: string | null
          position?: number | null
          status?: QueueStatus
          joined_at?: string
          notified_at?: string | null
          expires_at?: string | null
          assigned_bike_id?: string | null
          lock_version?: number
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          rental_id: string | null
          user_id: string
          amount: number
          payment_method: PaymentMethod
          payment_status: PaymentStatus
          transaction_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rental_id?: string | null
          user_id: string
          amount: number
          payment_method: PaymentMethod
          payment_status?: PaymentStatus
          transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rental_id?: string | null
          user_id?: string
          amount?: number
          payment_method?: PaymentMethod
          payment_status?: PaymentStatus
          transaction_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      operational_hours: {
        Row: {
          id: string
          day_of_week: number
          open_time: string
          close_time: string
          is_closed: boolean
        }
        Insert: {
          id?: string
          day_of_week: number
          open_time?: string
          close_time?: string
          is_closed?: boolean
        }
        Update: {
          id?: string
          day_of_week?: number
          open_time?: string
          close_time?: string
          is_closed?: boolean
        }
      }
    }
  }
}

// Extended types with relations
export interface BikeWithType {
  id: string
  bike_code: string
  bike_type_id: string | null
  status: 'available' | 'rented' | 'maintenance' | 'unavailable'
  current_location: string | null
  last_maintenance: string | null
  created_at: string
  updated_at: string
  bike_type?: {
    id: string
    name: string
    hourly_rate: number
    description: string | null
    created_at: string
    updated_at: string
  }
}

export interface RentalWithDetails {
  id: string
  user_id: string
  bike_id: string | null
  start_time: string
  end_time: string
  actual_end_time: string | null
  duration_minutes: number | null
  is_extended: boolean
  extension_count: number
  status: 'active' | 'completed' | 'overdue' | 'cancelled'
  total_amount: number
  paid_amount: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'partial'
  lock_version: number
  created_at: string
  updated_at: string
  bike?: BikeWithType
  user?: {
    id: string
    full_name: string | null
    phone: string | null
    role: 'user' | 'admin'
    created_at: string
    updated_at: string
  }
  payments?: Array<{
    id: string
    rental_id: string | null
    user_id: string
    amount: number
    payment_method: 'transfer' | 'qris' | 'cash' | 'e-wallet'
    payment_status: 'pending' | 'paid' | 'refunded' | 'partial'
    transaction_id: string | null
    paid_at: string | null
    created_at: string
    updated_at: string
  }>
}

export interface QueueWithDetails {
  id: string
  user_id: string
  bike_id: string | null
  bike_type_id: string | null
  position: number | null
  status: 'waiting' | 'notified' | 'assigned' | 'cancelled' | 'expired'
  joined_at: string
  notified_at: string | null
  expires_at: string | null
  assigned_bike_id: string | null
  lock_version: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    full_name: string | null
    phone: string | null
    role: 'user' | 'admin'
    created_at: string
    updated_at: string
  }
  bike?: BikeWithType
  bike_type?: {
    id: string
    name: string
    hourly_rate: number
    description: string | null
    created_at: string
    updated_at: string
  }
  assigned_bike?: BikeWithType
}