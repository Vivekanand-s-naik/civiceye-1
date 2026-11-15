import AdminDashboard from "../admin-dashboard";

// export default function AdminDashboardExample() {
//   return (
//     <div className="p-8">
//       <AdminDashboard />
//     </div>
//   );
// }
// src/pages/admin/AdminDashboard.tsx
export default function AdminDashboardExample() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <AdminDashboard />
      <p>Welcome, system administrator!</p>
    </div>
  );
}
