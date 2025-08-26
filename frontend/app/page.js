'use client'

import { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import axios from 'axios'

export default function Home() {
  const [date, setDate] = useState(new Date('2025-01-01'))
  const [events, setEvents] = useState([])
  const [selectedDateEvents, setSelectedDateEvents] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    // Filter events for selected date
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = events.filter(event => 
      event.date === dateStr
    )
    setSelectedDateEvents(dayEvents)
  }, [date, events])

  const fetchEvents = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.get(`${backendUrl}/api/events`)
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
      // For demo purposes, show some sample events
      setEvents([
        { id: 1, title: 'New Year Celebration', date: '2025-01-01', description: 'Welcome 2025!' },
        { id: 2, title: 'Team Meeting', date: '2025-01-15', description: 'Monthly team sync' },
        { id: 3, title: 'Product Launch', date: '2025-02-01', description: 'Launch new features' }
      ])
    }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const hasEvents = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.some(event => event.date === dateStr)
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month' && hasEvents(date)) {
      return <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Calendar 2025</h1>
          <p className="text-gray-600">Click on any date to view events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Calendar</h2>
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={tileContent}
              minDate={new Date('2025-01-01')}
              maxDate={new Date('2025-12-31')}
              className="w-full"
            />
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Events for {formatDate(date)}
            </h2>
            
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <p className="text-gray-500">No events scheduled for this date</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((event) => (
              <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <p className="text-blue-600 text-sm font-medium">{event.date}</p>
                <p className="text-gray-600 text-sm mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
