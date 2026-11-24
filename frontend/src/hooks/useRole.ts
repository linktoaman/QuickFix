import { useContext } from 'react';

import { RoleContext } from '../state/roleContext';

export function useRole() {
  const roleContext = useContext(RoleContext);

  if (roleContext === null) {
    throw new Error('useRole must be used within a RoleProvider.');
  }

  return roleContext;
}

export default useRole;
