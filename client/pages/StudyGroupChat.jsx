import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
  Send,
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  Paperclip,
  ChevronLeft
} from '@/lib/icons';

export default function StudyGroupChat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch study group info and messages
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);

        // Fetch group info
        const groupResponse = await api.get(`/api/forums/study-groups`);

        if (groupResponse.success) {
          const group = groupResponse.data.find(g => g.id === groupId);
          if (group) {
            const transformedGroupInfo = {
              id: group.id,
              name: group.name,
              subject: group.class?.name || 'General',
              members: group._count?.members || group.members?.length || 0,
              nextSession: null,
              description: group.description,
              memberAvatars: group.members?.slice(0, 5).map(member =>
                `https://api.dicebear.com/7.x/initials/svg?seed=${member.user?.firstName || 'U'}${member.user?.lastName || ''}`
              ) || []
            };
            setGroupInfo(transformedGroupInfo);
          }
        }

        // Fetch messages
        const messagesResponse = await api.get(`/api/forums/study-groups/${groupId}/messages`);

        if (messagesResponse.success && Array.isArray(messagesResponse.data)) {
          const transformedMessages = messagesResponse.data.map(msg => ({
            id: msg.id,
            userId: msg.userId,
            userName: `${msg.user?.firstName || 'User'} ${msg.user?.lastName || ''}`,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${msg.user?.firstName || 'U'}${msg.user?.lastName || ''}`,
            content: msg.content,
            timestamp: msg.createdAt,
            isCurrentUser: msg.userId === user?.id
          }));

          setMessages(transformedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error fetching group data:', err);
        setError('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const response = await api.post(`/api/forums/study-groups/${groupId}/messages`, { content: newMessage });

      if (response.success && response.data) {
        const message = {
          id: response.data.id,
          userId: response.data.userId,
          userName: `${user?.firstName || 'You'} ${user?.lastName || ''}`,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || 'U'}${user?.lastName || ''}`,
          content: response.data.content,
          timestamp: response.data.createdAt,
          isCurrentUser: true
        };

        setMessages([...messages, message]);
        setNewMessage('');
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await api.post(`/api/forums/study-groups/${groupId}/leave`);

      if (response.success) {
        // Navigate back to study groups page
        navigate('/study-groups');
      } else {
        setError(response.error || 'Failed to leave group');
      }
    } catch (err) {
      console.error('Error leaving group:', err);
      setError('Failed to leave group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6 brand-shadow">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-mindboost-dark-green mb-2">Loading Chat...</h2>
          <p className="text-mindboost-green">Preparing your study group chat</p>
        </div>
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6 brand-shadow">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-mindboost-dark-green mb-2">Loading Chat...</h2>
          <p className="text-mindboost-green">Preparing your study group chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex flex-col">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-700 text-center">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="p-0 w-10 h-10">
              <Link to="/study-groups">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{groupInfo.name}</h1>
              <p className="text-sm text-gray-600">{groupInfo.subject} • {groupInfo.members} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700"
              onClick={handleLeaveGroup}
            >
              Leave Group
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-3xl w-full`}>
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={message.avatar} alt={message.userName} />
                    <AvatarFallback>{message.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${message.isCurrentUser ? 'items-end' : 'items-start'} mx-3`}>
                    <div className="text-sm font-medium text-gray-900">{message.userName}</div>
                    <div
                      className={`rounded-2xl px-4 py-2 max-w-md ${message.isCurrentUser
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                    >
                      <div className="text-sm">{message.content}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <Button type="button" variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-gray-700">
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="rounded-full py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 rounded-full p-3"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 border-l border-gray-200 bg-white p-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Group Info</h3>
              <p className="text-sm text-gray-600 mb-4">{groupInfo.description}</p>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Users className="h-4 w-4 mr-2" />
                <span>{groupInfo.members} members</span>
              </div>

              {groupInfo.nextSession && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Next session: {new Date(groupInfo.nextSession).toLocaleDateString()} at{' '}
                    {new Date(groupInfo.nextSession).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Members</h3>
              <div className="space-y-3">
                {groupInfo.memberAvatars.map((avatar, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">User {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Files</h3>
              <div className="space-y-2">
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Calculus_problems.pdf</span>
                </div>
                <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">Formula_sheet.docx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}