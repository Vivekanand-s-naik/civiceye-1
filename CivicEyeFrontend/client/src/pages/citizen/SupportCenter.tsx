import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SupportCenter() {
  const [form, setForm] = useState({ subject: "", message: "" });

  const handleSubmit = () => {
    toast({
      title: "Request Sent",
      description: "Our support team will contact you soon.",
    });
    setForm({ subject: "", message: "" });
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="text-blue-500" /> CivicEye Support Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <Textarea
            placeholder="Describe your issue..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
          />
          <Button className="bg-blue-600 text-white" onClick={handleSubmit}>
            Submit Request
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
