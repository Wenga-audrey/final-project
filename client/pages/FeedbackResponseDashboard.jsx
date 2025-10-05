import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import FeedbackResponseModal from "@/components/FeedbackResponseModal";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/card";

export default function FeedbackResponseDashboard() {
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchFeedback() {
      const res = await api.get("/api/feedback/pending");
      if (res.success) setPendingFeedback(res.feedbacks);
    }
    fetchFeedback();
  }, []);

  async function handleRespond(responseText) {
    await api.post(`/api/feedback/${selectedFeedback.id}/respond`, { response: responseText });
    setPendingFeedback(pendingFeedback.filter(fb => fb.id !== selectedFeedback.id));
    setModalOpen(false);
    setSelectedFeedback(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center py-12">
      <Card className="w-full max-w-md brand-shadow bg-white/90 border-2 border-mindboost-green rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-mindboost-dark-green">Feedback Response Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {pendingFeedback.map(fb => (
              <li key={fb.id} className="mb-4 p-2 border-b">
                <div>
                  <b className="text-mindboost-dark-green">{fb.learner.name}</b> on <i className="text-mindboost-green">{fb.subject.title}</i>:<br />
                  <span className="text-mindboost-green">{fb.text}</span>
                </div>
                <Button
                  onClick={() => {
                    setSelectedFeedback(fb);
                    setModalOpen(true);
                  }}
                  aria-label={`Respond to feedback from ${fb.learner.name}`}
                  className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white rounded-xl px-4 py-1 brand-shadow mt-2"
                >
                  Respond
                </Button>
              </li>
            ))}
          </ul>
          <FeedbackResponseModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            feedback={selectedFeedback}
            onRespond={handleRespond}
          />
        </CardContent>
      </Card>
    </div>
  );
}