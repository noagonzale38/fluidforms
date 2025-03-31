export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
          updated_at: string
          created_by: string
          created_by_username: string
          status: string
          require_login: boolean
          share_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          created_at?: string
          updated_at?: string
          created_by: string
          created_by_username?: string
          status?: string
          require_login?: boolean
          share_id?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          created_by_username?: string
          status?: string
          require_login?: boolean
          share_id?: string
        }
      }
      form_elements: {
        Row: {
          id: string
          form_id: string
          element_id: string
          type: string
          label: string
          required: boolean
          properties: Json
          conditions: Json
          order: number
        }
        Insert: {
          id?: string
          form_id: string
          element_id: string
          type: string
          label: string
          required: boolean
          properties?: Json
          conditions?: Json
          order: number
        }
        Update: {
          id?: string
          form_id?: string
          element_id?: string
          type?: string
          label?: string
          required?: boolean
          properties?: Json
          conditions?: Json
          order?: number
        }
      }
      form_responses: {
        Row: {
          id: string
          form_id: string
          respondent_id: string | null
          data: Json
          created_at: string
          updated_at: string | null
          status: string
        }
        Insert: {
          id?: string
          form_id: string
          respondent_id?: string | null
          data: Json
          created_at?: string
          updated_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          form_id?: string
          respondent_id?: string | null
          data?: Json
          created_at?: string
          updated_at?: string | null
          status?: string
        }
      }
    }
  }
}

