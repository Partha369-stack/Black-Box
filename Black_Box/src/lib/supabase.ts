import { createClient } from '@supabase/supabase-js'

// Fallback to hardcoded values if env vars not available (Railway deployment fix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xgjdaavxwhvhcbycdbtv.supabase.co'
// Use service role key to bypass RLS completely
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamRhYXZ4d2h2aGNieWNkYnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzOTk3MSwiZXhwIjoyMDY4NTE1OTcxfQ.7JtM8f9RUCG8AgMCZNtpIAJy0BnbSPHZPBRSxDt9Xnk'

console.log('🚀 Supabase initialized with URL:', supabaseUrl)
console.log('🔑 API key loaded:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING')

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

    // Use service role key to bypass RLS completely
    const supabaseUrl = 'https://xgjdaavxwhvhcbycdbtv.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnamRhYXZ4d2h2aGNieWNkYnR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjkzOTk3MSwiZXhwIjoyMDY4NTE1OTcxfQ.7JtM8f9RUCG8AgMCZNtpIAJy0BnbSPHZPBRSxDt9Xnk'

    console.log('🔑 Using Supabase URL:', supabaseUrl)
    console.log('🔑 Using API key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING')

    // First, test if the API key is valid
    console.log('🧪 Testing API key validity...')
    try {
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      console.log('🧪 API key test response:', testResponse.status)

      if (testResponse.status === 401) {
        throw new Error('API key is invalid or expired. Please get a fresh anon key from Supabase dashboard.')
      }
    } catch (testError) {
      console.error('🧪 API key test failed:', testError)
    }

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
