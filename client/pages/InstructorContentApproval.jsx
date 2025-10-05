import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/card";

export default function InstructorContentApproval({ instructorId }) {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    async function fetchPending() {
      const res = await api.get(`/api/instructor/${instructorId}/pending-content`);
      if (res.success) setPending(res.pending);
    }
    fetchPending();
  }, [instructorId]);

  async function handleApprove(id) {
    await api.post(`/api/instructor/content/${id}/approve`);
    setPending(pending.filter(c => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl brand-shadow bg-white/90 border-2 border-mindboost-green rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-mindboost-dark-green">Pending Content Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {pending.map(content => (
              <li key={content.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg shadow border border-mindboost-light-green">
                <span className="text-mindboost-dark-green font-medium">{content.title}</span>
                <Button onClick={() => handleApprove(content.id)} aria-label={`Approve ${content.title}`} className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white rounded-xl px-4 py-1 brand-shadow">Approve</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}