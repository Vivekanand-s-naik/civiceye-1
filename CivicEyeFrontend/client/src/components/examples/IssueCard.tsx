import { IssueCard } from "../issue-card";

export default function IssueCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
      <IssueCard
        id="1"
        title="Broken Streetlight on Main St"
        description="The streetlight near the intersection has been out for 3 days, causing safety concerns for pedestrians."
        status="open"
        category="Street Light"
        location="Main St & 5th Ave"
        date="2 days ago"
        imageUrl="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
        onClick={() => console.log("Issue clicked")}
      />
      <IssueCard
        id="2"
        title="Pothole on Highway 101"
        description="Large pothole causing traffic issues and vehicle damage."
        status="inprogress"
        category="Road Damage"
        location="Highway 101, Mile 42"
        date="5 days ago"
        onClick={() => console.log("Issue clicked")}
      />
      <IssueCard
        id="3"
        title="Garbage Overflow"
        description="Public bin overflowing, needs immediate attention."
        status="resolved"
        category="Garbage"
        location="Central Park Entrance"
        date="1 week ago"
        imageUrl="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop"
        onClick={() => console.log("Issue clicked")}
      />
    </div>
  );
}
