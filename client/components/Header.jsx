import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Brain, Search, User } from "@/lib/icons";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Map user roles to dashboard routes
  const getDashboardRoute = (role) => {
    switch (role) {
      case 'LEARNER':
        return '/dashboard/learner';
      case 'TEACHER':
        return '/dashboard/instructor';
      case 'PREP_ADMIN':
        return '/dashboard/admin';
      case 'SUPER_ADMIN':
        return '/dashboard/super-admin';
      default:
        return '/dashboard/learner';
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-mindboost-green/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-black text-black group-hover:text-mindboost-green transition-colors">
                Mind<span className="text-mindboost-green">Boost</span>
              </span>
              <div className="text-xs text-black/60 font-semibold -mt-1">
                Excellence Academy
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="px-4 py-2 text-black hover:text-mindboost-green transition-colors font-semibold hover:bg-mindboost-light-green rounded-xl relative group"
            >
              Home
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-mindboost-green transition-all group-hover:w-1/2 group-hover:left-1/4"></span>
            </Link>

            <Link
              to="/courses"
              className="px-4 py-2 text-black hover:text-mindboost-green transition-colors font-semibold hover:bg-mindboost-light-green rounded-xl relative group"
            >
              Courses
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-mindboost-green transition-all group-hover:w-1/2 group-hover:left-1/4"></span>
            </Link>

            <Link
              to="/about"
              className="px-4 py-2 text-black hover:text-mindboost-green transition-colors font-semibold hover:bg-mindboost-light-green rounded-xl relative group"
            >
              About
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-mindboost-green transition-all group-hover:w-1/2 group-hover:left-1/4"></span>
            </Link>

            <Link
              to="/exams"
              className="px-4 py-2 text-black hover:text-mindboost-green transition-colors font-semibold hover:bg-mindboost-light-green rounded-xl relative group"
            >
              Exams
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-mindboost-green transition-all group-hover:w-1/2 group-hover:left-1/4"></span>
            </Link>
            <Link
              to="/contact"
              className="px-4 py-2 text-black hover:text-mindboost-green transition-colors font-semibold hover:bg-mindboost-light-green rounded-xl relative group"
            >
              Contact
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-mindboost-green transition-all group-hover:w-1/2 group-hover:left-1/4"></span>
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Enhanced avatar dropdown */}
                <div className="relative group">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-mindboost-light-green transition-all"
                  >
                    <Link to={getDashboardRoute(user?.role)}>
                      <div className="w-10 h-10 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-all">
                        <span className="text-lg">{user?.firstName?.[0] || 'U'}</span>
                      </div>
                    </Link>
                  </Button>
                  {/* Tooltip on hover */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 px-4 border border-mindboost-light-green opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="text-sm font-semibold text-mindboost-dark-green">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-mindboost-slate capitalize">
                      {user?.role?.toLowerCase().replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-mindboost-green hover:text-mindboost-dark-green font-semibold hover:bg-mindboost-light-green rounded-full px-4 transition-all"
                >
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green hover:from-mindboost-green/90 hover:to-mindboost-dark-green/90 text-white font-bold rounded-full px-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  size="sm"
                >
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 rounded-2xl text-black hover:text-mindboost-green hover:bg-mindboost-light-green transition-all"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/60" />
            <input
              type="text"
              placeholder="Search courses, exams..."
              className="w-full pl-12 pr-4 py-3 bg-mindboost-light-green rounded-full border border-mindboost-green/20 focus:outline-none focus:ring-2 focus:ring-mindboost-green/50 focus:border-mindboost-green transition-all"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-6 border-t border-mindboost-green/20 mt-4 pt-4 bg-white/50 backdrop-blur rounded-2xl">
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                className="px-4 py-3 text-black hover:text-mindboost-green hover:bg-mindboost-light-green rounded-xl transition-all font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/courses"
                className="px-4 py-3 text-black hover:text-mindboost-green hover:bg-mindboost-light-green rounded-xl transition-all font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                to="/about"
                className="px-4 py-3 text-black hover:text-mindboost-green hover:bg-mindboost-light-green rounded-xl transition-all font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/exams"
                className="px-4 py-3 text-black hover:text-mindboost-green hover:bg-mindboost-light-green rounded-xl transition-all font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Exams
              </Link>
              <Link
                to="/contact"
                className="px-4 py-3 text-black hover:text-mindboost-green hover:bg-mindboost-light-green rounded-xl transition-all font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-mindboost-green/20 mt-4">
                <div className="flex flex-col space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="justify-start text-mindboost-green hover:text-mindboost-dark-green font-semibold"
                      >
                        <Link to={getDashboardRoute(user?.role)}>
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        onClick={logout}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-gray-600 hover:text-gray-800 font-semibold"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="justify-start text-mindboost-green hover:text-mindboost-dark-green font-semibold"
                      >
                        <Link to="/signin">Sign In</Link>
                      </Button>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold rounded-full justify-start shadow-lg"
                        size="sm"
                      >
                        <Link to="/get-started">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}