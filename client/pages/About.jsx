import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Trophy,
  Target,
  Heart,
  Lightbulb,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  BookOpen,
  Globe,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Book,
  Zap,
  Brain
} from "@/lib/icons";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description:
        "We strive for the highest standards in education and student success.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Our dedication to student growth drives everything we do.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We continuously evolve our methods to provide the best learning experience.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We maintain transparency and honesty in all our interactions.",
    },
  ];

  const stats = [
    { number: "98%", label: "Success Rate", icon: Trophy },
    { number: "15,000+", label: "Students Trained", icon: Users },
    { number: "20+", label: "Partner Institutions", icon: GraduationCap },
    { number: "5+", label: "Years Experience", icon: Award },
  ];

  const team = [
    {
      name: "Dr. Emmanuel Njoya",
      role: "Founder & CEO",
      specialization: "Engineering Education",
      experience: "15+ years",
      education: "PhD in Educational Technology",
      image: "EN"
    },
    {
      name: "Prof. Marie Fotso",
      role: "Academic Director",
      specialization: "Mathematics & Sciences",
      experience: "12+ years",
      education: "PhD in Applied Mathematics",
      image: "MF"
    },
    {
      name: "Dr. Jean-Claude Mbarga",
      role: "Technology Director",
      specialization: "Digital Learning",
      experience: "10+ years",
      education: "PhD in Computer Science",
      image: "JM"
    },
    {
      name: "Ms. Catherine Ndom",
      role: "Student Success Manager",
      specialization: "Student Psychology",
      experience: "8+ years",
      education: "Masters in Educational Psychology",
      image: "CN"
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: "Foundation",
      description:
        "MindBoost Excellence Academy was founded with a vision to revolutionize exam preparation in Cameroon.",
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description:
        "Launched our comprehensive online learning platform reaching students nationwide.",
    },
    {
      year: "2021",
      title: "Partnership Expansion",
      description:
        "Established partnerships with 10+ top institutions across Cameroon.",
    },
    {
      year: "2022",
      title: "Recognition",
      description:
        "Awarded 'Best Educational Innovation' by the Ministry of Higher Education.",
    },
    {
      year: "2023",
      title: "Scale & Impact",
      description:
        "Reached 10,000+ successful student graduations and expanded to neighboring countries.",
    },
    {
      year: "2024",
      title: "AI Integration",
      description:
        "Introduced AI-powered personalized learning paths and predictive analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mindboost-green to-mindboost-dark-green py-24 relative overflow-hidden brand-gradient">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center card brand-shadow py-16 px-8 bg-white/10 backdrop-blur-md border border-white/20">
            <Badge className="mb-6 bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
              ABOUT MINDBOOST
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg">
              Empowering
              <span className="block text-white/90">Academic Dreams</span>
            </h1>

            <p className="text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto mb-10">
              We are Cameroon's premier educational institution dedicated to
              helping students excel in their entrance exams and achieve their
              academic aspirations.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-mindboost-green hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-xl">
                <Link to="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full shadow-xl">
                <Link to="/get-started">
                  Start Free Trial
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-mindboost-green" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-mindboost-light-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-black mb-8">
                Our Mission
              </h2>
              <p className="text-xl text-black/80 leading-relaxed mb-8">
                To provide exceptional, personalized education that empowers
                students to excel in competitive entrance examinations and
                pursue their academic dreams with confidence.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-mindboost-green" />
                  <span className="text-black font-semibold">
                    Personalized learning experiences
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-mindboost-green" />
                  <span className="text-black font-semibold">
                    Expert mentorship and guidance
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-mindboost-green" />
                  <span className="text-black font-semibold">
                    Proven success methodologies
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-mindboost-green" />
                  <span className="text-black font-semibold">
                    Personalized learning paths
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Our Vision
                  </h3>
                  <p className="text-black/80 leading-relaxed">
                    To be the leading educational institution in Central Africa,
                    recognized for transforming lives through excellence in exam
                    preparation and academic achievement.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-black mb-4">
                    Our Approach
                  </h3>
                  <p className="text-black/80 leading-relaxed mb-4">
                    We combine traditional teaching excellence with cutting-edge technology to create an unparalleled learning experience.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Zap className="h-5 w-5 text-mindboost-green mr-2" />
                      <span className="text-black/80">AI-powered personalization</span>
                    </li>
                    <li className="flex items-center">
                      <Brain className="h-5 w-5 text-mindboost-green mr-2" />
                      <span className="text-black/80">Adaptive learning paths</span>
                    </li>
                    <li className="flex items-center">
                      <Users className="h-5 w-5 text-mindboost-green mr-2" />
                      <span className="text-black/80">Collaborative learning environment</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Our Core <span className="text-mindboost-green">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do at MindBoost Excellence Academy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="w-16 h-16 bg-mindboost-green/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-mindboost-green" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-mindboost-light-green to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Meet Our <span className="text-mindboost-green">Leadership</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate team behind MindBoost Excellence Academy's success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                    {member.image}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-mindboost-green font-semibold mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-2">{member.specialization}</p>
                  <p className="text-gray-500 text-xs mb-2">{member.experience}</p>
                  <p className="text-gray-500 text-xs">{member.education}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Our <span className="text-mindboost-green">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to transform education
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-mindboost-green/20"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 inline-block">
                      <span className="inline-block px-3 py-1 bg-mindboost-green/10 text-mindboost-green rounded-full text-sm font-bold mb-2">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-mindboost-green rounded-full border-4 border-white shadow-lg"></div>

                  <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Success Journey?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have transformed their academic future with MindBoost. Begin your educational journey today!
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