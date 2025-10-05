import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  Video,
  Bell,
  Target
} from '@/lib/icons';

export default function StudyCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'study'
  });

  // Fetch calendar events from backend
  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await api.get(`/api/scheduler/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);

      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.scheduledAt).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleCreateEvent = async () => {
    try {
      if (!newEvent.title || !newEvent.date || !newEvent.time) {
        setError('Please fill in all required fields');
        return;
      }

      const scheduledAt = new Date(`${newEvent.date}T${newEvent.time}`);

      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        scheduledAt: scheduledAt.toISOString(),
        duration: parseInt(newEvent.duration),
        type: newEvent.type
      };

      const response = await api.post('/api/scheduler/events', eventData);

      if (response.success) {
        setIsCreateDialogOpen(false);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          duration: 60,
          type: 'study'
        });
        fetchEvents(); // Refresh events
      } else {
        setError('Failed to create event');
      }
    } catch (err) {
      setError('Failed to create event');
      console.error('Error creating event:', err);
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Event type colors
  const eventTypeColors = {
    lesson: 'bg-blue-100 text-blue-800 border-blue-200',
    assessment: 'bg-purple-100 text-purple-800 border-purple-200',
    review: 'bg-green-100 text-green-800 border-green-200',
    practice: 'bg-orange-100 text-orange-800 border-orange-200',
    study_group: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    live_session: 'bg-pink-100 text-pink-800 border-pink-200',
    custom: 'bg-gray-100 text-gray-800 border-gray-200',
    study: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Button asChild variant="ghost" className="mr-4">
              <Link to="/dashboard/learner">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Calendar</h1>
              <p className="text-gray-600">Plan and track your learning schedule</p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Event title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time *
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration (min)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study Session</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="study_group">Study Group</SelectItem>
                      <SelectItem value="live_session">Live Session</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateEvent} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => navigateMonth(-1)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-xl font-bold text-gray-900">
                    {monthName} {year}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => navigateMonth(1)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    const dayEvents = getEventsForDate(date);
                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${!date
                          ? 'bg-gray-50'
                          : isToday(date)
                            ? 'bg-blue-50 border-blue-200'
                            : isSelected(date)
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        onClick={() => date && setSelectedDate(date)}
                      >
                        {date && (
                          <>
                            <div className={`text-sm font-medium ${isToday(date) ? 'text-blue-600' : 'text-gray-900'
                              }`}>
                              {date.getDate()}
                            </div>
                            <div className="mt-1 space-y-1">
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-xs px-2 py-1 rounded truncate ${eventTypeColors[event.type] || eventTypeColors.custom}`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500 px-2">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Events */}
          <div>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardTitle>
                <p className="text-gray-600">
                  {getEventsForDate(selectedDate).length} events scheduled
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map(event => {
                      const eventDate = new Date(event.scheduledAt);
                      const eventTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={event.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              <div className="flex items-center mt-1">
                                <Badge className={eventTypeColors[event.type] || eventTypeColors.custom}>
                                  {event.type.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <Clock className="h-5 w-5 text-gray-500" />
                          </div>

                          {event.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {event.description}
                            </p>
                          )}

                          <div className="mt-3 flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{eventTime} ({event.duration} min)</span>
                          </div>

                          <div className="mt-4 flex space-x-2">
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                              <Bell className="h-4 w-4 mr-1" />
                              Remind
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                              Join
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No events scheduled for this day</p>
                      <Button
                        className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                        onClick={() => {
                          const dateStr = selectedDate.toISOString().split('T')[0];
                          setNewEvent(prev => ({
                            ...prev,
                            date: dateStr
                          }));
                          setIsCreateDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Event
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(event => new Date(event.scheduledAt) >= new Date())
                  .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                  .slice(0, 5)
                  .map(event => {
                    const eventDate = new Date(event.scheduledAt);
                    return (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${eventTypeColors[event.type] ? eventTypeColors[event.type].split(' ')[0] : eventTypeColors.custom.split(' ')[0]} mr-4`}></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{eventDate.toLocaleDateString()}</span>
                              <Clock className="h-4 w-4 ml-3 mr-2" />
                              <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={eventTypeColors[event.type] || eventTypeColors.custom}>
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}