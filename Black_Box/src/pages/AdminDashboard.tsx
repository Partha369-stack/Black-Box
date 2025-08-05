import { useState, useEffect } from 'react'
import { inquiryService, Inquiry } from '@/lib/supabase'

const AdminDashboard = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    query_type: '',
    priority: '',
    search: ''
  })
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadInquiries()
    loadStats()
  }, [filters])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      const data = await inquiryService.getInquiries(filters)
      setInquiries(data)
    } catch (error) {
      console.error('Error loading inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await inquiryService.getInquiryStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const updateInquiryStatus = async (id: string, status: string, response?: string) => {
    try {
      await inquiryService.updateInquiryStatus(id, status, response)
      loadInquiries()
      loadStats()
      if (selectedInquiry?.id === id) {
        const updated = await inquiryService.getInquiry(id)
        setSelectedInquiry(updated)
      }
    } catch (error) {
      console.error('Error updating inquiry:', error)
    }
  }

  const updateInquiryPriority = async (id: string, priority: string) => {
    try {
      await inquiryService.updateInquiryPriority(id, priority)
      loadInquiries()
      loadStats()
      if (selectedInquiry?.id === id) {
        const updated = await inquiryService.getInquiry(id)
        setSelectedInquiry(updated)
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">BlackBox Inquiry Management</h1>
          <p className="text-gray-300 mt-2">Manage website inquiries and customer support</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Total Inquiries</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">New</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.new}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.in_progress}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900">Resolved</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.resolved}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Inquiries List */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Inquiries</h2>
                
                {/* Filters */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={filters.query_type}
                    onChange={(e) => setFilters({ ...filters, query_type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="location">Location</option>
                    <option value="products">Products</option>
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="general">General</option>
                  </select>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-6 text-center">Loading...</div>
                ) : inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{inquiry.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(inquiry.priority)}`}>
                              {inquiry.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.status)}`}>
                              {inquiry.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            {inquiry.email} • {inquiry.query_type}
                          </div>
                          {inquiry.subject && (
                            <div className="text-sm font-medium text-gray-800 mb-1">{inquiry.subject}</div>
                          )}
                          <div className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">No inquiries found</div>
                )}
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="lg:w-1/3">
            {selectedInquiry ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Inquiry Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer</label>
                      <p className="text-lg font-medium text-gray-900">{selectedInquiry.name}</p>
                      <p className="text-sm text-gray-600">{selectedInquiry.email}</p>
                      {selectedInquiry.phone && (
                        <p className="text-sm text-gray-600">{selectedInquiry.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Query Type</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedInquiry.query_type}</p>
                    </div>

                    {selectedInquiry.subject && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <p className="text-sm text-gray-900">{selectedInquiry.subject}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={selectedInquiry.priority}
                        onChange={(e) => updateInquiryPriority(selectedInquiry.id, e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => updateInquiryStatus(selectedInquiry.id, e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {selectedInquiry.response_message && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Response</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {selectedInquiry.response_message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Responded on {formatDate(selectedInquiry.responded_at!)}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      <p>Created: {formatDate(selectedInquiry.created_at)}</p>
                      <p>Updated: {formatDate(selectedInquiry.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-500 text-center">Select an inquiry to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
