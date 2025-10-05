import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Home,
  Search,
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  User,
  Settings,
  HelpCircle
} from '@/lib/icons';

export default function NotFound() {
  const navigationOptions = [
    {
      icon: Home,
      title: "Dashboard",
      description: "Go back to your main dashboard",
      link: "/dashboard/learner"
    },
    {
      icon: BookOpen,
      title: "Courses",
      description: "Browse our course catalog",
      link: "/courses"
    },
    {
      icon: User,
      title: "Profile",
      description: "View your profile settings",
      link: "/profile"
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Adjust your account settings",
      link: "/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue via-blue-50 to-mindboost-cream flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-24 h-24 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>

              {/* Error Title and Message */}
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">404</h1>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for courses, resources, or help..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green text-lg"
                  />
                </div>
              </div>

              {/* Quick Navigation Options */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Navigation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {navigationOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={index}
                        asChild
                        variant="outline"
                        className="flex flex-col items-center justify-center h-32 p-4 border-gray-200 hover:border-mindboost-green hover:bg-mindboost-light-green/30 rounded-xl transition-all"
                      >
                        <Link to={option.link}>
                          <Icon className="h-8 w-8 text-mindboost-green mb-2" />
                          <span className="font-bold text-gray-900 mb-1">{option.title}</span>
                          <span className="text-xs text-gray-600">{option.description}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-mindboost-light-green/30 rounded-2xl p-6 mb-10 border border-mindboost-green/20">
                <div className="flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-mindboost-green mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  If you're having trouble finding what you're looking for, our support team is here to help.
                </p>
                <Button className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full">
                  Contact Support
                </Button>
              </div>

              {/* Back to Home */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl">
                  <Link to="/dashboard/learner">
                    <Home className="h-5 w-5 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 rounded-full px-8 py-4 text-lg">
                  <Link to="/">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}