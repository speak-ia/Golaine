export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Schéma public (référence + aide à la lecture du code).
 * Les clients Supabase utilisent pour l’instant `SupabaseClient` non générique
 * (le typage strict `GenericTable` exige notamment `Relationships` correctement remplies).
 * Générer les types officiels : `npx supabase gen types typescript --project-id <ref>`.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          plan_tier: string;
          messages_used_month: number;
          messages_limit_month: number;
          image_analyses_used_month: number;
          image_analyses_limit_month: number;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          plan_tier?: string;
          messages_used_month?: number;
          messages_limit_month?: number;
          image_analyses_used_month?: number;
          image_analyses_limit_month?: number;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          plan_tier?: string;
          messages_used_month?: number;
          messages_limit_month?: number;
          image_analyses_used_month?: number;
          image_analyses_limit_month?: number;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          phone: string;
          email: string;
          segment: string;
          city: string;
          notes: string;
          orders_count: number;
          total_spent: number;
          last_order_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          phone?: string;
          email?: string;
          segment?: string;
          city?: string;
          notes?: string;
          orders_count?: number;
          total_spent?: number;
          last_order_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          email?: string;
          segment?: string;
          city?: string;
          notes?: string;
          orders_count?: number;
          total_spent?: number;
          last_order_at?: string | null;
        };
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          contact_id: number | null;
          client: string;
          client_sub: string;
          produit: string;
          adresse: string;
          montant: number;
          status: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          contact_id?: number | null;
          client: string;
          client_sub?: string;
          produit: string;
          adresse?: string;
          montant?: number;
          status: string;
          created_at?: string;
        };
        Update: {
          contact_id?: number | null;
          client?: string;
          client_sub?: string;
          produit?: string;
          adresse?: string;
          montant?: number;
          status?: string;
        };
      };
      appointments: {
        Row: {
          id: number;
          user_id: string;
          title: string;
          client: string;
          appointment_date: string;
          appointment_time: string;
          duration_minutes: number;
          type: string;
          status: string;
          notes: string;
          location: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          client: string;
          appointment_date: string;
          appointment_time: string;
          duration_minutes?: number;
          type: string;
          status: string;
          notes?: string;
          location?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          client?: string;
          appointment_date?: string;
          appointment_time?: string;
          duration_minutes?: number;
          type?: string;
          status?: string;
          notes?: string;
          location?: string;
        };
      };
      products: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          price: number;
          category: string;
          stock: number;
          image: string;
          status: string;
          assigned_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          price?: number;
          category?: string;
          stock?: number;
          image?: string;
          status?: string;
          assigned_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          price?: number;
          category?: string;
          stock?: number;
          image?: string;
          status?: string;
          assigned_agent?: string | null;
          updated_at?: string;
        };
      };
      conversation_threads: {
        Row: {
          id: number;
          user_id: string;
          contact_name: string;
          contact_phone: string;
          last_message: string;
          last_message_at: string | null;
          unread_count: number;
          status: string;
          avatar_initials: string;
          gradient_key: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          contact_name?: string;
          contact_phone?: string;
          last_message?: string;
          last_message_at?: string | null;
          unread_count?: number;
          status?: string;
          avatar_initials?: string;
          gradient_key?: string;
          created_at?: string;
        };
        Update: {
          contact_name?: string;
          contact_phone?: string;
          last_message?: string;
          last_message_at?: string | null;
          unread_count?: number;
          status?: string;
          avatar_initials?: string;
          gradient_key?: string;
        };
      };
      conversation_messages: {
        Row: {
          id: number;
          thread_id: number;
          sender: string;
          body: string;
          sent_at: string;
        };
        Insert: {
          thread_id: number;
          sender: string;
          body: string;
          sent_at?: string;
        };
        Update: {
          body?: string;
          sent_at?: string;
        };
      };
      activity_events: {
        Row: {
          id: number;
          user_id: string;
          activity_type: string;
          body: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          activity_type: string;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
};
