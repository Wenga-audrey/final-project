import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/card";

export default function SystemMaintenance() {
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      const res = await api.get("/api/status");
      if (res.success) setMaintenance(res.maintenance);
    }
    fetchStatus();
  }, []);

  async function handleToggle() {
    await api.post("/api/status/toggle");
    setMaintenance(!maintenance);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center py-12">
      <Card className="w-full max-w-md brand-shadow bg-white/90 border-2 border-mindboost-green rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-mindboost-dark-green">System Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-lg font-semibold text-mindboost-green">Status: <span className={maintenance ? 'text-red-500' : 'text-mindboost-dark-green'}>{maintenance ? "Under Maintenance" : "Online"}</span></div>
          <Button onClick={handleToggle} className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white rounded-xl px-4 py-2 brand-shadow">
            {maintenance ? "Resume Service" : "Start Maintenance"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}