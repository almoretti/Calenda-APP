"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
} from "lucide-react"
import { fetchCalendars } from "@/app/api/calendarApi"
import { fetchEvents, fetchEventsByDateRange } from "@/app/api/eventApi"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [apiEvents, setApiEvents] = useState([])
  const [apiCalendars, setApiCalendars] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    setIsLoaded(true)

    // Show AI popup after 3 seconds
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)

    // Fetch calendars and events from API
    fetchCalendarsFromApi()
    fetchEventsFromApi()

    return () => clearTimeout(popupTimer)
  }, [])

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "LLooks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [currentDate, setCurrentDate] = useState("March 5")
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Fetch calendars from API
  const fetchCalendarsFromApi = async () => {
    try {
      setIsLoadingCalendars(true)
      setApiError(null)
      
      const calendars = await fetchCalendars()
      setApiCalendars(calendars)
      
      // Update myCalendars with real data if available
      if (calendars && calendars.length > 0) {
        const formattedCalendars = calendars.map(cal => ({
          name: cal.displayName,
          color: getCalendarColor(cal.provider),
          id: cal.id
        }))
        
        // Only replace if we have data
        if (formattedCalendars.length > 0) {
          setMyCalendars(formattedCalendars)
        }
      }
    } catch (error) {
      console.error('Error fetching calendars:', error)
      setApiError(error.message)
    } finally {
      setIsLoadingCalendars(false)
    }
  }
  
  // Fetch events from API
  const fetchEventsFromApi = async () => {
    try {
      setIsLoadingEvents(true)
      setApiError(null)
      
      // Get current date and date 7 days from now
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)
      
      const events = await fetchEventsByDateRange(
        today.toISOString(),
        nextWeek.toISOString()
      )
      
      setApiEvents(events)
      
      // Transform API events to the format expected by the UI
      if (events && events.length > 0) {
        const transformedEvents = transformApiEvents(events)
        
        // Only replace if we have data
        if (transformedEvents.length > 0) {
          setEvents(transformedEvents)
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setApiError(error.message)
    } finally {
      setIsLoadingEvents(false)
    }
  }
  
  // Transform API events to the format expected by the UI
  const transformApiEvents = (apiEvents) => {
    return apiEvents.map((event, index) => {
      // Extract hours and minutes from ISO date strings
      const startDate = new Date(event.startTime)
      const endDate = new Date(event.endTime)
      
      const startHours = startDate.getHours().toString().padStart(2, '0')
      const startMinutes = startDate.getMinutes().toString().padStart(2, '0')
      const endHours = endDate.getHours().toString().padStart(2, '0')
      const endMinutes = endDate.getMinutes().toString().padStart(2, '0')
      
      // Calculate day of week (0-6, where 0 is Sunday)
      const day = startDate.getDay() + 1
      
      return {
        id: event.id || index + 1,
        title: event.title || 'Untitled Event',
        startTime: `${startHours}:${startMinutes}`,
        endTime: `${endHours}:${endMinutes}`,
        color: getEventColor(index),
        day: day,
        description: event.description || '',
        location: event.location || 'No location',
        attendees: event.attendees || [],
        organizer: event.organizer || event.organizerName || 'Unknown',
      }
    })
  }
  
  // Get color for calendar based on provider
  const getCalendarColor = (provider) => {
    switch (provider) {
      case 'google':
        return 'bg-blue-500'
      case 'ical':
        return 'bg-green-500'
      default:
        return `bg-${['blue', 'green', 'purple', 'orange', 'pink', 'teal'][Math.floor(Math.random() * 6)]}-500`
    }
  }
  
  // Get color for event based on index
  const getEventColor = (index) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 
      'bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-cyan-500',
      'bg-blue-400', 'bg-purple-400', 'bg-red-400', 'bg-green-400',
      'bg-yellow-400', 'bg-orange-400', 'bg-pink-400'
    ]
    return colors[index % colors.length]
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  // Events state - will be populated from API
  const [events, setEvents] = useState([])

  // Sample calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime, endTime) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample calendar for mini calendar
  const daysInMonth = 31
  const firstDayOffset = 5 // Friday is the first day of the month in this example
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  // Sample my calendars (will be replaced with API data if available)
  const [myCalendars, setMyCalendars] = useState([
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Here you would typically also control the actual audio playback
  }

  return (
    <div className="relative h-screen w-full overflow-hidden flex flex-col">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover -z-10"
        priority
      />

      {/* Navigation */}
      <header
        className={`relative z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="/calendar" 
            className="px-4 py-2 bg-blue-500 rounded-md text-white text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Manage Calendars
          </a>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-[calc(100vh-80px)] w-full flex overflow-hidden flex-1">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full">
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{currentMonth}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {miniCalendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      day === 5 ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"
                    } ${!day ? "invisible" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              {isLoadingCalendars ? (
                <div className="text-white/70 text-sm">Loading calendars...</div>
              ) : apiError ? (
                <div className="text-red-300 text-sm">Error loading calendars</div>
              ) : (
                <div className="space-y-2">
                  {myCalendars.map((cal, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                      <span className="text-white text-sm">{cal.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New position for the big plus button */}
          <button className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start">
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-md">Today</button>
              <div className="flex">
                <button className="p-2 text-white hover:bg-white/10 rounded-l-md">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 text-white hover:bg-white/10 rounded-r-md">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">{currentDate}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4 h-full">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full min-h-[800px]">
              {/* Week Header */}
              <div className="grid grid-cols-8 border-b border-white/20">
                <div className="p-2 text-center text-white/50 text-xs"></div>
                {weekDays.map((day, i) => (
                  <div key={i} className="p-2 text-center border-l border-white/20">
                    <div className="text-xs text-white/70 font-medium">{day}</div>
                    <div
                      className={`text-lg font-medium mt-1 text-white ${weekDates[i] === 5 ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                    >
                      {weekDates[i]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Labels */}
                <div className="text-white/70">
                  {timeSlots.map((time, i) => (
                    <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                      {time > 12 ? `${time - 12} PM` : `${time} AM`}
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="border-l border-white/20 relative">
                    {timeSlots.map((_, timeIndex) => (
                      <div key={timeIndex} className="h-20 border-b border-white/10"></div>
                    ))}

                    {/* Loading indicator */}
                    {isLoadingEvents && dayIndex === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white/70 text-sm animate-pulse">Loading events...</div>
                      </div>
                    )}

                    {/* Error indicator */}
                    {apiError && dayIndex === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-red-300 text-sm">Error loading events</div>
                      </div>
                    )}

                    {/* Events */}
                    {!isLoadingEvents && events
                      .filter((event) => event.day === dayIndex + 1)
                      .map((event, i) => {
                        const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                        return (
                          <div
                            key={i}
                            className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                            style={{
                              ...eventStyle,
                              left: "4px",
                              right: "4px",
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
                </p>
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.join(", ") || "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
