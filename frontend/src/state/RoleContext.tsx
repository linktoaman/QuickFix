import { useEffect, useState, type ReactNode } from 'react';

import {
  isMockCustomerId,
  mockCustomers,
  type MockCustomerId,
} from '../data/mockCustomers';
import { RoleContext } from './roleContext';

export type Role = 'customer' | 'admin';

export type RoleContextValue = {
  selectedRole: Role | null;
  selectedCustomerId: MockCustomerId | null;
  selectRole: (role: Role) => void;
  selectCustomer: (customerId: MockCustomerId) => void;
  clearRole: () => void;
};

type RoleState = {
  selectedRole: Role | null;
  selectedCustomerId: MockCustomerId | null;
};

type StoredRolePayload = {
  selectedRole?: unknown;
  selectedCustomerId?: unknown;
};

export const QUICKFIX_ROLE_STORAGE_KEY = 'localStorage.quickfix.role.v1';

const firstCustomerId = mockCustomers[0]?.id ?? null;

const emptyRoleState: RoleState = {
  selectedRole: null,
  selectedCustomerId: null,
};

function isRole(value: unknown): value is Role {
  return value === 'customer' || value === 'admin';
}

function normalizeRoleState(value: unknown): RoleState {
  if (value === null || typeof value !== 'object') {
    return emptyRoleState;
  }

  const payload = value as StoredRolePayload;

  if (payload.selectedRole === null || payload.selectedRole === undefined) {
    return emptyRoleState;
  }

  if (!isRole(payload.selectedRole)) {
    return emptyRoleState;
  }

  if (payload.selectedRole === 'admin') {
    return {
      selectedRole: 'admin',
      selectedCustomerId: null,
    };
  }

  return {
    selectedRole: 'customer',
    selectedCustomerId: isMockCustomerId(payload.selectedCustomerId)
      ? payload.selectedCustomerId
      : firstCustomerId,
  };
}

function readStoredRoleState(): RoleState {
  if (typeof window === 'undefined') {
    return emptyRoleState;
  }

  try {
    const storedValue = window.localStorage.getItem(QUICKFIX_ROLE_STORAGE_KEY);

    if (storedValue === null) {
      return emptyRoleState;
    }

    return normalizeRoleState(JSON.parse(storedValue));
  } catch {
    window.localStorage.removeItem(QUICKFIX_ROLE_STORAGE_KEY);
    return emptyRoleState;
  }
}

function writeStoredRoleState(roleState: RoleState) {
  if (typeof window === 'undefined') {
    return;
  }

  if (roleState.selectedRole === null) {
    window.localStorage.removeItem(QUICKFIX_ROLE_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    QUICKFIX_ROLE_STORAGE_KEY,
    JSON.stringify(roleState),
  );
}

type RoleProviderProps = {
  children: ReactNode;
};

export function RoleProvider({ children }: RoleProviderProps) {
  const [roleState, setRoleState] = useState<RoleState>(emptyRoleState);
  const [hasLoadedStoredRole, setHasLoadedStoredRole] = useState(false);

  useEffect(() => {
    setRoleState(readStoredRoleState());
    setHasLoadedStoredRole(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredRole) {
      return;
    }

    writeStoredRoleState(roleState);
  }, [hasLoadedStoredRole, roleState]);

  function selectRole(role: Role) {
    if (!isRole(role)) {
      setRoleState(emptyRoleState);
      return;
    }

    setRoleState({
      selectedRole: role,
      selectedCustomerId: role === 'customer' ? firstCustomerId : null,
    });
  }

  function selectCustomer(customerId: MockCustomerId) {
    if (!isMockCustomerId(customerId)) {
      setRoleState(emptyRoleState);
      return;
    }

    setRoleState({
      selectedRole: 'customer',
      selectedCustomerId: customerId,
    });
  }

  function clearRole() {
    setRoleState(emptyRoleState);
  }

  const contextValue: RoleContextValue = {
    selectedRole: roleState.selectedRole,
    selectedCustomerId: roleState.selectedCustomerId,
    selectRole,
    selectCustomer,
    clearRole,
  };

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
}
