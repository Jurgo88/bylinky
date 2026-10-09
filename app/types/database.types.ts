// Vygenerované zo Supabase (projekt inisctjmatxfbxnjtwqz). Po zmene schémy pregeneruj:
//   npx supabase gen types typescript --project-id inisctjmatxfbxnjtwqz > app/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      article_products: {
        Row: { article_id: number; product_id: number }
        Insert: { article_id: number; product_id: number }
        Update: { article_id?: number; product_id?: number }
        Relationships: [
          { foreignKeyName: "article_products_article_id_fkey"; columns: ["article_id"]; isOneToOne: false; referencedRelation: "articles"; referencedColumns: ["id"] },
          { foreignKeyName: "article_products_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      articles: {
        Row: {
          body_md: string | null
          cover_image_path: string | null
          excerpt: string | null
          id: number
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Insert: {
          body_md?: string | null
          cover_image_path?: string | null
          excerpt?: string | null
          id?: never
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
        }
        Update: {
          body_md?: string | null
          cover_image_path?: string | null
          excerpt?: string | null
          id?: never
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: { description: string | null; id: number; is_published: boolean; name: string; position: number; slug: string }
        Insert: { description?: string | null; id?: never; is_published?: boolean; name: string; position?: number; slug: string }
        Update: { description?: string | null; id?: never; is_published?: boolean; name?: string; position?: number; slug?: string }
        Relationships: []
      }
      order_items: {
        Row: {
          id: number
          order_id: string
          product_name: string
          qty: number
          unit_price: number
          variant_id: number | null
          variant_label: string | null
        }
        Insert: {
          id?: never
          order_id: string
          product_name: string
          qty: number
          unit_price: number
          variant_id?: number | null
          variant_label?: string | null
        }
        Update: {
          id?: never
          order_id?: string
          product_name?: string
          qty?: number
          unit_price?: number
          variant_id?: number | null
          variant_label?: string | null
        }
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_variant_id_fkey"; columns: ["variant_id"]; isOneToOne: false; referencedRelation: "product_variants"; referencedColumns: ["id"] },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          cod_fee: number
          created_at: string
          email: string
          id: string
          name: string
          note: string | null
          number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_ref: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          pickup_point: Json | null
          shipping_address: Json | null
          shipping_method_id: number | null
          shipping_price: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }
        Insert: {
          billing_address?: Json | null
          cod_fee?: number
          created_at?: string
          email: string
          id?: string
          name: string
          note?: string | null
          number?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_ref?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          pickup_point?: Json | null
          shipping_address?: Json | null
          shipping_method_id?: number | null
          shipping_price?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
        }
        Update: {
          billing_address?: Json | null
          cod_fee?: number
          created_at?: string
          email?: string
          id?: string
          name?: string
          note?: string | null
          number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_ref?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          pickup_point?: Json | null
          shipping_address?: Json | null
          shipping_method_id?: number | null
          shipping_price?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
        }
        Relationships: [
          { foreignKeyName: "orders_shipping_method_id_fkey"; columns: ["shipping_method_id"]; isOneToOne: false; referencedRelation: "shipping_methods"; referencedColumns: ["id"] },
        ]
      }
      pages: {
        Row: {
          body_md: string | null
          id: number
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string | null
          id?: never
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string | null
          id?: never
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: { category_id: number; position: number; product_id: number }
        Insert: { category_id: number; position?: number; product_id: number }
        Update: { category_id?: number; position?: number; product_id?: number }
        Relationships: [
          { foreignKeyName: "product_categories_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "product_categories_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      product_images: {
        Row: { alt: string | null; id: number; position: number; product_id: number; storage_path: string }
        Insert: { alt?: string | null; id?: never; position?: number; product_id: number; storage_path: string }
        Update: { alt?: string | null; id?: never; position?: number; product_id?: number; storage_path?: string }
        Relationships: [
          { foreignKeyName: "product_images_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      product_tags: {
        Row: { product_id: number; tag_id: number }
        Insert: { product_id: number; tag_id: number }
        Update: { product_id?: number; tag_id?: number }
        Relationships: [
          { foreignKeyName: "product_tags_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "product_tags_tag_id_fkey"; columns: ["tag_id"]; isOneToOne: false; referencedRelation: "tags"; referencedColumns: ["id"] },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          id: number
          is_active: boolean
          packaging: Database["public"]["Enums"]["packaging_type"] | null
          position: number
          price: number
          product_id: number
          size_label: string | null
          sku: string | null
          stock_qty: number | null
          weight_g: number | null
        }
        Insert: {
          compare_at_price?: number | null
          id?: never
          is_active?: boolean
          packaging?: Database["public"]["Enums"]["packaging_type"] | null
          position?: number
          price: number
          product_id: number
          size_label?: string | null
          sku?: string | null
          stock_qty?: number | null
          weight_g?: number | null
        }
        Update: {
          compare_at_price?: number | null
          id?: never
          is_active?: boolean
          packaging?: Database["public"]["Enums"]["packaging_type"] | null
          position?: number
          price?: number
          product_id?: number
          size_label?: string | null
          sku?: string | null
          stock_qty?: number | null
          weight_g?: number | null
        }
        Relationships: [
          { foreignKeyName: "product_variants_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      products: {
        Row: {
          composition: string | null
          created_at: string
          description_md: string | null
          dosage: string | null
          id: number
          is_published: boolean
          name: string
          old_url: string | null
          primary_category_id: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
          usage: string | null
        }
        Insert: {
          composition?: string | null
          created_at?: string
          description_md?: string | null
          dosage?: string | null
          id?: never
          is_published?: boolean
          name: string
          old_url?: string | null
          primary_category_id?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
          usage?: string | null
        }
        Update: {
          composition?: string | null
          created_at?: string
          description_md?: string | null
          dosage?: string | null
          id?: never
          is_published?: boolean
          name?: string
          old_url?: string | null
          primary_category_id?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
          usage?: string | null
        }
        Relationships: [
          { foreignKeyName: "products_primary_category_id_fkey"; columns: ["primary_category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
        ]
      }
      profiles: {
        Row: { role: string; user_id: string }
        Insert: { role?: string; user_id: string }
        Update: { role?: string; user_id?: string }
        Relationships: []
      }
      settings: {
        Row: { key: string; value: Json }
        Insert: { key: string; value: Json }
        Update: { key?: string; value?: Json }
        Relationships: []
      }
      shipments: {
        Row: {
          barcode: string | null
          carrier: Database["public"]["Enums"]["carrier_type"]
          external_id: string | null
          id: number
          label_path: string | null
          last_checked_at: string | null
          order_id: string
          status: string | null
          tracking_url: string | null
        }
        Insert: {
          barcode?: string | null
          carrier: Database["public"]["Enums"]["carrier_type"]
          external_id?: string | null
          id?: never
          label_path?: string | null
          last_checked_at?: string | null
          order_id: string
          status?: string | null
          tracking_url?: string | null
        }
        Update: {
          barcode?: string | null
          carrier?: Database["public"]["Enums"]["carrier_type"]
          external_id?: string | null
          id?: never
          label_path?: string | null
          last_checked_at?: string | null
          order_id?: string
          status?: string | null
          tracking_url?: string | null
        }
        Relationships: [
          { foreignKeyName: "shipments_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
        ]
      }
      shipping_methods: {
        Row: {
          carrier: Database["public"]["Enums"]["carrier_type"]
          cod_fee: number | null
          code: string
          free_from: number | null
          id: number
          is_active: boolean
          kind: Database["public"]["Enums"]["shipping_kind"]
          name: string
          position: number
          price: number
        }
        Insert: {
          carrier: Database["public"]["Enums"]["carrier_type"]
          cod_fee?: number | null
          code: string
          free_from?: number | null
          id?: never
          is_active?: boolean
          kind: Database["public"]["Enums"]["shipping_kind"]
          name: string
          position?: number
          price: number
        }
        Update: {
          carrier?: Database["public"]["Enums"]["carrier_type"]
          cod_fee?: number | null
          code?: string
          free_from?: number | null
          id?: never
          is_active?: boolean
          kind?: Database["public"]["Enums"]["shipping_kind"]
          name?: string
          position?: number
          price?: number
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          city: string | null
          id: number
          is_active: boolean
          lat: number | null
          lng: number | null
          maps_url: string | null
          name: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          id?: never
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          maps_url?: string | null
          name: string
        }
        Update: {
          address?: string | null
          city?: string | null
          id?: never
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          maps_url?: string | null
          name?: string
        }
        Relationships: []
      }
      tags: {
        Row: { id: number; name: string; slug: string }
        Insert: { id?: never; name: string; slug: string }
        Update: { id?: never; name?: string; slug?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      carrier_type: "packeta" | "gls" | "posta" | "osobny"
      content_status: "draft" | "published"
      order_status: "new" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"
      packaging_type: "plast" | "sklo"
      payment_method: "card" | "transfer" | "cod" | "cash"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      shipping_kind: "pickup" | "home" | "personal"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]
