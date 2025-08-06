import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Simple type for contact form submission
export interface ContactFormData {
  name: string
  email: string
  subject?: string
  phone?: string
  query_type: 'location' | 'products' | 'support' | 'feedback' | 'general'
  message: string
}

// Simple contact form service
export const contactService = {
  // Submit contact form
  async submitContactForm(formData: ContactFormData) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject?.trim() || null,
        phone: formData.phone?.trim() || null,
        query_type: formData.query_type,
        message: formData.message.trim(),
        status: 'new',
        priority: 'medium'
      }])

    if (error) throw error
    return data
  }
}
