import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  Settings,
  ChevronLeft,
  CheckCircle,
  BookOpen,
  MessageCircle,
  Download,
  Share,
  ThumbsUp,
  ThumbsDown
} from "@/lib/icons";

export default function LessonPlayer() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const videoRef = useRef(null);

  // Mock lesson data
  const lesson = {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'Learn the fundamentals of calculus including limits, derivatives, and integrals.',
    duration: '25:30',
    course: 'Advanced Mathematics',
    instructor: 'Dr. Smith',
    thumbnail: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&h=450&fit=crop',
    videoUrl: '#',
    resources: [
      { id: '1', title: 'Lesson Slides', type: 'pdf' },
      { id: '2', title: 'Practice Problems', type: 'pdf' },
      { id: '3', title: 'Additional Reading', type: 'link' }
    ]
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e) => {
    setProgress(parseInt(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalTime = 1530; // 25:30 in seconds
  const currentTime = (progress / 100) * totalTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/courses/1">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Video Container */}
                <div className="relative bg-black aspect-video rounded-t-2xl overflow-hidden">
                  <img
                    src={lesson.thumbnail}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex items-center text-white text-sm mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span className="mx-2">/</span>
                      <span>{lesson.duration}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>

                {/* Video Controls */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
                      <p className="text-gray-600">{lesson.course} • {lesson.instructor}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <ThumbsUp className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <ThumbsDown className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <Share className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <Download className="h-5 w-5" />
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => setShowSettings(!showSettings)}
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                        {showSettings && (
                          <Card className="absolute right-0 mt-2 w-48 z-10">
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-900">Playback Speed</div>
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                  <Button
                                    key={rate}
                                    variant="ghost"
                                    size="sm"
                                    className={`w-full justify-start text-sm ${playbackRate === rate ? 'bg-blue-50 text-blue-600' : ''
                                      }`}
                                    onClick={() => {
                                      setPlaybackRate(rate);
                                      setShowSettings(false);
                                    }}
                                  >
                                    {rate}x
                                  </Button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                      onClick={togglePlay}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <SkipBack className="h-5 w-5 mr-2" />
                      Previous
                    </Button>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <SkipForward className="h-5 w-5 mr-2" />
                      Next
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-5 w-5 text-gray-600" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-700"
                      />
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Description */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Lesson Description</h2>
                <p className="text-gray-700 mb-6">{lesson.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {lesson.instructor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{lesson.instructor}</div>
                      <div className="text-sm text-gray-600">Instructor</div>
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Resources */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>
                <div className="space-y-3">
                  {lesson.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-600">{resource.type.toUpperCase()}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Discussion */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Discussion</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-800 font-bold text-xs mr-3 mt-1">
                      S
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Sarah Johnson</div>
                      <div className="text-sm text-gray-600 mb-1">
                        Does anyone understand the concept of limits? I'm having trouble with the epsilon-delta definition.
                      </div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold text-xs mr-3 mt-1">
                      M
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Michael Chen</div>
                      <div className="text-sm text-gray-600 mb-1">
                        I found this Khan Academy video helpful for understanding limits: [link]
                      </div>
                      <div className="text-xs text-gray-500">1 hour ago</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Join Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
