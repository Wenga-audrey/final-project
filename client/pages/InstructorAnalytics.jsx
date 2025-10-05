import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";

export default function InstructorAnalytics({ classId }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await api.get(`/api/instructor/prep-classes/${classId}/analytics`);
      if (res.success) setAnalytics(res.analytics);
    }
    fetchAnalytics();
  }, [classId]);

  if (!analytics) return <div className="flex items-center justify-center min-h-[40vh] text-lg text-mindboost-dark-green animate-pulse">Loading...</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl brand-shadow bg-white/90 border-2 border-mindboost-green rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-mindboost-dark-green">Class Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar value={analytics.avgProgress} label="Average Progress" className="mb-4" />
          <div className="mb-2 text-mindboost-green font-semibold">Success Rate: <span className="text-mindboost-dark-green">{analytics.successRate}%</span></div>
          <div className="mb-2 text-mindboost-green font-semibold">Active Learners: <span className="text-mindboost-dark-green">{analytics.activeLearners}</span></div>
          <div className="mb-2 text-mindboost-green font-semibold">Leaderboard Top: <span className="text-mindboost-dark-green">{analytics.leaderboardTop.map(l => l.name).join(", ")}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}