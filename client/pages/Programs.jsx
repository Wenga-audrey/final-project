import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Search,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  Filter,
  Target,
} from "@/lib/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const programs = [
    {
      id: 1,
      name: "ENAM Preparation Program",
      category: "Administration",
      duration: "6 months",
      level: "Advanced",
      students: "1,200+",
      description: "Comprehensive preparation for the École Nationale d'Administration et de Magistrature entrance exam.",
      subjects: ["Public Administration", "Law", "Political Science", "Economics"],
      institution: "ENAM",
      successRate: "98%",
    },
    {
      id: 2,
      name: "ENS Preparation Program",
      category: "Education",
      duration: "8 months",
      level: "Advanced",
      students: "950+",
      description: "Specialized program for École Normale Supérieure entrance exam preparation.",
      subjects: ["Pedagogy", "Literature", "Languages", "Psychology"],
      institution: "ENS",
      successRate: "97%",
    },
    {
      id: 3,
      name: "Police Academy Preparation",
      category: "Security",
      duration: "4 months",
      level: "Intermediate",
      students: "2,100+",
      description: "Intensive training program for Police Nationale entrance requirements.",
      subjects: ["Law Enforcement", "Physical Training", "Criminal Justice", "Ethics"],
      institution: "Police Nationale",
      successRate: "95%",
    },
    {
      id: 4,
      name: "Customs Officer Program",
      category: "Finance",
      duration: "5 months",
      level: "Intermediate",
      students: "800+",
      description: "Preparation for Douanes (Customs) entrance examination.",
      subjects: ["International Trade", "Economics", "Law", "Mathematics"],
      institution: "Douanes",
      successRate: "96%",
    },
    {
      id: 5,
      name: "Gendarmerie Preparation",
      category: "Security",
      duration: "4 months",
      level: "Intermediate",
      students: "1,800+",
      description: "Military-style preparation for Gendarmerie Nationale entrance exam.",
      subjects: ["Military Science", "Law Enforcement", "Physical Training", "Security"],
      institution: "Gendarmerie",
      successRate: "94%",
    },
    {
      id: 6,
      name: "Diplomatic Corps Program",
      category: "Diplomacy",
      duration: "10 months",
      level: "Advanced",
      students: "400+",
      description: "Advanced preparation for IRIC (International Relations Institute) entrance exam.",
      subjects: ["International Relations", "Diplomacy", "Political Science", "Languages"],
      institution: "IRIC",
      successRate: "99%",
    },
  ];

  const categories = [
    { id: "all", name: "All Programs" },
    { id: "Administration", name: "Administration" },
    { id: "Education", name: "Education" },
    { id: "Security", name: "Security" },
    { id: "Finance", name: "Finance" },
    { id: "Diplomacy", name: "Diplomacy" },
  ];

  const levels = [
    { id: "all", name: "All Levels" },
    { id: "Beginner", name: "Beginner" },
    { id: "Intermediate", name: "Intermediate" },
    { id: "Advanced", name: "Advanced" },
  ];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.subjects.some(subject =>
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = selectedCategory === "all" || program.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Study Programs
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Explore all available study programs across different institutions, with detailed career prospects and professional opportunities.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mindboost-slate" />
              <Input
                type="text"
                placeholder="Search programs, institutions, or subjects..."
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
                  <GraduationCap className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">25+</div>
                <div className="text-gray-600">Programs</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-mindboost-blue" />
                </div>
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-gray-600">Subjects</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-mindboost-dark-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">8,000+</div>
                <div className="text-gray-600">Students Enrolled</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-light-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-mindboost-light-blue" />
                </div>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-gray-600">Avg. Success Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-mindboost-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${selectedCategory === category.id
                    ? "bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                    : "bg-white text-mindboost-green border-mindboost-green hover:bg-mindboost-green/10"
                  }`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No programs found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
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
                  {selectedCategory === "all" ? "All Programs" : `${selectedCategory} Programs`}
                </h2>
                <p className="text-gray-600">
                  {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPrograms.map((program) => (
                  <Card
                    key={program.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{program.name}</h3>
                          <div className="text-sm text-gray-600">{program.institution}</div>
                        </div>
                        <Badge variant="secondary" className="bg-mindboost-light-green text-mindboost-green">
                          {program.category}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm">{program.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {program.subjects.slice(0, 3).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {program.subjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{program.subjects.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-2 bg-mindboost-light-green/50 rounded-lg">
                          <div className="text-sm font-bold text-mindboost-green">{program.duration}</div>
                          <div className="text-xs text-gray-600">Duration</div>
                        </div>
                        <div className="text-center p-2 bg-mindboost-light-blue/50 rounded-lg">
                          <div className="text-sm font-bold text-mindboost-blue">{program.level}</div>
                          <div className="text-xs text-gray-600">Level</div>
                        </div>
                        <div className="text-center p-2 bg-mindboost-cream/50 rounded-lg">
                          <div className="text-sm font-bold text-mindboost-dark-green">{program.successRate}</div>
                          <div className="text-xs text-gray-600">Success</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {program.students}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {program.level}
                        </Badge>
                      </div>

                      <Button asChild className="w-full bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                        <Link to={`/program/${program.id}`}>
                          View Program Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
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
            Find the Perfect Program for Your Career Goals
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Explore our comprehensive programs designed to help you succeed in your chosen field.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-mindboost-green hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-lg">
              <Link to="/courses">
                Browse All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full">
              <Link to="/contact">
                Get Personalized Advice
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}