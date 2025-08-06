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

// Simple contact form service - v2.0 (no admin, no SELECT queries)
export const contactService = {
  // Submit contact form - INSERT only, no SELECT
  async submitContactForm(formData: ContactFormData) {
    console.log('📝 Submitting contact form...', { query_type: formData.query_type })

    // INSERT without SELECT - this prevents 401 errors from RLS
    const { error } = await supabase
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

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Contact form submitted successfully!')
    return { success: true } // Return simple success indicator
  }
}
