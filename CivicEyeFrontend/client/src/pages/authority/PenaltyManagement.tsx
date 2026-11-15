import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, PlusCircle, CheckCircle, Clock, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Penalty {
  id: number;
  name: string;
  reason: string;
  amount: number;
  paid: boolean;
  status: string;
  transaction_id?: string;
  payment_method?: string;
  issued_at?: string;
}

export default function PenaltyManagement() {
  const [query, setQuery] = useState("");
  const [filterPaid, setFilterPaid] = useState<string>("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newAmount, setNewAmount] = useState("500");
  const [newName, setNewName] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real penalties from DB
  const { data: penalties = [], isLoading, refetch } = useQuery<Penalty[]>({
    queryKey: ["penaltiesList"],
    queryFn: async () => {
      const res = await fetch("/api/penalties");
      if (!res.ok) throw new Error("Failed to fetch penalties");
      return res.json();
    },
  });

  // Mark penalty as paid mutation
  const payMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/penalties/${id}/pay`, { method: "PUT" });
      if (!res.ok) throw new Error("Payment update failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["penaltiesList"] });
      toast({
        title: "Penalty Marked as Paid",
        description: `Receipt: ${data.transaction_id || "Processed"}`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Payment Update Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Issue new penalty mutation
  const issueMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/penalties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(newAmount),
          reason: newReason,
        }),
      });
      if (!res.ok) throw new Error("Could not issue penalty");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penaltiesList"] });
      setIsDialogOpen(false);
      setNewReason("");
      setNewAmount("500");
      toast({
        title: "Penalty Notice Issued",
        description: `Issued ₹${newAmount} fine to violator registry.`,
      });
    },
  });

  const filtered = penalties.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (p.reason || "").toLowerCase().includes(query.toLowerCase());

    if (filterPaid === "PAID") return matchesSearch && p.paid;
    if (filterPaid === "PENDING") return matchesSearch && !p.paid;
    return matchesSearch;
  });

  const totalCollected = penalties.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = penalties.filter((p) => !p.paid).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Civic Penalty Enforcement</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Issue, track, and reconcile financial penalties for verified civic violations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" /> Issue Penalty Fine
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground">Total Penalties</p>
              <p className="text-2xl font-extrabold text-foreground mt-1">{penalties.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground">Collected Revenue</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹{totalCollected.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-muted-foreground">Outstanding Fines</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by violator name or reason..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "PENDING", "PAID"].map((f) => (
              <Button
                key={f}
                variant={filterPaid === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPaid(f)}
                className={`text-xs h-8 ${filterPaid === f ? "bg-blue-600 text-white" : ""}`}
              >
                {f}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Penalties Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow border rounded-xl overflow-hidden flex flex-col">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{p.name || "Identified Violator"}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Penalty Notice #{p.id}</CardDescription>
                </div>
                <Badge
                  className={
                    p.paid
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold"
                  }
                >
                  {p.paid ? "PAID" : "PENDING"}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-2 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-1 pt-1">
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    <span className="font-semibold text-foreground">Violation:</span> {p.reason}
                  </p>
                  <p className="text-base font-extrabold text-foreground pt-1">
                    Fine Amount: <span className="text-blue-600">₹{p.amount.toLocaleString()}</span>
                  </p>
                  {p.transaction_id && (
                    <p className="text-[10px] text-muted-foreground">Receipt: {p.transaction_id}</p>
                  )}
                </div>

                <div className="pt-3 border-t mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {p.issued_at ? new Date(p.issued_at).toLocaleDateString() : "Active Notice"}
                  </span>
                  {!p.paid && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => payMutation.mutate(p.id)}
                      disabled={payMutation.isPending}
                      className="text-xs h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold">No Penalties Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {query ? "Try adjusting your search criteria" : "No penalties have been registered."}
          </p>
        </Card>
      )}

      {/* Issue Penalty Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Violation Penalty Fine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="violator-name">Violator / Vehicle Registration</Label>
              <Input
                id="violator-name"
                placeholder="e.g. Suresh Gowda (KA-01-MJ-4491)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="penalty-amount">Fine Amount (₹)</Label>
              <Input
                id="penalty-amount"
                type="number"
                placeholder="500"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="penalty-reason">Legal Violation Reason & Section</Label>
              <Input
                id="penalty-reason"
                placeholder="e.g. Illegal parking blocking bus corridor"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newReason || issueMutation.isPending}
              onClick={() => issueMutation.mutate()}
            >
              Issue Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
