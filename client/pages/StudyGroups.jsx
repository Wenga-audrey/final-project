import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  User,
  BookOpen,
  Clock,
  ChevronRight,
  Lock,
  Globe
} from '@/lib/icons';
import DashboardLayout from '@/components/DashboardLayout';

export default function StudyGroups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState(null);

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchTerm, groups]);

  const fetchStudyGroups = async () => {
    try {
      setLoading(true);
      // Use new endpoint structure
      const response = await api.get(API_CONFIG.ENDPOINTS.FORUMS.STUDY_GROUPS);
      if (response.success) {
        setGroups(response.data);
        setFilteredGroups(response.data);
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    if (!searchTerm) {
      setFilteredGroups(groups);
      return;
    }

    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroupId(groupId);
      // Use new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.FORUMS.JOIN_STUDY_GROUP(groupId));
      if (response.success) {
        // Refresh the groups list
        fetchStudyGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleCreateGroup = () => {
    navigate('/study-groups/create');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-mindboost-green rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">Loading study groups...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Study Groups</h1>
            <p className="text-gray-600 mt-1">Connect with peers and collaborate on your studies</p>
          </div>
          <Button onClick={handleCreateGroup} className="bg-mindboost-green hover:bg-mindboost-green/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search study groups by name, subject, or description..."
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green/50 focus:border-mindboost-green"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-mindboost-light-green/50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-mindboost-green/10 rounded-lg">
                  <Users className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                  <p className="text-sm text-gray-600">Total Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.reduce((acc, group) => acc + group.memberCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {groups.reduce((acc, group) => acc + group.messageCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Available Study Groups</h2>
            <Badge variant="secondary" className="bg-mindboost-light-green text-mindboost-green">
              {filteredGroups.length} groups
            </Badge>
          </div>

          {filteredGroups.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No study groups found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a study group!'}
                </p>
                <Button onClick={handleCreateGroup} className="bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Study Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card 
                  key={group.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                          {group.name}
                          {group.isPrivate ? (
                            <Lock className="h-4 w-4 ml-2 text-gray-500" />
                          ) : (
                            <Globe className="h-4 w-4 ml-2 text-gray-500" />
                          )}
                        </CardTitle>
                        <Badge variant="outline" className="mt-2 bg-mindboost-light-green text-mindboost-green border-mindboost-green">
                          {group.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {group.memberCount}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 3).map((member, index) => (
                          <div 
                            key={member.id} 
                            className="w-8 h-8 bg-mindboost-green rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                            style={{ zIndex: 3 - index }}
                          >
                            {member.firstName[0]}
                          </div>
                        ))}
                        {group.memberCount > 3 && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                            +{group.memberCount - 3}
                          </div>
                        )}
                      </div>
                      
                      {group.isMember ? (
                        <Button 
                          asChild 
                          size="sm" 
                          className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full"
                        >
                          <Link to={`/study-group/${group.id}`}>
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={joiningGroupId === group.id}
                          className="bg-mindboost-green hover:bg-mindboost-green/90 text-white rounded-full"
                        >
                          {joiningGroupId === group.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Joining...
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 mr-1" />
                              Join
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}