import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/icons";

export default function StudyGroup() {
  const { classId } = useParams(); // Removed type annotation
  const [group, setGroup] = useState(null);

  useEffect(() => {
    async function fetchGroup() {
      const res = await api.get(`/api/prep-classes/${classId}/study-group`);
      if (res.success) setGroup(res.group);
    }
    fetchGroup();
  }, [classId]);

  if (!group) return <div className="flex items-center justify-center min-h-[40vh] text-lg text-mindboost-dark-green animate-pulse">Loading...</div>;
  if (!group) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-mindboost-green border-t-mindboost-dark-green rounded-full animate-spin mb-4"></div>
        <span className="text-xl font-semibold text-mindboost-dark-green">Loading Study Group...</span>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream p-4">
      <Card className="w-full max-w-2xl bg-white/70 backdrop-blur-lg border-0 shadow-2xl rounded-3xl">
        <CardHeader className="flex flex-col items-center pt-8 pb-4">
          <CardTitle className="text-3xl font-extrabold text-mindboost-dark-green mb-2 drop-shadow-lg">
            {group.name} Study Group
          </CardTitle>
          <div className="flex -space-x-3 mt-2">
            {group.members.slice(0, 5).map((member) => (
              <div key={member.id} className="w-10 h-10 rounded-full bg-mindboost-light-green border-2 border-white shadow flex items-center justify-center text-mindboost-dark-green font-bold text-lg">
                <User className="w-5 h-5 mr-1" />
                {member.name[0]}
              </div>
            ))}
            {group.members.length > 5 && (
              <div className="w-10 h-10 rounded-full bg-mindboost-green border-2 border-white shadow flex items-center justify-center text-white font-bold text-lg">
                +{group.members.length - 5}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="space-y-8">
            <div>
              <h4 className="font-semibold text-mindboost-green mb-3 text-lg">Members</h4>
              <ul className="flex flex-wrap gap-3">
                {group.members.map((member) => (
                  <li key={member.id} className="px-4 py-2 bg-mindboost-light-green rounded-full shadow text-mindboost-dark-green font-medium hover:bg-mindboost-green hover:text-white transition-colors duration-200">
                    <User className="inline-block w-4 h-4 mr-2 align-middle" />
                    {member.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-mindboost-green mb-3 text-lg">Messages</h4>
              <div className="space-y-3">
                {group.messages.map((msg) => (
                  <div key={msg.id} className="bg-white/90 rounded-xl px-5 py-3 shadow border border-mindboost-light-green flex items-start gap-2">
                    <span className="font-bold text-mindboost-dark-green mr-2">{msg.senderName}:</span>
                    <span className="text-gray-700">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}