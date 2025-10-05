import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    BookOpen,
    Users,
    BarChart3,
    Calendar,
    FileText,
    MessageCircle,
    Settings,
    GraduationCap,
    Plus,
    Target,
    Award,
    Brain,
    CreditCard,
    AlertCircle,
    Download,
    HelpCircle
} from "@/lib/icons";

const navItems = [
    { label: "Dashboard", to: "/dashboard/prepadmin", icon: BookOpen },
    { label: "Class Management", to: "/dashboard/prepadmin/classes", icon: GraduationCap },
    { label: "Learner Management", to: "/dashboard/prepadmin/learners", icon: Users },
    { label: "Instructor Assignment", to: "/dashboard/prepadmin/instructors", icon: Award },
    { label: "Content Validation", to: "/dashboard/prepadmin/content", icon: FileText },
    { label: "Payments", to: "/dashboard/prepadmin/payments", icon: CreditCard },
    { label: "Analytics", to: "/dashboard/prepadmin/analytics", icon: BarChart3 },
    { label: "Reports", to: "/dashboard/prepadmin/reports", icon: Download },
    { label: "Support Escalation", to: "/dashboard/prepadmin/support", icon: HelpCircle },
    { label: "Settings", to: "/dashboard/prepadmin/settings", icon: Settings }
];

export default function PrepClassAdminSidebar({ darkMode }) {
    const location = useLocation();
    const navRef = useRef(null);

    return (
        <nav
            className={`h-full w-64 fixed left-0 top-0 z-40 flex flex-col px-4 py-6 border-r ${darkMode ? "bg-gray-900 border-gray-800 text-gray-200" : "bg-white border-gray-200 text-gray-900"}`}
            aria-label="Prep Class Admin sidebar"
            role="navigation"
            ref={navRef}
        >
            <h1 className="text-2xl font-bold mb-8 text-mindboost-green">Prep Admin Panel</h1>
            <ul className="space-y-2">
                {navItems.map(({ label, to, icon: Icon }) => (
                    <li key={label}>
                        <Link
                            to={to}
                            className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${location.pathname === to ? "bg-mindboost-green text-white" : "hover:bg-mindboost-light-green hover:text-mindboost-green"}`}
                        >
                            <Icon className="h-5 w-5 mr-3" />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
