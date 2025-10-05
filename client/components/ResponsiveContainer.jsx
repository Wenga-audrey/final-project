import React from "react";

export default function ResponsiveContainer({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6">
      {children}
    </div>
  );
}