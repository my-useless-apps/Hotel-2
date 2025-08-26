'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [events, setEvents] = useState([])
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [isAuthenticated])

  const checkAuth = () => {
    const token = Cookies.get('admin-token')
    if (token) {
      setIsAuthenticated(true)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.post(`${backendUrl}/api/admin/login`, loginForm)
      
      if (response.data.success) {
        Cookies.set('admin-token', response.data.token, { expires: 7 })
        setIsAuthenticated(true)
        setLoginForm({ username: '', password: '' })
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Cookies.remove('admin-token')
    setIsAuthenticated(false)
    setEvents([])
  }

  const fetchEvents = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const token = Cookies.get('admin-token')
      const response = await axios.get(`${backendUrl}/api/admin/events`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
      // Demo data for development
      setEvents([
        { id: 1, title: 'New Year Celebration', date: '2025-01-01', description: 'Welcome 2025!' },
        { id: 2, title: 'Team Meeting', date: '2025-01-15', description: 'Monthly team sync' },
        { id: 3, title: 'Product Launch', date: '2025-02-01', description: 'Launch new features' }
      ])
    }
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const token = Cookies.get('admin-token')
      const response = await axios.post(`${backendUrl}/api/admin/events`, newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setEvents([...events, { ...newEvent, id: Date.now() }])
        setNewEvent({ title: '', date: '', description: '' })
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add event')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const token = Cookies.get('admin-token')
      await axios.delete(`${backendUrl}/api/admin/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setEvents(events.filter(event => event.id !== eventId))
    } catch (error) {
      setError('Failed to delete event')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to manage calendar events
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          <div className="text-center text-sm text-gray-600">
            <p>Demo credentials: admin / password</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Event Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  min="2025-01-01"
                  max="2025-12-31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Event'}
              </button>
            </form>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manage Events</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-blue-600 text-sm font-medium">{event.date}</p>
                    <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No events created yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
