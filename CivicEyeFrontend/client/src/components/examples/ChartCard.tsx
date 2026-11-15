import { ChartCard } from "../chart-card";

export default function ChartCardExample() {
  const barData = [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 19 },
    { name: "Wed", value: 15 },
    { name: "Thu", value: 25 },
    { name: "Fri", value: 22 },
    { name: "Sat", value: 18 },
    { name: "Sun", value: 8 },
  ];

  const pieData = [
    { name: "Garbage", value: 35 },
    { name: "Potholes", value: 28 },
    { name: "Street Lights", value: 20 },
    { name: "Road Damage", value: 17 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
      <ChartCard
        title="Weekly Issue Reports"
        description="Number of issues reported per day"
        type="bar"
        data={barData}
        dataKey="value"
        xAxisKey="name"
      />
      <ChartCard
        title="Issues by Category"
        description="Distribution of issue types"
        type="pie"
        data={pieData}
        dataKey="value"
      />
    </div>
  );
}
