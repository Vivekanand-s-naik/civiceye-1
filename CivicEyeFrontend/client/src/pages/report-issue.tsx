import { ReportIssueForm } from "@/components/report-issue-form";
import { useToast } from "@/hooks/use-toast";

export default function ReportIssuePage() {
  const { toast } = useToast();

  const handleSubmit = (data: any) => {
    //todo: remove mock functionality
    console.log("Issue reported:", data);
    toast({
      title: "Issue Reported Successfully",
      description: "Your report has been submitted and will be reviewed by authorities.",
    });
  };

  return (
    <div className="max-w-2xl mx-auto" data-testid="page-report-issue">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">
          Help improve your community by reporting civic issues
        </p>
      </div>
      <ReportIssueForm onSubmit={handleSubmit} />
    </div>
  );
}
