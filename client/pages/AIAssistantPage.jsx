import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
    Brain,
    Send,
    User,
    Bot,
    Lightbulb,
    TrendingUp,
    BookOpen,
    Target,
    RefreshCw,
    Copy,
    ThumbsUp,
    ThumbsDown,
    ChevronLeft,
    Sparkles,
    MessageSquare,
    Zap,
    Star,
    Clock,
    Award,
    Search,
    Mic,
    Paperclip
} from '@/lib/icons';

export default function AIAssistantPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI study assistant. I can help you with study recommendations, explain difficult concepts, or answer questions about your learning progress. How can I help you today?',
            timestamp: new Date(),
            liked: null
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Generate initial suggestions
        setSuggestions([
            { icon: Lightbulb, text: 'Study Tips', message: 'Give me some study tips for better learning' },
            { icon: TrendingUp, text: 'Progress', message: 'How am I doing with my studies?' },
            { icon: BookOpen, text: 'Explain', message: 'Can you explain calculus derivatives?' },
            { icon: Target, text: 'Goals', message: 'Help me set study goals for this week' }
        ]);
    }, []);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
            liked: null
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Get conversation history for context
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Get user context (this would typically come from the backend)
            const context = {
                // In a real implementation, this would come from user profile data
                subjects: ['Mathematics', 'Physics', 'Chemistry'],
                recentActivity: 'moderate',
                weakAreas: ['Calculus', 'Trigonometry']
            };

            // Call the AI chat endpoint
            const response = await api.post('/api/ai/chat', {
                message: inputMessage,
                context,
                conversationHistory
            });

            if (response && response.success) {
                const assistantMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.data.content || response.data,
                    timestamp: new Date(),
                    liked: null
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error(response?.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('AI Chat Error:', error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm currently experiencing technical difficulties. Please try again later or contact support.",
                timestamp: new Date(),
                liked: null
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const startNewChat = () => {
        setMessages([
            {
                id: '1',
                role: 'assistant',
                content: 'Hello! I\'m your AI study assistant. I can help you with study recommendations, explain difficult concepts, or answer questions about your learning progress. How can I help you today?',
                timestamp: new Date(),
                liked: null
            }
        ]);
        setConversationId(null);
        setInputMessage('');
        setSuggestions([
            { icon: Lightbulb, text: 'Study Tips', message: 'Give me some study tips for better learning' },
            { icon: TrendingUp, text: 'Progress', message: 'How am I doing with my studies?' },
            { icon: BookOpen, text: 'Explain', message: 'Can you explain calculus derivatives?' },
            { icon: Target, text: 'Goals', message: 'Help me set study goals for this week' }
        ]);
    };

    const handleQuickAction = (message) => {
        setInputMessage(message);
        textareaRef.current?.focus();
    };

    const handleLike = (messageId) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, liked: msg.liked === 'up' ? null : 'up' } : msg
        ));
    };

    const handleDislike = (messageId) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, liked: msg.liked === 'down' ? null : 'down' } : msg
        ));
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue via-blue-50 to-mindboost-cream">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-mindboost-light-green">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <Button asChild variant="ghost" className="hover:bg-mindboost-light-green/50 rounded-full">
                                <Link to="/dashboard/learner" className="flex items-center text-mindboost-dark-green">
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Link>
                            </Button>
                            <div className="flex items-center space-x-4">
                                <Badge className="bg-mindboost-light-green text-mindboost-dark-green border border-mindboost-green flex items-center">
                                    <div className="w-2 h-2 bg-mindboost-green rounded-full mr-2 animate-pulse"></div>
                                    Online
                                </Badge>
                                <Button
                                    onClick={startNewChat}
                                    variant="outline"
                                    className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 rounded-full"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    New Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Study Assistant</h1>
                            <p className="text-gray-600">Get personalized help with your studies 24/7</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-3">
                            <div className="flex items-center bg-mindboost-light-green/50 rounded-full px-4 py-2 border border-mindboost-green/20">
                                <Brain className="h-5 w-5 text-mindboost-green mr-2" />
                                <span className="font-medium text-mindboost-green">MindBoost AI v2.1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="px-4 sm:px-6 lg:px-8 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-mindboost-green to-mindboost-dark-green text-white">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xl font-bold">24/7</div>
                                        <div className="text-mindboost-light-green text-sm">Availability</div>
                                    </div>
                                    <Brain className="h-8 w-8 text-mindboost-light-green" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-mindboost-green to-mindboost-dark-green text-white">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xl font-bold">1000+</div>
                                        <div className="text-mindboost-light-green text-sm">Topics Covered</div>
                                    </div>
                                    <BookOpen className="h-8 w-8 text-mindboost-light-green" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-mindboost-purple to-mindboost-dark-purple text-white">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xl font-bold">95%</div>
                                        <div className="text-mindboost-light-purple text-sm">Satisfaction</div>
                                    </div>
                                    <ThumbsUp className="h-8 w-8 text-mindboost-light-purple" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="px-4 sm:px-6 lg:px-8 pb-6">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-gray-200 pb-4">
                            <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <Sparkles className="h-5 w-5 mr-2 text-mindboost-green" />
                                Conversation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex flex-col h-[calc(100vh-300px)]">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] md:max-w-[80%] rounded-2xl p-5 ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white rounded-br-none'
                                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {message.role === 'assistant' && (
                                                    <div className="p-2 bg-white/20 rounded-full">
                                                        <Bot className="h-5 w-5" />
                                                    </div>
                                                )}
                                                {message.role === 'user' && (
                                                    <div className="p-2 bg-white/20 rounded-full">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-medium mb-2 flex items-center justify-between">
                                                        <span>
                                                            {message.role === 'user' ? 'You' : 'AI Assistant'}
                                                        </span>
                                                        <span className="text-xs opacity-70">
                                                            {formatTime(message.timestamp)}
                                                        </span>
                                                    </div>
                                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                                </div>
                                            </div>

                                            {message.role === 'assistant' && (
                                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleLike(message.id)}
                                                            className={`p-1 h-8 w-8 ${message.liked === 'up'
                                                                ? 'text-green-500 bg-white/20'
                                                                : 'text-white/70 hover:text-white hover:bg-white/20'
                                                                }`}
                                                            aria-label="Like response"
                                                        >
                                                            <ThumbsUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDislike(message.id)}
                                                            className={`p-1 h-8 w-8 ${message.liked === 'down'
                                                                ? 'text-red-500 bg-white/20'
                                                                : 'text-white/70 hover:text-white hover:bg-white/20'
                                                                }`}
                                                            aria-label="Dislike response"
                                                        >
                                                            <ThumbsDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopy(message.content)}
                                                        className="p-1 h-8 w-8 text-white/70 hover:text-white hover:bg-white/20"
                                                        aria-label="Copy response"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-5">
                                            <div className="flex items-start space-x-3">
                                                <div className="p-2 bg-mindboost-green/10 rounded-full">
                                                    <Bot className="h-5 w-5 text-mindboost-green" />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Actions */}
                            {messages.length === 1 && (
                                <div className="px-6 pb-4 border-b border-gray-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {suggestions.map((action, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                onClick={() => handleQuickAction(action.message)}
                                                className="flex flex-col items-center justify-center h-20 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                                            >
                                                <action.icon className="h-5 w-5 mb-2" />
                                                <span className="text-xs">{action.text}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-6 border-t border-gray-200">
                                <div className="flex space-x-3">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            ref={textareaRef}
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask me anything about your studies..."
                                            className="flex-1 min-h-[60px] rounded-xl border-gray-300 focus:border-mindboost-green focus:ring-mindboost-green pr-20"
                                            disabled={isLoading}
                                            rows={2}
                                        />
                                        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                                                aria-label="Attach file"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                                                aria-label="Voice input"
                                            >
                                                <Mic className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="self-end h-[52px] bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-xl"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="mt-3 text-xs text-gray-500 flex items-center">
                                    <Zap className="h-3 w-3 mr-1" />
                                    AI Assistant may produce inaccurate information. Verify important details.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}