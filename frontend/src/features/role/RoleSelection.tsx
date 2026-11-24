import { type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { isMockCustomerId, mockCustomers } from '../../data/mockCustomers';
import useRole from '../../hooks/useRole';
import type { Role } from '../../state/RoleContext';

const customerWorkspacePath = '/book';
const adminWorkspacePath = '/admin';

function isRole(value: string): value is Role {
  return value === 'customer' || value === 'admin';
}

function RoleSelection() {
  const {
    selectedRole,
    selectedCustomerId,
    selectRole,
    selectCustomer,
  } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const roleValue = selectedRole ?? '';
  const customerValue = selectedCustomerId ?? mockCustomers[0]?.id ?? '';

  function handleRoleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextRole = event.target.value;

    if (!isRole(nextRole)) {
      return;
    }

    selectRole(nextRole);

    if (nextRole === 'admin') {
      navigate(adminWorkspacePath);
      return;
    }

    if (location.pathname === adminWorkspacePath) {
      navigate(customerWorkspacePath);
    }
  }

  function handleCustomerChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCustomerId = event.target.value;

    if (!isMockCustomerId(nextCustomerId)) {
      return;
    }

    selectCustomer(nextCustomerId);
  }

  return (
    <section className="role-selection" aria-label="Simulated role controls">
      <div className="role-selection__fields">
        <label className="role-selection__field">
          <span>Mode</span>
          <select
            aria-describedby="role-selection-note"
            value={roleValue}
            onChange={handleRoleChange}
          >
            <option value="" disabled>
              Choose mode
            </option>
            <option value="customer">Customer/Homeowner or Tenant</option>
            <option value="admin">Admin User</option>
          </select>
        </label>

        {selectedRole === 'customer' && (
          <label className="role-selection__field">
            <span>Customer</span>
            <select value={customerValue} onChange={handleCustomerChange}>
              {mockCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.displayName} - {customer.neighborhood}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <p className="role-selection__note" id="role-selection-note">
        Simulated role controls only. Browser-only; no real authentication.
      </p>
    </section>
  );
}

export default RoleSelection;
