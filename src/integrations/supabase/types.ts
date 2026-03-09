export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deleted_shop_names: {
        Row: {
          cooldown_until: string | null
          deleted_at: string | null
          id: string
          shop_name: string
          user_id: string
        }
        Insert: {
          cooldown_until?: string | null
          deleted_at?: string | null
          id?: string
          shop_name: string
          user_id: string
        }
        Update: {
          cooldown_until?: string | null
          deleted_at?: string | null
          id?: string
          shop_name?: string
          user_id?: string
        }
        Relationships: []
      }
      depenses: {
        Row: {
          categorie: string
          created_at: string
          date_depense: string
          description: string
          id: string
          montant: number
          user_id: string
        }
        Insert: {
          categorie?: string
          created_at?: string
          date_depense?: string
          description: string
          id?: string
          montant?: number
          user_id: string
        }
        Update: {
          categorie?: string
          created_at?: string
          date_depense?: string
          description?: string
          id?: string
          montant?: number
          user_id?: string
        }
        Relationships: []
      }
      dettes: {
        Row: {
          created_at: string
          date_echeance: string | null
          description: string | null
          id: string
          montant_du: number
          nom_client: string
          payee: boolean
          telephone_client: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_echeance?: string | null
          description?: string | null
          id?: string
          montant_du?: number
          nom_client: string
          payee?: boolean
          telephone_client?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_echeance?: string | null
          description?: string | null
          id?: string
          montant_du?: number
          nom_client?: string
          payee?: boolean
          telephone_client?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventaire_items: {
        Row: {
          created_at: string
          ecart: number | null
          id: string
          inventaire_id: string
          produit_id: string
          stock_physique: number
          stock_theorique: number
        }
        Insert: {
          created_at?: string
          ecart?: number | null
          id?: string
          inventaire_id: string
          produit_id: string
          stock_physique: number
          stock_theorique: number
        }
        Update: {
          created_at?: string
          ecart?: number | null
          id?: string
          inventaire_id?: string
          produit_id?: string
          stock_physique?: number
          stock_theorique?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventaire_items_inventaire_id_fkey"
            columns: ["inventaire_id"]
            isOneToOne: false
            referencedRelation: "inventaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventaire_items_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      inventaires: {
        Row: {
          created_at: string
          id: string
          manager_id: string
          notes: string | null
          owner_id: string
          shop_id: string
          statut: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id: string
          notes?: string | null
          owner_id: string
          shop_id: string
          statut?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string
          notes?: string | null
          owner_id?: string
          shop_id?: string
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventaires_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      produits: {
        Row: {
          categorie: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          nom: string
          prix_achat: number
          prix_vente: number
          stock_actuel: number
          updated_at: string
          user_id: string
        }
        Insert: {
          categorie?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          nom: string
          prix_achat?: number
          prix_vente?: number
          stock_actuel?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          categorie?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          nom?: string
          prix_achat?: number
          prix_vente?: number
          stock_actuel?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_fin_essai: string | null
          email: string | null
          full_name: string | null
          has_used_trial: boolean
          id: string
          must_change_password: boolean
          nom_boutique: string | null
          phone: string | null
          store_name: string | null
          subscription_end_date: string | null
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_fin_essai?: string | null
          email?: string | null
          full_name?: string | null
          has_used_trial?: boolean
          id?: string
          must_change_password?: boolean
          nom_boutique?: string | null
          phone?: string | null
          store_name?: string | null
          subscription_end_date?: string | null
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_fin_essai?: string | null
          email?: string | null
          full_name?: string | null
          has_used_trial?: boolean
          id?: string
          must_change_password?: boolean
          nom_boutique?: string | null
          phone?: string | null
          store_name?: string | null
          subscription_end_date?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_managers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          manager_email: string
          manager_id: string
          manager_name: string
          manager_whatsapp: string
          owner_id: string
          shop_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          manager_email?: string
          manager_id: string
          manager_name: string
          manager_whatsapp?: string
          owner_id: string
          shop_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          manager_email?: string
          manager_id?: string
          manager_name?: string
          manager_whatsapp?: string
          owner_id?: string
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_managers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          created_at: string
          date_fin_essai: string | null
          est_en_essai: boolean | null
          id: string
          localisation: string
          logo_url: string | null
          nom: string
          subscription_status: string | null
          type_commerce: string
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          date_fin_essai?: string | null
          est_en_essai?: boolean | null
          id?: string
          localisation?: string
          logo_url?: string | null
          nom: string
          subscription_status?: string | null
          type_commerce?: string
          updated_at?: string
          user_id: string
          whatsapp?: string
        }
        Update: {
          created_at?: string
          date_fin_essai?: string | null
          est_en_essai?: boolean | null
          id?: string
          localisation?: string
          logo_url?: string | null
          nom?: string
          subscription_status?: string | null
          type_commerce?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          manager_id: string
          owner_id: string
          produit_id: string
          quantite: number
          shop_id: string
          transfer_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id: string
          owner_id: string
          produit_id: string
          quantite: number
          shop_id: string
          transfer_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string
          owner_id?: string
          produit_id?: string
          quantite?: number
          shop_id?: string
          transfer_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          manager_id: string
          nouveau_prix_achat: number | null
          owner_id: string
          produit_id: string
          quantite: number
          rejection_reason: string | null
          shop_id: string
          source: string
          statut: string
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          manager_id: string
          nouveau_prix_achat?: number | null
          owner_id: string
          produit_id: string
          quantite: number
          rejection_reason?: string | null
          shop_id: string
          source?: string
          statut?: string
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          manager_id?: string
          nouveau_prix_achat?: number | null
          owner_id?: string
          produit_id?: string
          quantite?: number
          rejection_reason?: string | null
          shop_id?: string
          source?: string
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ventes: {
        Row: {
          created_at: string
          date_vente: string
          est_credit: boolean
          id: string
          mode_paiement: string
          montant_total: number
          nom_client: string | null
          nom_produit: string | null
          produit_id: string | null
          quantite: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date_vente?: string
          est_credit?: boolean
          id?: string
          mode_paiement?: string
          montant_total?: number
          nom_client?: string | null
          nom_produit?: string | null
          produit_id?: string | null
          quantite?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date_vente?: string
          est_credit?: boolean
          id?: string
          mode_paiement?: string
          montant_total?: number
          nom_client?: string | null
          nom_produit?: string | null
          produit_id?: string | null
          quantite?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventes_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_stock_transfer: {
        Args: { transfer_id: string }
        Returns: undefined
      }
      create_product_for_manager: {
        Args: {
          _manager_id: string
          _nom: string
          _prix_achat: number
          _prix_vente: number
          _shop_id: string
          _stock_initial?: number
        }
        Returns: string
      }
      get_owner_subscription_status: {
        Args: never
        Returns: {
          days_left: number
          is_expired: boolean
          subscription_status: string
        }[]
      }
      has_admin_role: { Args: { _user_id: string }; Returns: boolean }
      owner_has_active_subscription: { Args: never; Returns: boolean }
      reject_stock_transfer: {
        Args: { reason: string; transfer_id: string }
        Returns: undefined
      }
      shop_has_active_subscription: {
        Args: { _shop_id: string }
        Returns: boolean
      }
      user_owns_resource: {
        Args: { resource_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
