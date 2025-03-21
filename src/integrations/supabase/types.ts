export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          createdat: string | null
          description: string | null
          id: string
          name: string
          updatedat: string | null
        }
        Insert: {
          createdat?: string | null
          description?: string | null
          id?: string
          name: string
          updatedat?: string | null
        }
        Update: {
          createdat?: string | null
          description?: string | null
          id?: string
          name?: string
          updatedat?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          categoryid: number | null
          categoryname: string | null
          createdat: string | null
          description: string | null
          id: number
          name: string
          price: number
          racklocation: string | null
          sku: string
          stock: number
          updatedat: string | null
        }
        Insert: {
          categoryid?: number | null
          categoryname?: string | null
          createdat?: string | null
          description?: string | null
          id?: never
          name: string
          price: number
          racklocation?: string | null
          sku: string
          stock: number
          updatedat?: string | null
        }
        Update: {
          categoryid?: number | null
          categoryname?: string | null
          createdat?: string | null
          description?: string | null
          id?: never
          name?: string
          price?: number
          racklocation?: string | null
          sku?: string
          stock?: number
          updatedat?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          createdat: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updatedat: string | null
        }
        Insert: {
          address?: string | null
          createdat?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updatedat?: string | null
        }
        Update: {
          address?: string | null
          createdat?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updatedat?: string | null
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          id: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          transaction_id: string | null
          unit_price: number
        }
        Insert: {
          id?: string
          product_id: string
          product_name: string
          quantity: number
          subtotal: number
          transaction_id?: string | null
          unit_price: number
        }
        Update: {
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          subtotal?: number
          transaction_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          cashreceived: number | null
          change: number | null
          createdat: string | null
          id: string
          paymentmethod: string
          receiptnumber: string
          subtotal: number
          tax: number | null
          total: number
        }
        Insert: {
          cashreceived?: number | null
          change?: number | null
          createdat?: string | null
          id?: string
          paymentmethod: string
          receiptnumber: string
          subtotal: number
          tax?: number | null
          total: number
        }
        Update: {
          cashreceived?: number | null
          change?: number | null
          createdat?: string | null
          id?: string
          paymentmethod?: string
          receiptnumber?: string
          subtotal?: number
          tax?: number | null
          total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
