import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@shared/api';
import { useAuth } from '@/hooks/use-auth';
import {
    BookOpen,
    FileText,
    Video,
    Link as LinkIcon,
    Search,
    Download,
    Bookmark,
    Filter,
    Book,
    Calculator,
    Atom,
    Flask,
    PenTool,
    Globe,
    ChevronLeft,
    Clock,
    Eye,
    Star,
    Share2,
    Tag,
    Grid,
    List,
    SortAsc,
    Calendar,
    User
} from '@/lib/icons';

const resourceCategories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'math', name: 'Mathematics', icon: Calculator },
    { id: 'physics', name: 'Physics', icon: Atom },
    { id: 'chemistry', name: 'Chemistry', icon: Flask },
    { id: 'biology', name: 'Biology', icon: Book },
    { id: 'literature', name: 'Literature', icon: PenTool },
    { id: 'languages', name: 'Languages', icon: Globe }
];

const resourceTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'pdf', name: 'PDF Documents' },
    { id: 'video', name: 'Videos' },
    { id: 'article', name: 'Articles' },
    { id: 'link', name: 'External Links' }
];

export default function Resources() {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeType, setActiveType] = useState('all');
    const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/resources');

            if (response.success) {
                // Transform the data to match the existing structure
                const transformedResources = response.data.map(resource => ({
                    id: resource.id,
                    title: resource.title,
                    type: resource.type || 'pdf',
                    category: resource.category || 'general',
                    description: resource.description,
                    size: resource.size || '2.4 MB',
                    downloads: resource.downloads || 0,
                    views: resource.views || 0,
                    bookmarked: resource.bookmarked || false,
                    duration: resource.duration || '10:00',
                    readingTime: resource.readingTime || '5 min',
                    author: resource.author || 'MindBoost Team',
                    createdAt: resource.createdAt || new Date(),
                    tags: resource.tags || [],
                    rating: resource.rating || 4.5
                }));

                setResources(transformedResources);
            }
        } catch (err) {
            setError('Failed to fetch resources');
            console.error('Error fetching resources:', err);

            // Fallback to mock data
            const mockResources = [
                {
                    id: '1',
                    title: 'Calculus Fundamentals',
                    type: 'pdf',
                    category: 'math',
                    description: 'Comprehensive guide to calculus principles and applications with practice problems',
                    size: '2.4 MB',
                    downloads: 1240,
                    views: 2100,
                    bookmarked: true,
                    author: 'Dr. Sarah Johnson',
                    createdAt: '2024-01-15',
                    tags: ['calculus', 'derivatives', 'integrals'],
                    rating: 4.8
                },
                {
                    id: '2',
                    title: 'Newton\'s Laws of Motion',
                    type: 'video',
                    category: 'physics',
                    description: 'Interactive video explaining Newton\'s three laws with real-world examples',
                    duration: '15:30',
                    views: 890,
                    bookmarked: false,
                    author: 'Prof. Michael Chen',
                    createdAt: '2024-01-12',
                    tags: ['physics', 'mechanics', 'forces'],
                    rating: 4.6
                },
                {
                    id: '3',
                    title: 'Periodic Table Reference',
                    type: 'pdf',
                    category: 'chemistry',
                    description: 'Complete periodic table with atomic properties and trends for quick reference',
                    size: '1.8 MB',
                    downloads: 2100,
                    views: 3200,
                    bookmarked: true,
                    author: 'Dr. Emily Rodriguez',
                    createdAt: '2024-01-10',
                    tags: ['periodic table', 'elements', 'chemistry'],
                    rating: 4.9
                },
                {
                    id: '4',
                    title: 'Cell Biology Overview',
                    type: 'article',
                    category: 'biology',
                    description: 'Detailed article covering cell structure and function with diagrams',
                    readingTime: '8 min',
                    views: 1560,
                    bookmarked: false,
                    author: 'Dr. James Wilson',
                    createdAt: '2024-01-08',
                    tags: ['cells', 'biology', 'organelles'],
                    rating: 4.7
                },
                {
                    id: '5',
                    title: 'Shakespearean Literature Guide',
                    type: 'pdf',
                    category: 'literature',
                    description: 'Analysis of major Shakespeare works and themes with character maps',
                    size: '3.2 MB',
                    downloads: 980,
                    views: 1420,
                    bookmarked: false,
                    author: 'Prof. Lisa Anderson',
                    createdAt: '2024-01-05',
                    tags: ['shakespeare', 'literature', 'analysis'],
                    rating: 4.5
                },
                {
                    id: '6',
                    title: 'French Grammar Essentials',
                    type: 'video',
                    category: 'languages',
                    description: 'Beginner\'s guide to French grammar rules and exceptions with examples',
                    duration: '22:15',
                    views: 1420,
                    bookmarked: true,
                    author: 'Dr. Marie Dubois',
                    createdAt: '2024-01-03',
                    tags: ['french', 'grammar', 'language'],
                    rating: 4.4
                },
                {
                    id: '7',
                    title: 'Trigonometry Cheat Sheet',
                    type: 'pdf',
                    category: 'math',
                    description: 'Essential trigonometry formulas and identities for quick reference',
                    size: '1.1 MB',
                    downloads: 3200,
                    views: 4500,
                    bookmarked: false,
                    author: 'Dr. Robert Taylor',
                    createdAt: '2024-01-01',
                    tags: ['trigonometry', 'math', 'formulas'],
                    rating: 4.9
                },
                {
                    id: '8',
                    title: 'Electromagnetism Basics',
                    type: 'video',
                    category: 'physics',
                    description: 'Introduction to electromagnetic fields and applications with demonstrations',
                    duration: '18:45',
                    views: 760,
                    bookmarked: false,
                    author: 'Prof. David Kim',
                    createdAt: '2023-12-28',
                    tags: ['physics', 'electromagnetism', 'fields'],
                    rating: 4.3
                }
            ];

            setResources(mockResources);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
            case 'video': return <Video className="h-5 w-5 text-blue-500" />;
            case 'article': return <BookOpen className="h-5 w-5 text-green-500" />;
            case 'link': return <LinkIcon className="h-5 w-5 text-purple-500" />;
            default: return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeName = (type) => {
        switch (type) {
            case 'pdf': return 'PDF Document';
            case 'video': return 'Video';
            case 'article': return 'Article';
            case 'link': return 'External Link';
            default: return 'Resource';
        }
    };

    const getCategoryIcon = (category) => {
        const cat = resourceCategories.find(c => c.id === category);
        return cat ? <cat.icon className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />;
    };

    const getCategoryName = (category) => {
        const cat = resourceCategories.find(c => c.id === category);
        return cat ? cat.name : 'General';
    };

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
        const matchesType = activeType === 'all' || resource.type === activeType;
        const matchesBookmark = !bookmarkedOnly || resource.bookmarked;
        return matchesSearch && matchesCategory && matchesType && matchesBookmark;
    });

    const sortedResources = [...filteredResources].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'popular') {
            return (b.downloads + b.views) - (a.downloads + a.views);
        } else if (sortBy === 'rating') {
            return b.rating - a.rating;
        } else {
            return a.title.localeCompare(b.title);
        }
    });

    const toggleBookmark = (resourceId) => {
        setResources(prevResources =>
            prevResources.map(resource =>
                resource.id === resourceId
                    ? { ...resource, bookmarked: !resource.bookmarked }
                    : resource
            )
        );

        // In a real app, this would make an API call
        console.log(`Toggling bookmark for resource ${resourceId}`);
    };

    const handleDownload = (resourceId) => {
        // In a real app, this would trigger the download
        console.log(`Downloading resource ${resourceId}`);

        // Update download count
        setResources(prevResources =>
            prevResources.map(resource =>
                resource.id === resourceId
                    ? { ...resource, downloads: resource.downloads + 1 }
                    : resource
            )
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex items-center mb-8">
                        <Button asChild variant="ghost" className="hover:bg-mindboost-light-green/50 rounded-full mr-4">
                            <Link to="/dashboard/learner" className="flex items-center text-mindboost-dark-green">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="h-8 w-64 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8">
                        <div className="h-12 w-full max-w-md bg-gray-200 rounded-xl animate-pulse mb-4"></div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Resources</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Button
                        onClick={fetchResources}
                        className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Back Button */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Button asChild variant="ghost" className="hover:bg-mindboost-light-green/50 rounded-full mr-4">
                            <Link to="/dashboard/learner" className="flex items-center text-mindboost-dark-green">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
                            <p className="text-gray-600">Access study materials, videos, and documents to enhance your learning</p>
                        </div>
                    </div>
                    <Button className="mt-4 md:mt-0 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Search resources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 py-6 rounded-xl border-gray-300 focus:border-mindboost-green focus:ring-mindboost-green"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant={bookmarkedOnly ? 'default' : 'outline'}
                                onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                                className={`rounded-full ${bookmarkedOnly
                                        ? 'bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Bookmark className="h-4 w-4 mr-2" />
                                Bookmarked
                            </Button>
                            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-none px-3 ${viewMode === 'grid'
                                            ? 'bg-mindboost-green text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-none px-3 ${viewMode === 'list'
                                            ? 'bg-mindboost-green text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Category and Type Filters */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {resourceCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Button
                                    key={category.id}
                                    variant={activeCategory === category.id ? 'default' : 'outline'}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`flex items-center rounded-full ${activeCategory === category.id
                                            ? 'bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {category.name}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {resourceTypes.map((type) => (
                            <Button
                                key={type.id}
                                variant={activeType === type.id ? 'default' : 'outline'}
                                onClick={() => setActiveType(type.id)}
                                className={`rounded-full ${activeType === type.id
                                        ? 'bg-gradient-to-r from-mindboost-blue to-mindboost-dark-blue text-white hover:from-mindboost-blue/90 hover:to-mindboost-dark-blue/90'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {type.name}
                            </Button>
                        ))}

                        <div className="flex items-center ml-auto">
                            <span className="text-gray-700 mr-2">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mindboost-green"
                            >
                                <option value="newest">Newest</option>
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="alphabetical">A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-green to-mindboost-dark-green text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">{resources.length}</div>
                                    <div className="text-mindboost-light-green">Total Resources</div>
                                </div>
                                <BookOpen className="h-10 w-10 text-mindboost-light-green" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-blue to-mindboost-dark-blue text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">
                                        {resources.filter(r => r.type === 'pdf').length}
                                    </div>
                                    <div className="text-mindboost-light-blue">Documents</div>
                                </div>
                                <FileText className="h-10 w-10 text-mindboost-light-blue" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-purple to-mindboost-dark-purple text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">
                                        {resources.filter(r => r.type === 'video').length}
                                    </div>
                                    <div className="text-mindboost-light-purple">Videos</div>
                                </div>
                                <Video className="h-10 w-10 text-mindboost-light-purple" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-mindboost-cream to-mindboost-light-green text-gray-900">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-3xl font-bold">
                                        {resources.filter(r => r.bookmarked).length}
                                    </div>
                                    <div className="text-mindboost-dark-green">Bookmarked</div>
                                </div>
                                <Bookmark className="h-10 w-10 text-mindboost-dark-green" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Resources Grid/List */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedResources.map((resource) => (
                            <Card key={resource.id} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all rounded-2xl overflow-hidden">
                                <CardHeader className="pb-4 bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            {getTypeIcon(resource.type)}
                                            <div className="ml-3">
                                                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">{resource.title}</CardTitle>
                                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {resource.author}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleBookmark(resource.id)}
                                            className={`p-0 w-8 h-8 ${resource.bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                            aria-label={resource.bookmarked ? "Remove bookmark" : "Bookmark resource"}
                                        >
                                            <Bookmark className={`h-5 w-5 ${resource.bookmarked ? 'fill-current' : ''}`} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-gray-700 mb-4 line-clamp-2">{resource.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge className="bg-mindboost-light-green text-mindboost-dark-green border border-mindboost-green flex items-center gap-1">
                                            {getCategoryIcon(resource.category)}
                                            {getCategoryName(resource.category)}
                                        </Badge>
                                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                                            {getTypeName(resource.type)}
                                        </Badge>
                                        {resource.tags.slice(0, 2).map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                                                <Tag className="h-3 w-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                        {resource.tags.length > 2 && (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                +{resource.tags.length - 2}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>
                                                {resource.size && `Size: ${resource.size}`}
                                                {resource.duration && `Duration: ${resource.duration}`}
                                                {resource.readingTime && `Read: ${resource.readingTime}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                                            <span>{resource.rating}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            <span>{resource.views} views</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Download className="h-4 w-4 mr-1" />
                                            <span>{resource.downloads} downloads</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        <Button
                                            onClick={() => handleDownload(resource.id)}
                                            className="flex-1 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 rounded-full"
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {sortedResources.map((resource) => (
                                    <div key={resource.id} className="p-6 hover:bg-mindboost-light-green/30 transition-colors">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-12 h-12 bg-mindboost-light-blue/50 rounded-lg flex items-center justify-center mr-4 border border-mindboost-blue/20">
                                                {getTypeIcon(resource.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{resource.title}</h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleBookmark(resource.id)}
                                                        className={`p-0 w-8 h-8 ${resource.bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                                        aria-label={resource.bookmarked ? "Remove bookmark" : "Bookmark resource"}
                                                    >
                                                        <Bookmark className={`h-5 w-5 ${resource.bookmarked ? 'fill-current' : ''}`} />
                                                    </Button>
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1 line-clamp-1">{resource.description}</p>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <Badge className="bg-mindboost-light-green text-mindboost-dark-green border border-mindboost-green text-xs">
                                                        {getCategoryName(resource.category)}
                                                    </Badge>
                                                    <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">
                                                        {getTypeName(resource.type)}
                                                    </Badge>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <User className="h-3 w-3 mr-1" />
                                                        {resource.author}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {new Date(resource.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                                                        {resource.rating}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex items-center space-x-2">
                                                <div className="text-right text-sm text-gray-500 min-w-24">
                                                    <div>{resource.views} views</div>
                                                    <div>{resource.downloads} downloads</div>
                                                </div>
                                                <Button
                                                    onClick={() => handleDownload(resource.id)}
                                                    className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {sortedResources.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                        <Button
                            onClick={() => {
                                setSearchTerm('');
                                setActiveCategory('all');
                                setActiveType('all');
                                setBookmarkedOnly(false);
                            }}
                            className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}