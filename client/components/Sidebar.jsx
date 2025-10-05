import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard/learner", icon: "🏠" },
  { label: "Study Group", to: "/study-group", icon: "💬" },
  { label: "Achievements", to: "/achievements", icon: "🏆" },
  { label: "Notifications", to: "/notifications", icon: "🔔" },
  { label: "Search", to: "/search", icon: "🔎" },
  { label: "Feedback", to: "/feedback", icon: "💡" },
];

export default function Sidebar({ darkMode }) {
  const location = useLocation();
  const navRef = useRef<HTMLUListElement>(null);

  return (
    <nav
      className={`h-full w-64 fixed left-0 top-0 z-40 flex flex-col px-4 py-6 border-r ${
        darkMode ? "bg-gray-900 border-gray-800 text-gray-200" : "bg-white border-gray-200 text-gray-900"
      }`}
      aria-label="Main sidebar"
      role="navigation"
    >
      <h1 className="text-2xl font-bold mb-8 text-mindboost-green">Mindboost</h1>
      <ul className="flex-1 space-y-2" ref={navRef}>
        {navItems.map((item, idx) => (
          <li key={item.label}>
            <Link
              to={item.to}
              aria-current={location.pathname === item.to ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-mindboost-green/20 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                location.pathname === item.to ? "bg-mindboost-green/10 font-bold" : ""
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
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}