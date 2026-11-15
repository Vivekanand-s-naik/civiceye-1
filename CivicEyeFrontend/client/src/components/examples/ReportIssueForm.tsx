import { ReportIssueForm } from "../report-issue-form";

export default function ReportIssueFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <ReportIssueForm
        onSubmit={(data) => console.log("Report submitted:", data)}
      />
    </div>
  );
}
