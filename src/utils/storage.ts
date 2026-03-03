import type { OKRData, User, Organization } from '../types';

const STORAGE_KEY = 'okr-manager-data';
const USERS_KEY = 'okr-users';
const ORGANIZATIONS_KEY = 'okr-organizations';
const SESSION_KEY = 'okr-session';

const defaultData: OKRData = {
  objectives: [],
  teams: [],
  individuals: [],
};

export function loadData(): OKRData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return defaultData;
}

export function saveData(data: OKRData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${quarter} ${now.getFullYear()}`;
}

export function getQuarterOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const quarters: string[] = [];

  for (let y = year - 1; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q++) {
      quarters.push(`Q${q} ${y}`);
    }
  }

  return quarters;
}

// Auth storage functions
export function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load users from localStorage:', error);
  }
  return [];
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
}

export function loadOrganizations(): Organization[] {
  try {
    const stored = localStorage.getItem(ORGANIZATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load organizations from localStorage:', error);
  }
  return [];
}

export function saveOrganizations(organizations: Organization[]): void {
  try {
    localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(organizations));
  } catch (error) {
    console.error('Failed to save organizations to localStorage:', error);
  }
}

export interface Session {
  userId: string;
  organizationId: string;
}

export function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load session from localStorage:', error);
  }
  return null;
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
}

export function hashPassword(password: string): string {
  // Simple hash for mock authentication - not secure for production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
