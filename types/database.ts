export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organisations"]["Insert"]>;
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          organisation_id: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string;
          mobile: string | null;
          status: "active" | "suspended" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          organisation_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          mobile?: string | null;
          status?: "active" | "suspended" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          organisation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          organisation_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Insert"]>;
        Relationships: [];
      };
      membership_types: {
        Row: {
          id: string;
          organisation_id: string;
          name: string;
          code: string;
          description: string | null;
          billing_cycle: "once_off" | "monthly" | "annual" | null;
          price: number | null;
          status: "active" | "inactive" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organisation_id: string;
          name: string;
          code: string;
          description?: string | null;
          billing_cycle?: "once_off" | "monthly" | "annual" | null;
          price?: number | null;
          status?: "active" | "inactive" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["membership_types"]["Insert"]
        >;
        Relationships: [];
      };
      membership_applications: {
        Row: {
          id: string;
          organisation_id: string;
          membership_type_id: string;
          first_name: string;
          last_name: string;
          email: string;
          mobile: string | null;
          application_data: Json;
          status: "pending" | "approved" | "rejected" | "cancelled";
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organisation_id: string;
          membership_type_id: string;
          first_name: string;
          last_name: string;
          email: string;
          mobile?: string | null;
          application_data?: Json;
          status?: "pending" | "approved" | "rejected" | "cancelled";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["membership_applications"]["Insert"]
        >;
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          organisation_id: string;
          user_id: string | null;
          membership_type_id: string;
          membership_application_id: string | null;
          member_number: string;
          status: "pending" | "active" | "suspended" | "expired" | "cancelled";
          joined_at: string | null;
          approved_at: string | null;
          expires_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organisation_id: string;
          user_id?: string | null;
          membership_type_id: string;
          membership_application_id?: string | null;
          member_number: string;
          status?: "pending" | "active" | "suspended" | "expired" | "cancelled";
          joined_at?: string | null;
          approved_at?: string | null;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
        Relationships: [];
      };
      membership_periods: {
        Row: {
          id: string;
          organisation_id: string;
          member_id: string;
          starts_at: string;
          ends_at: string;
          status: "pending" | "active" | "expired" | "cancelled";
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organisation_id: string;
          member_id: string;
          starts_at: string;
          ends_at: string;
          status?: "pending" | "active" | "expired" | "cancelled";
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["membership_periods"]["Insert"]
        >;
        Relationships: [];
      };
      membership_cards: {
        Row: {
          id: string;
          organisation_id: string;
          member_id: string;
          qr_token: string;
          card_status: "active" | "revoked" | "expired";
          issued_at: string;
          regenerated_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organisation_id: string;
          member_id: string;
          qr_token: string;
          card_status?: "active" | "revoked" | "expired";
          issued_at?: string;
          regenerated_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["membership_cards"]["Insert"]
        >;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organisation_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organisation_id?: string | null;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_app_user_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      current_app_user_organisation_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      current_user_has_any_role: {
        Args: { role_names: string[] };
        Returns: boolean;
      };
      current_user_can_manage_memberships: {
        Args: { target_organisation_id: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
