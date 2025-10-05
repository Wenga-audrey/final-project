import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import DashboardLayout from '@/components/DashboardLayout';
import {
  BookOpen,
  Upload,
  FileText,
  Video,
  Mic, // Using Mic instead of FileAudio
  Camera, // Using Camera instead of Image
  Link,
  Plus,
  Trash2,
  Sparkles,
  Target,
  Save,
  ArrowLeft,
  RefreshCw // Using RefreshCw instead of Loader2
} from '@/lib/icons';

export default function InstructorContentUpload() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'lesson',
    content: '',
    aiPrompt: ''
  });
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ]
  });

  useEffect(() => {
    fetchSubjectDetails();
  }, [subjectId]);

  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      // Use new endpoint structure
      const response = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.DETAIL(subjectId));
      if (response.success) {
        setSubject(response.data);
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subject details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuizInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      };
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData(prev => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[questionIndex].options];
      newOptions[optionIndex] = value;
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newOptions
      };
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const addQuestion = () => {
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const generateAIContent = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt for AI content generation',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAiGenerating(true);
      // Use new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.AI.GENERATE_CONTENT, {
        subjectId,
        prompt: formData.aiPrompt
      });

      if (response.success) {
        setFormData(prev => ({
          ...prev,
          content: response.data.content
        }));
        toast({
          title: 'Content Generated',
          description: 'AI has successfully generated content for your lesson'
        });
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI content',
        variant: 'destructive'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const generateAIQuiz = async () => {
    if (!formData.aiPrompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt for AI quiz generation',
        variant: 'destructive'
      });
      return;
    }

    try {
      setAiGenerating(true);
      // Use new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.AI.GENERATE_QUIZ, {
        subjectId,
        prompt: formData.aiPrompt
      });

      if (response.success) {
        setQuizData(prev => ({
          ...prev,
          title: response.data.title || prev.title,
          description: response.data.description || prev.description,
          questions: response.data.questions || prev.questions
        }));
        toast({
          title: 'Quiz Generated',
          description: 'AI has successfully generated a quiz for your subject'
        });
      }
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI quiz',
        variant: 'destructive'
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const uploadContent = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      // Use new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.INSTRUCTOR.UPLOAD_CONTENT(subjectId), {
        ...formData
      });

      if (response.success) {
        toast({
          title: 'Content Uploaded',
          description: 'Your content has been successfully uploaded'
        });
        // Reset form
        setFormData({
          title: '',
          description: '',
          contentType: 'lesson',
          content: '',
          aiPrompt: ''
        });
      }
    } catch (error) {
      console.error('Error uploading content:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload content',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadQuiz = async () => {
    if (!quizData.title.trim() || quizData.questions.some(q => !q.question.trim())) {
      toast({
        title: 'Required Fields',
        description: 'Please fill in all required quiz fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      // Use new endpoint structure
      const response = await api.post(`/api/instructor/subjects/${subjectId}/quizzes`, {
        ...quizData
      });

      if (response.success) {
        toast({
          title: 'Quiz Uploaded',
          description: 'Your quiz has been successfully uploaded'
        });
        // Reset form
        setQuizData({
          title: '',
          description: '',
          questions: [
            {
              question: '',
              options: ['', '', '', ''],
              correctAnswer: 0,
              explanation: ''
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error uploading quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload quiz',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-mindboost-green rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600">Loading subject details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Content Upload</h1>
            <p className="text-gray-600 mt-2">
              Upload new content for {subject?.name || 'this subject'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Creation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-mindboost-green" />
                  Create New Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter content title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contentType" className="text-sm font-medium text-gray-700">
                      Content Type
                    </Label>
                    <Select name="contentType" value={formData.contentType} onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson">Lesson</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter content description"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                    Content *
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter your content here..."
                    className="mt-1"
                    rows={10}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={uploadContent}
                    disabled={uploading}
                    className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Content
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Content Generation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-mindboost-green" />
                  AI Content Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="aiPrompt" className="text-sm font-medium text-gray-700">
                    AI Prompt
                  </Label>
                  <Textarea
                    id="aiPrompt"
                    name="aiPrompt"
                    value={formData.aiPrompt}
                    onChange={handleInputChange}
                    placeholder="Describe what content you want AI to generate..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={generateAIContent}
                    disabled={aiGenerating}
                    className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                  >
                    {aiGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Lesson Content
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={generateAIQuiz}
                    disabled={aiGenerating}
                    variant="outline"
                    className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                  >
                    {aiGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Creation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-mindboost-green" />
                  Create Quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="quizTitle" className="text-sm font-medium text-gray-700">
                      Quiz Title *
                    </Label>
                    <Input
                      id="quizTitle"
                      name="title"
                      value={quizData.title}
                      onChange={handleQuizInputChange}
                      placeholder="Enter quiz title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quizDescription" className="text-sm font-medium text-gray-700">
                      Description
                    </Label>
                    <Input
                      id="quizDescription"
                      name="description"
                      value={quizData.description}
                      onChange={handleQuizInputChange}
                      placeholder="Enter quiz description"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                  {quizData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                        {quizData.questions.length > 1 && (
                          <Button
                            onClick={() => removeQuestion(qIndex)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Question Text *
                          </Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                            placeholder="Enter your question"
                            className="mt-1"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Options
                          </Label>
                          <div className="space-y-3 mt-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center">
                                <span className="mr-3 text-sm font-medium text-gray-700 w-8">
                                  {String.fromCharCode(65 + oIndex)}.
                                </span>
                                <Input
                                  value={option}
                                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Correct Answer
                            </Label>
                            <Select value={question.correctAnswer} onValueChange={(value) => handleQuestionChange(qIndex, 'correctAnswer', parseInt(value))}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent>
                                {question.options.map((_, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {String.fromCharCode(65 + index)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-700">
                              Explanation
                            </Label>
                            <Input
                              value={question.explanation}
                              onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                              placeholder="Explanation for the answer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <Button
                      onClick={addQuestion}
                      variant="outline"
                      className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>

                    <Button
                      onClick={uploadQuiz}
                      disabled={uploading}
                      className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Info */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-mindboost-green rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{subject?.name}</h3>
                      <p className="text-sm text-gray-600">{subject?.examType}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Instructor: {subject?.instructor?.name || 'You'}</p>
                    <p>Students enrolled: {subject?._count?.enrollments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Types */}
            <Card>
              <CardHeader>
                <CardTitle>Content Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-mindboost-light-green/50 rounded-lg">
                    <FileText className="h-5 w-5 text-mindboost-green" />
                    <span className="text-sm font-medium">Lessons</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-mindboost-light-green/50 rounded-lg">
                    <Video className="h-5 w-5 text-mindboost-green" />
                    <span className="text-sm font-medium">Videos</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-mindboost-light-green/50 rounded-lg">
                    <Mic className="h-5 w-5 text-mindboost-green" />
                    <span className="text-sm font-medium">Audio</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-mindboost-light-green/50 rounded-lg">
                    <Camera className="h-5 w-5 text-mindboost-green" />
                    <span className="text-sm font-medium">Images</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-mindboost-light-green/50 rounded-lg">
                    <Link className="h-5 w-5 text-mindboost-green" />
                    <span className="text-sm font-medium">External Resources</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Content Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-mindboost-green mr-2">•</span>
                    Keep lessons concise and focused
                  </li>
                  <li className="flex items-start">
                    <span className="text-mindboost-green mr-2">•</span>
                    Use real-world examples
                  </li>
                  <li className="flex items-start">
                    <span className="text-mindboost-green mr-2">•</span>
                    Include interactive elements
                  </li>
                  <li className="flex items-start">
                    <span className="text-mindboost-green mr-2">•</span>
                    Provide clear learning objectives
                  </li>
                  <li className="flex items-start">
                    <span className="text-mindboost-green mr-2">•</span>
                    Test quizzes before publishing
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}