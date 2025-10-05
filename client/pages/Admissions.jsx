import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Target,
} from "@/lib/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Admissions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("all");

  const admissionProcesses = [
    {
      id: 1,
      institution: "ENAM (École Nationale d'Administration et de Magistrature)",
      acronym: "ENAM",
      deadline: "2024-03-15",
      examDate: "2024-05-20",
      applicationFee: "15,000 FCFA",
      requirements: [
        "Bachelor's degree or equivalent",
        "Cameroonian citizenship",
        "Age between 20-30 years",
        "Medical certificate",
        "Police record"
      ],
      documents: [
        "Application form",
        "Academic transcripts",
        "Birth certificate",
        "National ID",
        "Passport photos"
      ],
      steps: [
        { number: 1, title: "Online Application", status: "completed" },
        { number: 2, title: "Document Submission", status: "completed" },
        { number: 3, title: "Written Exam", status: "current" },
        { number: 4, title: "Oral Exam", status: "pending" },
        { number: 5, title: "Final Selection", status: "pending" }
      ],
      tips: [
        "Focus on current affairs and political science",
        "Practice essay writing daily",
        "Review past exam papers thoroughly"
      ]
    },
    {
      id: 2,
      institution: "ENS (École Normale Supérieure)",
      acronym: "ENS",
      deadline: "2024-02-28",
      examDate: "2024-04-15",
      applicationFee: "10,000 FCFA",
      requirements: [
        "High school diploma (GCE A Level or equivalent)",
        "Cameroonian citizenship",
        "Age between 18-25 years",
        "Medical certificate"
      ],
      documents: [
        "Application form",
        "Academic transcripts",
        "Birth certificate",
        "National ID",
        "Passport photos"
      ],
      steps: [
        { number: 1, title: "Online Application", status: "completed" },
        { number: 2, title: "Document Verification", status: "current" },
        { number: 3, title: "Written Exam", status: "pending" },
        { number: 4, title: "Oral Exam", status: "pending" },
        { number: 5, title: "Final Selection", status: "pending" }
      ],
      tips: [
        "Strengthen your literature and language skills",
        "Practice analytical writing",
        "Review pedagogical theories"
      ]
    },
    {
      id: 3,
      institution: "Police Nationale",
      acronym: "Police",
      deadline: "2024-04-30",
      examDate: "2024-06-10",
      applicationFee: "5,000 FCFA",
      requirements: [
        "High school diploma",
        "Cameroonian citizenship",
        "Age between 18-30 years",
        "Physical fitness test",
        "Medical examination"
      ],
      documents: [
        "Application form",
        "Academic transcripts",
        "Birth certificate",
        "National ID",
        "Passport photos",
        "Medical certificate"
      ],
      steps: [
        { number: 1, title: "Online Registration", status: "completed" },
        { number: 2, title: "Document Verification", status: "completed" },
        { number: 3, title: "Physical Test", status: "current" },
        { number: 4, title: "Written Exam", status: "pending" },
        { number: 5, title: "Interview", status: "pending" }
      ],
      tips: [
        "Maintain physical fitness throughout preparation",
        "Study criminal law and procedures",
        "Practice logical reasoning tests"
      ]
    },
    {
      id: 4,
      institution: "Douanes (Customs)",
      acronym: "Customs",
      deadline: "2024-03-31",
      examDate: "2024-05-25",
      applicationFee: "12,000 FCFA",
      requirements: [
        "Bachelor's degree in Economics, Law or related field",
        "Cameroonian citizenship",
        "Age between 21-35 years",
        "Medical certificate"
      ],
      documents: [
        "Application form",
        "Academic transcripts",
        "Birth certificate",
        "National ID",
        "Passport photos"
      ],
      steps: [
        { number: 1, title: "Application Submission", status: "completed" },
        { number: 2, title: "Document Review", status: "current" },
        { number: 3, title: "Written Exam", status: "pending" },
        { number: 4, title: "Interview", status: "pending" },
        { number: 5, title: "Final Selection", status: "pending" }
      ],
      tips: [
        "Focus on international trade regulations",
        "Study economics and finance",
        "Review customs procedures and laws"
      ]
    }
  ];

  const institutions = [
    { id: "all", name: "All Institutions" },
    { id: "ENAM", name: "ENAM" },
    { id: "ENS", name: "ENS" },
    { id: "Police", name: "Police Nationale" },
    { id: "Customs", name: "Douanes" }
  ];

  const filteredProcesses = admissionProcesses.filter(process => {
    const matchesSearch = process.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.acronym.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInstitution = selectedInstitution === "all" || process.acronym === selectedInstitution;

    return matchesSearch && matchesInstitution;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-mindboost-green text-white";
      case "current": return "bg-mindboost-green text-white";
      case "pending": return "bg-gray-200 text-gray-600";
      default: return "bg-gray-200 text-gray-600";
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
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Admission Process
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
            Discover all admission processes, important dates, selection criteria, and expert tips to succeed in your applications.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-mindboost-slate" />
              <Input
                type="text"
                placeholder="Search institutions or programs..."
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
                  <Calendar className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-gray-600">Application Deadlines</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-mindboost-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">4-6 months</div>
                <div className="text-gray-600">Preparation Time</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-dark-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-mindboost-dark-green" />
                </div>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-gray-600">Success Rate with Prep</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-mindboost-light-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-mindboost-light-blue" />
                </div>
                <div className="text-2xl font-bold text-gray-900">20+</div>
                <div className="text-gray-600">Years Experience</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-mindboost-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {institutions.map((institution) => (
              <Button
                key={institution.id}
                onClick={() => setSelectedInstitution(institution.id)}
                variant={selectedInstitution === institution.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 ${selectedInstitution === institution.id
                  ? "bg-mindboost-green hover:bg-mindboost-green/90 text-white"
                  : "bg-white text-mindboost-green border-mindboost-green hover:bg-mindboost-green/10"
                  }`}
              >
                {institution.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Processes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProcesses.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No admission processes found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedInstitution("all");
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
                  {selectedInstitution === "all" ? "All Admission Processes" : `${selectedInstitution} Admission Process`}
                </h2>
                <p className="text-gray-600">
                  {filteredProcesses.length} process{filteredProcesses.length !== 1 ? "es" : ""} found
                </p>
              </div>

              <div className="space-y-8">
                {filteredProcesses.map((process) => (
                  <Card key={process.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{process.institution}</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-mindboost-green text-white">
                              Deadline: {new Date(process.deadline).toLocaleDateString()}
                            </Badge>
                            <Badge className="bg-mindboost-green text-white">
                              Exam: {new Date(process.examDate).toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline">
                              Fee: {process.applicationFee}
                            </Badge>
                          </div>
                        </div>
                        <Button asChild className="mt-4 md:mt-0 bg-mindboost-green hover:bg-mindboost-green/90 text-white">
                          <Link to={`/admission/${process.id}`}>
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Requirements */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <CheckCircle className="h-5 w-5 text-mindboost-green mr-2" />
                            Requirements
                          </h4>
                          <ul className="space-y-2">
                            {process.requirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-mindboost-green mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-gray-600 text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Documents */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FileText className="h-5 w-5 text-mindboost-green mr-2" />
                            Required Documents
                          </h4>
                          <ul className="space-y-2">
                            {process.documents.map((doc, index) => (
                              <li key={index} className="flex items-start">
                                <FileText className="h-4 w-4 text-mindboost-green mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-gray-600 text-sm">{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Process Steps */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Target className="h-5 w-5 text-mindboost-green mr-2" />
                            Application Process
                          </h4>
                          <div className="space-y-4">
                            {process.steps.map((step) => (
                              <div key={step.number} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStatusColor(step.status)}`}>
                                  {step.number}
                                </div>
                                <div className="ml-3">
                                  <div className={`text-sm font-medium ${step.status === 'current' ? 'text-mindboost-green font-bold' : 'text-gray-900'}`}>
                                    {step.title}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">{step.status}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <BookOpen className="h-5 w-5 text-mindboost-green mr-2" />
                          Expert Tips for Success
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {process.tips.map((tip, index) => (
                            <div key={index} className="bg-mindboost-light-green/50 p-4 rounded-lg">
                              <div className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-mindboost-green mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{tip}</span>
                              </div>
                            </div>
                          ))}
                        </div>
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
            Need Help with Your Application?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Our expert advisors are here to guide you through every step of the admission process.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-mindboost-green hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-lg">
              <Link to="/contact">
                Get Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full">
              <Link to="/courses">
                Prepare for Exams
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}