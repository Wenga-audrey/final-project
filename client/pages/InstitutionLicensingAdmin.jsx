import React, { useEffect, useState } from "react";
import { api } from "@shared/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/card";

export default function InstitutionLicensingAdmin() {
  const [institutions, setInstitutions] = useState([]);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    async function fetchInstitutions() {
      const res = await api.get("/api/institution/licensing/list");
      if (res.success) setInstitutions(res.institutions);
      const pend = await api.get("/api/institution/pending");
      if (pend.success) setPending(pend.pending);
    }
    fetchInstitutions();
  }, []);

  async function handleApprove(id) {
    await api.post("/api/institution/licensing/approve", { institutionId: id, terms: "Standard terms" });
    setPending(pending.filter(inst => inst.id !== id));
    // Optionally refetch institutions
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl brand-shadow bg-white/90 border-2 border-mindboost-green rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-mindboost-light-blue to-mindboost-cream rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-mindboost-dark-green">Institutional Licensing</CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold text-mindboost-green mb-2">Licensed Institutions</h4>
          <ul className="mb-4 space-y-1">
            {institutions.map(i => <li key={i.id} className="px-3 py-1 bg-mindboost-light-green rounded-full shadow text-mindboost-dark-green">{i.name}</li>)}
          </ul>
          <h4 className="mt-4 font-semibold text-mindboost-green mb-2">Pending Approvals</h4>
          <ul className="space-y-2">
            {pending.map(p => (
              <li key={p.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg shadow border border-mindboost-light-green">
                <span className="text-mindboost-dark-green font-medium">{p.name}</span>
                <Button onClick={() => handleApprove(p.id)} className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white rounded-xl px-4 py-1 brand-shadow">Approve</Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}