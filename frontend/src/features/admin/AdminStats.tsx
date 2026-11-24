import type { BookingStatusCounts } from '../../domain/booking';
import useBookings from '../../hooks/useBookings';

type AdminStatItem = {
  label: keyof BookingStatusCounts;
  tone: 'total' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

const ADMIN_STAT_ITEMS: readonly AdminStatItem[] = [
  {
    label: 'Total',
    tone: 'total',
  },
  {
    label: 'Pending',
    tone: 'pending',
  },
  {
    label: 'Confirmed',
    tone: 'confirmed',
  },
  {
    label: 'Completed',
    tone: 'completed',
  },
  {
    label: 'Cancelled',
    tone: 'cancelled',
  },
];

function AdminStats() {
  const { getStatusCounts } = useBookings();
  const statusCounts = getStatusCounts();

  return (
    <section className="qf-admin-stats" aria-labelledby="admin-stats-title">
      <div className="qf-admin-stats__header">
        <p className="eyebrow">Operations summary</p>
        <h2 id="admin-stats-title">Booking stats</h2>
      </div>
      <dl className="qf-admin-stats__grid">
        {ADMIN_STAT_ITEMS.map((item) => (
          <div
            className={`qf-admin-stat-card qf-admin-stat-card--${item.tone}`}
            key={item.label}
          >
            <dt className="qf-admin-stat-card__label">{item.label}</dt>
            <dd className="qf-admin-stat-card__value">
              {statusCounts[item.label]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default AdminStats;
