import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  Video,
  Bell,
  Edit,
  Trash2,
  Flask,
  MessageCircle
} from '@/lib/icons';

export default function Scheduling() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock schedule data
  const mockSchedule = [
    {
      id: '1',
      title: 'Mathematics Review Session',
      subject: 'Mathematics',
      type: 'Study Group',
      date: '2024-01-20',
      time: '15:00',
      duration: 60,
      location: 'Online - Zoom',
      instructor: 'Dr. Smith',
      attendees: 12,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: '2',
      title: 'Physics Quiz Preparation',
      subject: 'Physics',
      type: 'Quiz',
      date: '2024-01-21',
      time: '14:00',
      duration: 45,
      location: 'Room 205',
      instructor: 'Prof. Johnson',
      attendees: 8,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: '3',
      title: 'Chemistry Lab Session',
      subject: 'Chemistry',
      type: 'Lab',
      date: '2024-01-22',
      time: '16:00',
      duration: 90,
      location: 'Lab 301',
      instructor: 'Dr. Williams',
      attendees: 15,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: '4',
      title: 'Literature Discussion',
      subject: 'Literature',
      type: 'Discussion',
      date: '2024-01-23',
      time: '17:00',
      duration: 60,
      location: 'Library Room A',
      instructor: 'Prof. Brown',
      attendees: 10,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const filteredSchedule = mockSchedule.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.type.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'study group': return <Users className="h-4 w-4" />;
      case 'quiz': return <BookOpen className="h-4 w-4" />;
      case 'lab': return <Flask className="h-4 w-4" />;
      case 'discussion': return <MessageCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Schedule</h1>
            <p className="text-gray-600">Manage your learning sessions and stay on track with your goals</p>
          </div>
          <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Bell className="h-4 w-4 mr-2" />
              Reminders
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{mockSchedule.length}</div>
                  <div className="text-blue-100">Total Sessions</div>
                </div>
                <Calendar className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {mockSchedule.filter(s => s.type === 'Study Group').length}
                  </div>
                  <div className="text-green-100">Study Groups</div>
                </div>
                <Users className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {mockSchedule.filter(s => s.type === 'Quiz').length}
                  </div>
                  <div className="text-purple-100">Quizzes</div>
                </div>
                <BookOpen className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {mockSchedule.reduce((total, session) => total + session.attendees, 0)}
                  </div>
                  <div className="text-orange-100">Total Attendees</div>
                </div>
                <Users className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          {filteredSchedule.map((session) => (
            <Card key={session.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{session.title}</CardTitle>
                    <div className="flex items-center mt-2">
                      <Badge className={session.color}>
                        {getTypeIcon(session.type)}
                        <span className="ml-1">{session.type}</span>
                      </Badge>
                      <Badge variant="outline" className="ml-2 border-gray-300 text-gray-600">
                        {session.subject}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="p-0 w-8 h-8 text-gray-500 hover:text-blue-500">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 w-8 h-8 text-gray-500 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Date</div>
                      <div className="font-semibold">{new Date(session.date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Time</div>
                      <div className="font-semibold">{session.time} ({session.duration} min)</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Attendees</div>
                      <div className="font-semibold">{session.attendees} students</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Video className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-semibold">{session.location}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                      {session.instructor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Instructor</div>
                      <div className="text-sm text-gray-600">{session.instructor}</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Bell className="h-4 w-4 mr-2" />
                      Remind Me
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                      Join Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchedule.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}