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

// Simple contact form service - v3.0 (direct REST API to avoid SELECT)
export const contactService = {
  // Submit contact form using direct REST API - no Supabase client SELECT behavior
  async submitContactForm(formData: ContactFormData) {
    console.log('📝 Submitting contact form via REST API...', { query_type: formData.query_type })

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal' // This prevents SELECT after INSERT
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject?.trim() || null,
          phone: formData.phone?.trim() || null,
          query_type: formData.query_type,
          message: formData.message.trim(),
          status: 'new',
          priority: 'medium'
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('❌ REST API error:', response.status, errorData)
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      console.log('✅ Contact form submitted successfully via REST API!')
      return { success: true }
    } catch (error) {
      console.error('❌ Contact form submission error:', error)
      throw error
    }
  }
}
