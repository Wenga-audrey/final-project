import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/card";

export default function InstructorContentManager({ instructorId }) {
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    async function fetchContent() {
      const resLessons = await api.get(`/api/instructor/${instructorId}/lessons`);
      if (resLessons.success) setLessons(resLessons.lessons);
      const resQuizzes = await api.get(`/api/instructor/${instructorId}/quizzes`);
      if (resQuizzes.success) setQuizzes(resQuizzes.quizzes);
    }
    fetchContent();
  }, [instructorId]);

  async function handleApproveQuiz(quizId) {
    await api.post(`/api/instructor/quizzes/${quizId}/approve`);
    setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, approved: true } : q));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl brand-shadow bg-white/90 border-2 border-mindboost-green rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-mindboost-dark-green">Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-mindboost-green mb-2">Lessons</h4>
          <ul className="mb-4 space-y-1">
            {lessons.map(l => <li key={l.id} className="px-3 py-1 bg-mindboost-light-green rounded-full shadow text-mindboost-dark-green flex items-center justify-between">{l.title} <span>{l.approved ? "✅" : "⏳"}</span></li>)}
          </ul>
          <h4 className="mt-4 font-semibold text-mindboost-green mb-2">Quizzes</h4>
          <ul className="space-y-2">
            {quizzes.map(q => (
              <li key={q.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg shadow border border-mindboost-light-green">
                <span className="text-mindboost-dark-green font-medium">{q.title}</span>
                {q.approved ? "✅" : <Button onClick={() => handleApproveQuiz(q.id)} className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white rounded-xl px-4 py-1 brand-shadow">Approve</Button>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}