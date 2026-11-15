import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialUsers = [
  { id: 1, name: "Ravi Kumar", role: "citizen", email: "ravi@mail.com", active: true },
  { id: 2, name: "Anita Singh", role: "authority", email: "anita@mail.com", active: true },
  { id: 3, name: "Manish Joshi", role: "citizen", email: "manish@mail.com", active: false },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const toggleActive = (id: number) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        {filtered.map((u) => (
          <Card key={u.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{u.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Email: {u.email}</p>
              <p>Role: {u.role}</p>
              <p>Status: {u.active ? "Active ✅" : "Inactive ❌"}</p>
              <Button onClick={() => toggleActive(u.id)}>
                {u.active ? "Deactivate" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
