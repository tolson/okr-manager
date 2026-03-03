export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: 'admin' | 'member';
  passwordHash: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  level: 'company' | 'team' | 'individual';
  parentId: string | null;
  teamId?: string;
  ownerId?: string;
  keyResults: KeyResult[];
  quarter: string;
}

export interface Team {
  id: string;
  name: string;
  organizationId: string;
}

export interface Individual {
  id: string;
  name: string;
  teamId: string;
}

export interface OKRData {
  objectives: Objective[];
  teams: Team[];
  individuals: Individual[];
}

export type OKRLevel = 'company' | 'team' | 'individual';
