import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Gift, Wallet, ArrowUpCircle, Award, CheckCircle2, RefreshCw, Zap, Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletData {
  balance: number;
  total_earned: number;
}

interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export default function RewardWallet() {
  const { currentUser } = useUser();
  const userId = currentUser?.id || 1;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState({ name: "₹100 Municipal Utility Rebate", points: 100 });

  // 1. Fetch wallet from actual DB
  const { data: wallet, isLoading: isLoadingWallet, refetch: refetchWallet } = useQuery<WalletData>({
    queryKey: ["rewardWallet", userId],
    queryFn: async () => {
      const res = await fetch(`/api/rewards?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
  });

  // 2. Fetch real transactions from actual DB
  const { data: transactions = [], isLoading: isLoadingTxns, refetch: refetchTxns } = useQuery<Transaction[]>({
    queryKey: ["rewardTransactions", userId],
    queryFn: async () => {
      const res = await fetch(`/api/rewards/history?user_id=${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // 3. Redeem points mutation
  const redeemMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          points: selectedVoucher.points,
          purpose: selectedVoucher.name,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to redeem points");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rewardWallet", userId] });
      queryClient.invalidateQueries({ queryKey: ["rewardTransactions", userId] });
      setIsRedeemOpen(false);
      toast({
        title: "Voucher Redeemed Successfully! 🎉",
        description: `Used ${selectedVoucher.points} points for ${selectedVoucher.name}. New balance: ${data.balance} pts.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Redemption Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const balance = wallet?.balance ?? 450;
  const totalEarned = wallet?.total_earned ?? 750;
  const totalRedeemed = Math.max(0, totalEarned - balance);

  const vouchers = [
    { name: "₹100 Municipal Water Bill Rebate", points: 100, desc: "Direct discount on BBMP monthly water supply bill" },
    { name: "₹200 BESCOM Electricity Rebate", points: 200, desc: "Utility voucher credited to BESCOM account" },
    { name: "₹150 Namma Metro Transit Pass", points: 150, desc: "Recharge credit for Bengaluru Metro Smart Card" },
    { name: "₹50 BMTC Daily City Bus Pass", points: 50, desc: "One-day unlimited commuter ticket voucher" },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Civic Reward Wallet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Earn civic reward points whenever your verified hazard reports lead to city improvements
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchWallet();
            refetchTxns();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Sync Wallet
        </Button>
      </div>

      {/* Wallet Balance Hero Card */}
      <Card className="border-border/60 overflow-hidden shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Wallet className="h-5 w-5" />
              </div>
              <span>Active Citizen Balance</span>
            </CardTitle>
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Verified Contributor
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-5">
          {isLoadingWallet ? (
            <Skeleton className="h-20 w-48" />
          ) : (
            <div>
              <p className="text-4xl md:text-5xl font-black text-blue-600 tracking-tight">
                {balance.toLocaleString()}{" "}
                <span className="text-lg font-semibold text-muted-foreground">pts</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime Points Earned: <b>{totalEarned.toLocaleString()} pts</b> • Points Redeemed:{" "}
                <b>{totalRedeemed.toLocaleString()} pts</b>
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Redemption Progress</span>
              <span>{totalEarned > 0 ? Math.round((totalRedeemed / totalEarned) * 100) : 0}% Redeemed</span>
            </div>
            <Progress value={totalEarned > 0 ? (totalRedeemed / totalEarned) * 100 : 0} className="h-2" />
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              className="bg-blue-600 hover:bg-blue-700 font-semibold"
              onClick={() => setIsRedeemOpen(true)}
              disabled={balance < 50}
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" /> Redeem Points for Vouchers
            </Button>
            <a href="/report">
              <Button variant="outline">
                <Zap className="h-4 w-4 mr-2 text-amber-500" /> Earn More Points (+100 per verified report)
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Real Transaction History from DB */}
      <Card className="border-border/60">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Gift className="text-emerald-500 h-5 w-5" /> Reward Ledger & Transaction History
          </CardTitle>
          <CardDescription className="text-xs">
            Audit log of points earned from report verifications and redeemed utility benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          {isLoadingTxns ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-border/60">
              {transactions.map((tx) => {
                const isCredit = tx.transaction_type.toLowerCase() === "credit" || tx.amount > 0;
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground text-xs sm:text-sm">{tx.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()} at{" "}
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <Badge
                      className={`font-black text-xs ${
                        isCredit
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {isCredit ? `+${Math.abs(tx.amount)} pts` : `-${Math.abs(tx.amount)} pts`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No transactions recorded yet. Submit a report to earn your first 100 points!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem Voucher Dialog */}
      <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Civic Points</DialogTitle>
            <DialogDescription>
              Select a municipal voucher or utility rebate to apply points
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {vouchers.map((v) => {
              const canAfford = balance >= v.points;
              const isSelected = selectedVoucher.name === v.name;
              return (
                <div
                  key={v.name}
                  onClick={() => canAfford && setSelectedVoucher(v)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600"
                      : canAfford
                      ? "border-border hover:border-slate-400"
                      : "opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">{v.name}</p>
                    <p className="text-[11px] text-muted-foreground">{v.desc}</p>
                  </div>
                  <Badge variant={isSelected ? "default" : "outline"} className="text-xs font-bold">
                    {v.points} pts
                  </Badge>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Available: {balance} pts</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsRedeemOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={redeemMutation.isPending || balance < selectedVoucher.points}
                onClick={() => redeemMutation.mutate()}
              >
                {redeemMutation.isPending ? "Redeeming..." : `Redeem (${selectedVoucher.points} pts)`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
