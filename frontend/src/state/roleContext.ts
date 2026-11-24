import { createContext } from 'react';

import type { RoleContextValue } from './RoleContext';

export const RoleContext = createContext<RoleContextValue | null>(null);
