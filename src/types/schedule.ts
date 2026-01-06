export type StatusType = 'S' | 'I' | 'P' | 'B' | 'D' | '-';

export interface ScheduleConfig {
  workDays: number;      // N in NxM regime
  restDays: number;      // M in NxM regime
  inductionDays: number; // 1-5 days
  totalDrillingDays: number; // Target drilling days
}

export interface SupervisorSchedule {
  id: string;
  name: string;
  days: StatusType[];
}

export interface ScheduleResult {
  supervisors: SupervisorSchedule[];
  drillingCount: number[];
  totalDays: number;
  violations: ScheduleViolation[];
}

export interface ScheduleViolation {
  day: number;
  type: 'too_many' | 'too_few' | 'invalid_pattern';
  message: string;
}

export const STATUS_LABELS: Record<StatusType, string> = {
  'S': 'Subida',
  'I': 'Inducción',
  'P': 'Perforación',
  'B': 'Bajada',
  'D': 'Descanso',
  '-': 'Vacío'
};
