import AdminBookingsTable from './AdminBookingsTable';
import AdminStats from './AdminStats';

function AdminDashboard() {
  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard__hero">
        <div className="admin-dashboard__copy">
          <p className="eyebrow">Admin User dashboard / Booking operations</p>
          <h1 id="admin-dashboard-title">Admin Dashboard</h1>
          <p>
            Review every local QuickFix request, track booking volume by status,
            and update appointment lifecycle details for the demo workspace.
          </p>
        </div>
      </div>

      <AdminStats />
      <AdminBookingsTable />
    </section>
  );
}

export default AdminDashboard;
