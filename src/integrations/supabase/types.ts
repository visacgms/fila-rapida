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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome_completo: string
          role: string
          senha_temporaria: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome_completo: string
          role?: string
          senha_temporaria?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome_completo?: string
          role?: string
          senha_temporaria?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      senhas_normal: {
        Row: {
          atendente: string | null
          created_at: string
          datahorastatus: string | null
          datahoriochamada: string | null
          guiche: string | null
          historico: Json
          id: number
          local: string | null
          senha: string
          status: Database["public"]["Enums"]["status_senha"]
        }
        Insert: {
          atendente?: string | null
          created_at?: string
          datahorastatus?: string | null
          datahoriochamada?: string | null
          guiche?: string | null
          historico?: Json
          id?: never
          local?: string | null
          senha: string
          status?: Database["public"]["Enums"]["status_senha"]
        }
        Update: {
          atendente?: string | null
          created_at?: string
          datahorastatus?: string | null
          datahoriochamada?: string | null
          guiche?: string | null
          historico?: Json
          id?: never
          local?: string | null
          senha?: string
          status?: Database["public"]["Enums"]["status_senha"]
        }
        Relationships: []
      }
      senhas_prioritario: {
        Row: {
          atendente: string | null
          created_at: string
          datahorastatus: string | null
          datahoriochamada: string | null
          guiche: string | null
          historico: Json
          id: number
          local: string | null
          senha: string
          status: Database["public"]["Enums"]["status_senha"]
        }
        Insert: {
          atendente?: string | null
          created_at?: string
          datahorastatus?: string | null
          datahoriochamada?: string | null
          guiche?: string | null
          historico?: Json
          id?: never
          local?: string | null
          senha: string
          status?: Database["public"]["Enums"]["status_senha"]
        }
        Update: {
          atendente?: string | null
          created_at?: string
          datahorastatus?: string | null
          datahoriochamada?: string | null
          guiche?: string | null
          historico?: Json
          id?: never
          local?: string | null
          senha?: string
          status?: Database["public"]["Enums"]["status_senha"]
        }
        Relationships: []
      }
    }
    Views: {
      v_senhas: {
        Row: {
          atendente: string | null
          created_at: string | null
          datahorastatus: string | null
          datahoriochamada: string | null
          guiche: string | null
          historico: Json | null
          id: number | null
          local: string | null
          senha: string | null
          status: Database["public"]["Enums"]["status_senha"] | null
          tipo: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      status_senha:
        | "aguardando"
        | "chamando"
        | "atendida"
        | "ausente"
        | "transferida"
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
    Enums: {
      status_senha: [
        "aguardando",
        "chamando",
        "atendida",
        "ausente",
        "transferida",
      ],
    },
  },
} as const
