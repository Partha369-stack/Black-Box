import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database
export interface Inquiry {
  id: string
  name: string
  email: string
  subject?: string
  phone?: string
  query_type: 'location' | 'products' | 'support' | 'feedback' | 'general'
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  responded_at?: string
  response_message?: string
}

export interface InquiryInsert {
  name: string
  email: string
  subject?: string
  phone?: string
  query_type: 'location' | 'products' | 'support' | 'feedback' | 'general'
  message: string
  status?: 'new' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

// Inquiry management functions
export const inquiryService = {
  // Create new inquiry
  async createInquiry(inquiry: InquiryInsert) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        ...inquiry,
        status: inquiry.status || 'new',
        priority: inquiry.priority || 'medium'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all inquiries with optional filtering
  async getInquiries(filters?: {
    status?: string
    query_type?: string
    priority?: string
    search?: string
  }) {
    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.query_type) {
      query = query.eq('query_type', filters.query_type)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get single inquiry
  async getInquiry(id: string) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Update inquiry status
  async updateInquiryStatus(id: string, status: string, responseMessage?: string) {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (responseMessage) {
      updateData.response_message = responseMessage
      updateData.responded_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update inquiry priority
  async updateInquiryPriority(id: string, priority: string) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ 
        priority, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get inquiry statistics
  async getInquiryStats() {
    const { data, error } = await supabase
      .from('inquiries')
      .select('status, query_type, priority, created_at')

    if (error) throw error

    const stats = {
      total: data.length,
      new: data.filter(i => i.status === 'new').length,
      in_progress: data.filter(i => i.status === 'in_progress').length,
      resolved: data.filter(i => i.status === 'resolved').length,
      closed: data.filter(i => i.status === 'closed').length,
      by_type: {
        location: data.filter(i => i.query_type === 'location').length,
        products: data.filter(i => i.query_type === 'products').length,
        support: data.filter(i => i.query_type === 'support').length,
        feedback: data.filter(i => i.query_type === 'feedback').length,
        general: data.filter(i => i.query_type === 'general').length,
      },
      by_priority: {
        low: data.filter(i => i.priority === 'low').length,
        medium: data.filter(i => i.priority === 'medium').length,
        high: data.filter(i => i.priority === 'high').length,
        urgent: data.filter(i => i.priority === 'urgent').length,
      }
    }

    return stats
  }
}
