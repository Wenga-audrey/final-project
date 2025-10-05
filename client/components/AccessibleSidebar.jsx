import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  Users,
  Trophy,
  Calendar,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Brain,
  Target,
  Award,
  Bell,
  Search,
  Lightbulb,
  HelpCircle,
  User
} from '@/lib/icons';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: "Dashboard", to: "/dashboard/learner", icon: Home },
  { label: "My Courses", to: "/courses", icon: BookOpen },
  { label: "Study Groups", to: "/study-groups", icon: Users },
  { label: "Achievements", to: "/achievements", icon: Trophy },
  { label: "Study Calendar", to: "/study-calendar", icon: Calendar },
  { label: "Forums", to: "/forums", icon: MessageCircle },
  { label: "Progress", to: "/progress", icon: BarChart3 },
  { label: "AI Assistant", to: "/ai-assistant", icon: Brain },
  { label: "Quizzes", to: "/quiz", icon: Target },
  { label: "Resources", to: "/resources", icon: Lightbulb },
];

export default function AccessibleSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-auto ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900">
                Mind<span className="text-blue-600">Boost</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden p-0 w-8 h-8"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4" ref={navRef}>
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={toggleSidebar}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User profile and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  U
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">User Name</div>
                  <div className="text-xs text-gray-500">Student</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 p-0 w-8 h-8"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/profile"
                className="flex items-center justify-center px-2 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center justify-center px-2 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}