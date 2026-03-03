import type { OKRData } from '../types';

const STORAGE_KEY = 'okr-manager-data';

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
