import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building,
  Search,
  MapPin,
  Users,
  Trophy,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Filter,
} from "@/lib/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Institutions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const institutions = [
    {
      id: 1,
      name: "ENAM (École Nationale d'Administration et de Magistrature)",
      acronym: "ENAM",
      location: "Yaoundé",
      type: "Public",
      category: "Administration",
      students: "2,500+",
      successRate: "98%",
      description: "Leading institution for training future administrators and magistrates in Cameroon.",
      specialties: ["Public Administration", "Law", "Political Science"],
      imageUrl: null,
    },
    {
      id: 2,
      name: "ENS (École Normale Supérieure)",
      acronym: "ENS",
      location: "Yaoundé",
      type: "Public",
      category: "Education",
      students: "1,800+",
      successRate: "97%",
      description: "Premier institution for training secondary school teachers and educational leaders.",
      specialties: ["Education", "Literature", "Languages"],
      imageUrl: null,
    },
    {
      id: 3,
      name: "Police Nationale",
      acronym: "Police",
      location: "Nationwide",
      type: "Public",
      category: "Security",
      students: "5,000+",
      successRate: "95%",
      description: "National police force training institution for law enforcement officers.",
      specialties: ["Law Enforcement", "Criminal Justice", "Security Management"],
      imageUrl: null,
    },
    {
      id: 4,
      name: "Douanes (Customs)",
      acronym: "Customs",
      location: "Douala",
      type: "Public",
      category: "Finance",
      students: "1,200+",
      successRate: "96%",
      description: "Institution for training customs officers and international trade specialists.",
      specialties: ["International Trade", "Economics", "Law"],
      imageUrl: null,
    },
    {
      id: 5,
      name: "Gendarmerie Nationale",
      acronym: "Gendarmerie",
      location: "Nationwide",
      type: "Public",
      category: "Security",
      students: "3,500+",
      successRate: "94%",
      description: "Military force responsible for law enforcement in rural areas.",
      specialties: ["Military Law", "Security Operations", "Criminal Investigation"],
      imageUrl: null,
    },
    {
      id: 6,
      name: "IRIC (Institut des Relations Internationales)",
      acronym: "IRIC",
      location: "Yaoundé",
      type: "Public",
      category: "Diplomacy",
      students: "800+",
      successRate: "99%",
      description: "Specialized institution for training diplomats and international relations professionals.",
      specialties: ["International Relations", "Diplomacy", "Political Science"],
      imageUrl: null,
    },
  ];

  const categories = [
    { id: "all", name: "All Institutions" },
    { id: "Administration", name: "Administration" },
    { id: "Education", name: "Education" },
    { id: "Security", name: "Security" },
    { id: "Finance", name: "Finance" },
    { id: "Diplomacy", name: "Diplomacy" },
  ];

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.specialties.some(specialty =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = selectedCategory === "all" || institution.category === selectedCategory;

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
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Top Institutions in Cameroon
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Discover all the prestigious universities and higher education institutions in Cameroon with their specialties, admission requirements, and available programs.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mindboost-slate" />
              <Input
                type="text"
                placeholder="Search institutions, specialties, or locations..."
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
                  <Building className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-gray-600">Institutions</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50,000+</div>
                <div className="text-gray-600">Students</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-mindboost-dark-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-gray-600">Avg. Success Rate</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-light-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 text-mindboost-light-blue" />
                </div>
                <div className="text-2xl font-bold text-gray-900">20+</div>
                <div className="text-gray-600">Years Experience</div>
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

      {/* Institutions Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredInstitutions.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No institutions found</h3>
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
                  {selectedCategory === "all" ? "All Institutions" : `${selectedCategory} Institutions`}
                </h2>
                <p className="text-gray-600">
                  {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredInstitutions.map((institution) => (
                  <Card
                    key={institution.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="relative">
                      <div className="h-32 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green flex items-center justify-center">
                        <div className="text-center text-white">
                          <Building className="h-12 w-12 mx-auto mb-2" />
                          <div className="text-xl font-bold">{institution.acronym}</div>
                        </div>
                      </div>
                      <Badge className="absolute top-4 right-4 bg-white text-mindboost-green">
                        {institution.type}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{institution.name}</h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {institution.location}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-mindboost-light-green text-mindboost-green">
                          {institution.category}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4 text-sm">{institution.description}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {institution.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {institution.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{institution.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-mindboost-light-green/50 rounded-lg">
                          <div className="text-lg font-bold text-mindboost-green">{institution.students}</div>
                          <div className="text-xs text-gray-600">Students</div>
                        </div>
                        <div className="text-center p-3 bg-mindboost-light-blue/50 rounded-lg">
                          <div className="text-lg font-bold text-mindboost-green">{institution.successRate}</div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                      </div>

                      <Button asChild className="w-full bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                        <Link to={`/institution/${institution.id}`}>
                          View Details
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
            Ready to Apply to Your Dream Institution?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have successfully gained admission to top institutions with MindBoost.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-mindboost-green hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-lg">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full">
              <Link to="/contact">
                Contact Our Team
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}