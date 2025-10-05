import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Video,
  FileText,
  Play,
  Clock,
  Users,
  ArrowRight,
  Bookmark,
} from "@/lib/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Ressources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const resources = [
    {
      id: 1,
      title: "ENAM Entrance Exam Study Guide",
      category: "Administration",
      type: "PDF",
      duration: "120 pages",
      level: "Advanced",
      downloads: "2,500+",
      description: "Comprehensive study guide covering all subjects for ENAM entrance examination.",
      subjects: ["Public Administration", "Law", "Political Science", "Economics"],
      thumbnail: null,
    },
    {
      id: 2,
      title: "ENS Pedagogy Masterclass",
      category: "Education",
      type: "Video",
      duration: "4 hours",
      level: "Advanced",
      downloads: "1,800+",
      description: "In-depth video course on pedagogical theories and teaching methods for ENS preparation.",
      subjects: ["Pedagogy", "Educational Psychology", "Curriculum Design"],
      thumbnail: null,
    },
    {
      id: 3,
      title: "Police Academy Physical Training Manual",
      category: "Security",
      type: "PDF",
      duration: "80 pages",
      level: "Intermediate",
      downloads: "3,200+",
      description: "Complete physical training program for Police Nationale entrance requirements.",
      subjects: ["Physical Fitness", "Martial Arts", "Endurance Training"],
      thumbnail: null,
    },
    {
      id: 4,
      title: "Customs Law and Regulations",
      category: "Finance",
      type: "Document",
      duration: "200 pages",
      level: "Intermediate",
      downloads: "1,500+",
      description: "Comprehensive guide to customs laws, international trade regulations, and procedures.",
      subjects: ["Customs Law", "International Trade", "Taxation"],
      thumbnail: null,
    },
    {
      id: 5,
      title: "Gendarmerie Military Protocol",
      category: "Security",
      type: "Video",
      duration: "3 hours",
      level: "Intermediate",
      downloads: "2,100+",
      description: "Military protocol and discipline training for Gendarmerie Nationale candidates.",
      subjects: ["Military Science", "Protocol", "Discipline"],
      thumbnail: null,
    },
    {
      id: 6,
      title: "Diplomatic Protocol Handbook",
      category: "Diplomacy",
      type: "PDF",
      duration: "150 pages",
      level: "Advanced",
      downloads: "900+",
      description: "Essential guide to diplomatic protocol, etiquette, and international relations.",
      subjects: ["Diplomatic Protocol", "Etiquette", "International Relations"],
      thumbnail: null,
    },
    {
      id: 7,
      title: "Current Affairs Weekly Digest",
      category: "General",
      type: "Document",
      duration: "20 pages/week",
      level: "All Levels",
      downloads: "5,000+",
      description: "Weekly updates on national and international current affairs for all entrance exams.",
      subjects: ["Current Affairs", "Politics", "Economics", "Culture"],
      thumbnail: null,
    },
    {
      id: 8,
      title: "Mathematics for Entrance Exams",
      category: "General",
      type: "Video",
      duration: "6 hours",
      level: "Beginner",
      downloads: "4,200+",
      description: "Foundational mathematics course covering all topics required for entrance examinations.",
      subjects: ["Algebra", "Geometry", "Statistics", "Calculus"],
      thumbnail: null,
    },
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "Administration", name: "Administration" },
    { id: "Education", name: "Education" },
    { id: "Security", name: "Security" },
    { id: "Finance", name: "Finance" },
    { id: "Diplomacy", name: "Diplomacy" },
    { id: "General", name: "General" },
  ];

  const types = [
    { id: "all", name: "All Types" },
    { id: "PDF", name: "PDF Documents" },
    { id: "Video", name: "Video Courses" },
    { id: "Document", name: "Documents" },
  ];

  const levels = [
    { id: "all", name: "All Levels" },
    { id: "Beginner", name: "Beginner" },
    { id: "Intermediate", name: "Intermediate" },
    { id: "Advanced", name: "Advanced" },
    { id: "All Levels", name: "All Levels" },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.subjects.some(subject =>
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "PDF": return <FileText className="h-5 w-5 text-red-500" />;
      case "Video": return <Video className="h-5 w-5 text-blue-500" />;
      case "Document": return <FileText className="h-5 w-5 text-green-500" />;
      default: return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mindboost-green to-mindboost-dark-green py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-6">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Learning Resources
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Access our comprehensive library of courses, documents, videos, and educational tools for your exam preparation.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mindboost-slate" />
              <Input
                type="text"
                placeholder="Search resources, subjects, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 rounded-2xl border-0 text-lg shadow-lg focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">150+</div>
                <div className="text-gray-600">Resources</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="h-6 w-6 text-mindboost-blue" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Video Courses</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-mindboost-dark-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-gray-600">Documents</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-light-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-mindboost-light-blue" />
                </div>
                <div className="text-2xl font-bold text-gray-900">15,000+</div>
                <div className="text-gray-600">Students Served</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-mindboost-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`rounded-full px-4 py-2 text-sm ${selectedCategory === category.id
                      ? "bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                      : "bg-white text-mindboost-green border-mindboost-green hover:bg-mindboost-green/10"
                    }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={`rounded-full px-4 py-2 text-sm ${selectedType === type.id
                      ? "bg-mindboost-blue hover:bg-mindboost-blue/90 text-white"
                      : "bg-white text-mindboost-blue border-mindboost-blue hover:bg-mindboost-blue/10"
                    }`}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredResources.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedType("all");
                }}
                className="bg-mindboost-green hover:bg-mindboost-green/90 text-white"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Learning Resources
                </h2>
                <p className="text-gray-600">
                  {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredResources.map((resource) => (
                  <Card
                    key={resource.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="relative">
                      <div className="h-40 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green flex items-center justify-center">
                        <div className="text-center text-white">
                          {getTypeIcon(resource.type)}
                          <div className="text-xl font-bold mt-2">{resource.type}</div>
                        </div>
                      </div>
                      <Badge className="absolute top-4 right-4 bg-white text-mindboost-green">
                        {resource.level}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Clock className="h-4 w-4 mr-1" />
                        {resource.duration}
                      </div>

                      <p className="text-gray-600 mb-4 text-sm">{resource.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.subjects.slice(0, 3).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {resource.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {resource.downloads}
                        </div>
                        <Badge variant="secondary" className="bg-mindboost-light-green text-mindboost-green">
                          {resource.category}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Access Premium Resources
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Unlock our complete library of premium educational resources to accelerate your exam preparation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-mindboost-green hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-lg">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full">
              <Link to="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}