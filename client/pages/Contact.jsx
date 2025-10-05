import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  User,
  FileText,
  CheckCircle,
  Award,
  Heart,
  Zap,
  ArrowRight,
  Brain,
  Calendar,
  BookOpen,
  GraduationCap
} from "@/lib/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    setSubmitted(true);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      institution: "",
      subject: "",
      message: "",
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: ["Yaoundé, Bastos", "Near Ministry of Education", "Cameroon"],
      color: "from-mindboost-green to-mindboost-dark-green",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+237 6XX XXX XXX",
        "+237 6YY YYY YYY",
        "24/7 Support Available",
      ],
      color: "from-mindboost-dark-green to-mindboost-green",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "hello@mindboost.cm",
        "support@mindboost.cm",
        "Quick Response Guaranteed",
      ],
      color: "from-mindboost-green to-mindboost-dark-green",
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: [
        "Mon - Fri: 8AM - 6PM",
        "Saturday: 9AM - 4PM",
        "Sunday: Emergency Only",
      ],
      color: "from-mindboost-dark-green to-mindboost-green",
    },
  ];

  const team = [
    {
      name: "Dr. Emmanuel Tabi",
      role: "Academic Director",
      specialization: "Engineering & Mathematics",
      experience: "15+ years",
      image: "ET",
    },
    {
      name: "Prof. Marie Ngozi",
      role: "Medical Sciences Lead",
      specialization: "Health Sciences & Biology",
      experience: "12+ years",
      image: "MN",
    },
    {
      name: "Mr. Jean-Paul Kamdem",
      role: "Business Studies Head",
      specialization: "Commerce & Management",
      experience: "10+ years",
      image: "JPK",
    },
    {
      name: "Ms. Amélie Takam",
      role: "Student Success Manager",
      specialization: "Academic Counseling",
      experience: "8+ years",
      image: "AT",
    },
  ];

  const faqs = [
    {
      question: "How long are the preparation courses?",
      answer:
        "Our courses range from 3 to 8 months depending on the institution and complexity of the entrance exam.",
    },
    {
      question: "Do you offer online classes?",
      answer:
        "Yes! We offer both in-person and online classes with live sessions and recorded materials for flexible learning.",
    },
    {
      question: "What is your success rate?",
      answer:
        "We maintain a 98% success rate with over 15,000 students successfully placed in their desired institutions.",
    },
    {
      question: "Are there payment plans available?",
      answer:
        "Yes, we offer flexible payment plans with installments to make quality education accessible to everyone.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-mindboost-light-green via-white to-mindboost-green/10 brand-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 card brand-shadow py-12 px-8 bg-white/10 backdrop-blur-md border border-white/20">
            <Badge className="mb-6 bg-mindboost-green/10 text-mindboost-green px-4 py-1 rounded-full text-sm font-medium shadow-lg">
              GET IN TOUCH
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-black text-mindboost-dark-blue mb-6 drop-shadow-lg">
              Let's Start Your
              <span className="text-mindboost-green block">Success Story</span>
            </h1>
            <p className="text-xl text-mindboost-slate max-w-3xl mx-auto leading-relaxed">
              Ready to transform your academic future? Our expert team is here
              to guide you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-white -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-4">
                      {info.title}
                    </h3>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <p
                          key={idx}
                          className="text-black/70 text-sm font-medium"
                        >
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-gradient-to-br from-mindboost-green/5 to-mindboost-light-green/20 brand-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <div>
              <div className="mb-12">
                <h2 className="text-3xl font-black text-gray-900 mb-4">
                  Send Us a <span className="text-mindboost-green">Message</span>
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Have questions about our programs or need assistance? Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {submitted ? (
                <Card className="border-0 shadow-lg bg-gradient-to-r from-mindboost-green/10 to-mindboost-light-green/20">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-mindboost-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-mindboost-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for contacting us. Our team will respond to your inquiry shortly.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="bg-mindboost-green hover:bg-mindboost-green/90 text-white font-bold rounded-full"
                    >
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                              placeholder="+237 6XX XXX XXX"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                            Institution (Optional)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <GraduationCap className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="institution"
                              name="institution"
                              value={formData.institution}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                              placeholder="University of Yaoundé"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green appearance-none bg-white"
                          >
                            <option value="">Select a subject</option>
                            <option value="admissions">Admissions Inquiry</option>
                            <option value="courses">Course Information</option>
                            <option value="pricing">Pricing & Payment</option>
                            <option value="technical">Technical Support</option>
                            <option value="feedback">Feedback & Suggestions</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Message
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-3">
                            <MessageCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                            placeholder="How can we help you? Interested in our free trial?"
                          ></textarea>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-mindboost-green hover:bg-mindboost-green/90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Map & Additional Info */}
            <div>
              <div className="sticky top-24 space-y-8">
                {/* Map Placeholder */}
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="h-64 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green flex items-center justify-center">
                    <div className="text-center text-white">
                      <MapPin className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">Our Location</h3>
                      <p className="opacity-90">Yaoundé, Cameroon</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Our Campus</h3>
                    <p className="text-gray-600 mb-4">
                      Come see our state-of-the-art facilities and meet our team in person.
                    </p>
                    <Button asChild variant="outline" className="w-full border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10">
                      <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                        Get Directions
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Contact */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Contact</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-mindboost-green/10 rounded-full flex items-center justify-center mr-3">
                          <Phone className="h-5 w-5 text-mindboost-green" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Call Us</p>
                          <p className="text-sm text-gray-600">+237 6XX XXX XXX</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-mindboost-green/10 rounded-full flex items-center justify-center mr-3">
                          <Mail className="h-5 w-5 text-mindboost-green" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email Us</p>
                          <p className="text-sm text-gray-600">hello@mindboost.cm</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-mindboost-green/10 rounded-full flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-mindboost-green" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Office Hours</p>
                          <p className="text-sm text-gray-600">Mon-Fri: 8AM - 6PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Frequently Asked <span className="text-mindboost-green">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our programs and services
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Still have questions? Our support team is ready to help.
            </p>
            <Button asChild className="bg-mindboost-green hover:bg-mindboost-green/90 text-white font-bold rounded-full px-8">
              <Link to="/support">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white brand-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Academic Future?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of students who have achieved their dreams with MindBoost Excellence Academy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-mindboost-green hover:bg-gray-100 px-8 py-6 text-lg font-bold rounded-full shadow-lg">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full">
              <Link to="/programs">
                Explore Programs
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}