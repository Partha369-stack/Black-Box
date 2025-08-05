import { useState } from 'react'

interface AdminAuthProps {
  onAuthenticated: () => void
}

const AdminAuth = ({ onAuthenticated }: AdminAuthProps) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Simple password check - in production, use proper authentication
  const ADMIN_PASSWORD = 'blackbox2025admin' // Change this to your desired password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simple delay to simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('blackbox_admin_auth', 'true')
      onAuthenticated()
    } else {
      setError('Incorrect password')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            BlackBox Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the admin password to access the dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>Demo password: blackbox2025admin</p>
          <p>Contact: black369box@gmail.com for access</p>
        </div>
      </div>
    </div>
  )
}

export default AdminAuth
