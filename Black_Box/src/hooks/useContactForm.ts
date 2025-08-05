import { useState } from 'react'
import { inquiryService, InquiryInsert } from '../lib/supabase'

interface ContactFormData {
  name: string
  email: string
  subject: string
  phone: string
  query_type: 'location' | 'products' | 'support' | 'feedback' | 'general' | ''
  message: string
}

interface ContactFormState {
  isLoading: boolean
  isSuccess: boolean
  error: string | null
}

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    phone: '',
    query_type: '',
    message: ''
  })

  const [formState, setFormState] = useState<ContactFormState>({
    isLoading: false,
    isSuccess: false,
    error: null
  })

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: null }))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!formData.email.includes('@')) return 'Please enter a valid email'
    if (!formData.query_type) return 'Please select what we can help you with'
    if (!formData.message.trim()) return 'Message is required'
    if (formData.message.trim().length < 10) return 'Message must be at least 10 characters'
    return null
  }

  const submitForm = async () => {
    setFormState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Validate form
      const validationError = validateForm()
      if (validationError) {
        throw new Error(validationError)
      }

      // Prepare inquiry data
      const inquiryData: InquiryInsert = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        query_type: formData.query_type as any,
        message: formData.message.trim(),
        status: 'new',
        priority: determinePriority(formData.query_type, formData.message)
      }

      // Submit to Supabase
      await inquiryService.createInquiry(inquiryData)

      setFormState({
        isLoading: false,
        isSuccess: true,
        error: null
      })

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        query_type: '',
        message: ''
      })

    } catch (error) {
      setFormState({
        isLoading: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      phone: '',
      query_type: '',
      message: ''
    })
    setFormState({
      isLoading: false,
      isSuccess: false,
      error: null
    })
  }

  const resetStatus = () => {
    setFormState(prev => ({
      ...prev,
      isSuccess: false,
      error: null
    }))
  }

  return {
    formData,
    formState,
    updateField,
    submitForm,
    resetForm,
    resetStatus
  }
}

// Helper function to determine priority based on query type and message content
const determinePriority = (queryType: string, message: string): 'low' | 'medium' | 'high' | 'urgent' => {
  const urgentKeywords = ['urgent', 'emergency', 'broken', 'stuck', 'error', 'not working', 'issue', 'problem']
  const highKeywords = ['asap', 'quickly', 'soon', 'important', 'help']
  
  const lowerMessage = message.toLowerCase()
  
  // Check for urgent keywords
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'urgent'
  }
  
  // Support queries are generally higher priority
  if (queryType === 'support') {
    if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high'
    }
    return 'medium'
  }
  
  // Check for high priority keywords
  if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'high'
  }
  
  // Default priorities by query type
  switch (queryType) {
    case 'support':
      return 'medium'
    case 'feedback':
      return 'low'
    case 'general':
      return 'low'
    case 'location':
      return 'medium'
    case 'products':
      return 'medium'
    default:
      return 'medium'
  }
}
