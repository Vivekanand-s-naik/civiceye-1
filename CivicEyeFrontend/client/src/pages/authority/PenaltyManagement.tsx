import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PenaltyManagement() {
  const [query, setQuery] = useState("");
  const [penalties, setPenalties] = useState([
    { id: 1, name: "Ravi Kumar", reason: "Littering", amount: 500, paid: false },
    { id: 2, name: "Asha Patel", reason: "Traffic Violation", amount: 1000, paid: false },
    { id: 3, name: "Manish Joshi", reason: "Illegal Parking", amount: 300, paid: true },
  ]);

  const filtered = penalties.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.reason.toLowerCase().includes(query.toLowerCase())
  );

  const markPaid = (id: number) =>
    setPenalties((prev) => prev.map((p) => (p.id === id ? { ...p, paid: true } : p)));

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Penalty Management</h1>
        <Input
          placeholder="Search by name or reason"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((p) => (
          <Card key={p.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><b>Reason:</b> {p.reason}</p>
              <p><b>Amount:</b> ₹{p.amount}</p>
              <p>
                <b>Status:</b>{" "}
                {p.paid ? (
                  <span className="text-green-600 font-semibold">Paid ✅</span>
                ) : (
                  <span className="text-red-600 font-semibold">Pending</span>
                )}
              </p>
              {!p.paid && (
                <Button onClick={() => markPaid(p.id)}>Mark as Paid</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
