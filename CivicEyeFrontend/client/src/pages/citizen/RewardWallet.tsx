import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Gift, Wallet, ArrowUpCircle } from "lucide-react";

export default function RewardWallet() {
  const rewards = {
    totalPoints: 1450,
    redeemed: 600,
    available: 850,
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="text-blue-500" /> Civic Reward Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-semibold">
            Available Points: <span className="text-blue-600">{rewards.available}</span>
          </p>
          <Progress value={(rewards.redeemed / rewards.totalPoints) * 100} />
          <p className="text-muted-foreground text-sm">
            {rewards.redeemed} points redeemed out of {rewards.totalPoints}.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700 flex items-center gap-2">
            <ArrowUpCircle size={16} /> Redeem Now
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="text-green-500" /> Reward History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>+50 points — Reported garbage issue</li>
            <li>+100 points — Verified other citizen report</li>
            <li>-200 points — Redeemed for water bill discount</li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
