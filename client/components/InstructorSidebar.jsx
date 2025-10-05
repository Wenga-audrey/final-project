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
} from "@/lib/icons";

const navItems = [
    { label: "Dashboard", to: "/dashboard/instructor", icon: BookOpen },
    { label: "My Classes", to: "/dashboard/instructor/classes", icon: GraduationCap },
    { label: "Create Class", to: "/instructor/create-class", icon: Plus },
    { label: "Student Progress", to: "/instructor/progress", icon: Target },
    { label: "Content Management", to: "/instructor/content", icon: FileText },
    { label: "Analytics", to: "/instructor/analytics", icon: BarChart3 },
    { label: "Messages", to: "/instructor/messages", icon: MessageCircle },
    { label: "Settings", to: "/instructor/settings", icon: Settings },
];

export default function InstructorSidebar({ darkMode }) {
    const location = useLocation();
    const navRef = useRef(null);

    return (
        <nav
            className={`h-full w-64 fixed left-0 top-0 z-40 flex flex-col px-4 py-6 border-r ${darkMode ? "bg-gray-900 border-gray-800 text-gray-200" : "bg-white border-gray-200 text-gray-900"
                }`}
            aria-label="Instructor sidebar"
            role="navigation"
        >
            <h1 className="text-2xl font-bold mb-8 text-mindboost-green">Instructor Panel</h1>
            <ul className="flex-1 space-y-2" ref={navRef}>
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <li key={item.label}>
                            <Link
                                to={item.to}
                                aria-current={location.pathname === item.to ? "page" : undefined}
                                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-mindboost-green/20 focus:outline-none focus:ring-2 focus:ring-green-400 ${location.pathname === item.to ? "bg-mindboost-green/10 font-bold" : ""
                                    }`}
                                tabIndex={0}
                                role="menuitem"
                                aria-label={item.label}
                                onKeyDown={e => {
                                    if (e.key === "ArrowDown") {
                                        navRef.current?.querySelectorAll("a")[idx + 1]?.focus();
                                    }
                                    if (e.key === "ArrowUp") {
                                        navRef.current?.querySelectorAll("a")[idx - 1]?.focus();
                                    }
                                }}
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}