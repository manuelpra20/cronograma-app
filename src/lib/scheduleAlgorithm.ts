import { ScheduleConfig, ScheduleResult, StatusType, SupervisorSchedule, ScheduleViolation } from '@/types/schedule';

export function generateSchedule(config: ScheduleConfig): ScheduleResult {
  const { workDays, restDays, inductionDays, totalDrillingDays } = config;
  
  // Calculate real rest days (excluding subida/bajada days)
  const realRestDays = restDays - 2;
  
  // First cycle drilling days = workDays - inductionDays
  const firstCycleDrilling = workDays - inductionDays;
  
  // S1 goes down on day: 1 + workDays (0-indexed: workDays)
  const s1DownDay = workDays;
  
  // S3 must enter to start drilling when S1 goes down
  // S3 entry day = s1DownDay - inductionDays - 1 (subida day)
  const s3EntryDay = s1DownDay - inductionDays - 1;
  
  // Calculate total days needed to achieve drilling target
  // We need enough cycles to accumulate totalDrillingDays of P status
  const estimatedTotalDays = Math.ceil(totalDrillingDays * 1.8) + workDays + restDays;
  
  // Initialize schedules
  const s1: StatusType[] = new Array(estimatedTotalDays).fill('-');
  const s2: StatusType[] = new Array(estimatedTotalDays).fill('-');
  const s3: StatusType[] = new Array(estimatedTotalDays).fill('-');
  
  // Generate S1 schedule (always follows complete regime without modifications)
  generateSupervisorCycle(s1, 0, workDays, restDays, inductionDays, estimatedTotalDays, true);
  
  // Generate S2 schedule (starts same as S1 but adjusts)
  generateS2Schedule(s2, s1, s3EntryDay, workDays, restDays, inductionDays, estimatedTotalDays);
  
  // Generate S3 schedule (enters when needed to maintain 2 drilling)
  generateS3Schedule(s3, s1, s2, s3EntryDay, workDays, restDays, inductionDays, estimatedTotalDays);
  
  // Trim to actual needed length based on drilling count
  const { trimmedLength, accumulatedDrilling } = calculateTrimLength(s1, s2, s3, totalDrillingDays);
  
  const finalLength = Math.max(trimmedLength, estimatedTotalDays);
  
  // Calculate drilling count per day
  const drillingCount: number[] = [];
  for (let i = 0; i < finalLength; i++) {
    let count = 0;
    if (s1[i] === 'P') count++;
    if (s2[i] === 'P') count++;
    if (s3[i] === 'P') count++;
    drillingCount.push(count);
  }
  
  // Find violations
  const violations = findViolations(s1, s2, s3, drillingCount, s3EntryDay + inductionDays + 1);
  
  const supervisors: SupervisorSchedule[] = [
    { id: 'S1', name: 'Supervisor 1', days: s1.slice(0, finalLength) },
    { id: 'S2', name: 'Supervisor 2', days: s2.slice(0, finalLength) },
    { id: 'S3', name: 'Supervisor 3', days: s3.slice(0, finalLength) },
  ];
  
  return {
    supervisors,
    drillingCount: drillingCount.slice(0, finalLength),
    totalDays: finalLength,
    violations,
  };
}

function generateSupervisorCycle(
  schedule: StatusType[],
  startDay: number,
  workDays: number,
  restDays: number,
  inductionDays: number,
  totalDays: number,
  includeInduction: boolean
): void {
  let day = startDay;
  let isFirstCycle = true;
  
  while (day < totalDays) {
    // Subida (1 day)
    if (day < totalDays) {
      schedule[day] = 'S';
      day++;
    }
    
    // Inducción (only first cycle or if specified)
    if (isFirstCycle && includeInduction) {
      for (let i = 0; i < inductionDays && day < totalDays; i++) {
        schedule[day] = 'I';
        day++;
      }
    }
    
    // Perforación (remaining work days)
    const drillingDays = isFirstCycle ? (workDays - inductionDays) : (workDays - 1);
    for (let i = 0; i < drillingDays && day < totalDays; i++) {
      schedule[day] = 'P';
      day++;
    }
    
    // Bajada (1 day)
    if (day < totalDays) {
      schedule[day] = 'B';
      day++;
    }
    
    // Descanso (real rest days)
    const realRest = restDays - 2;
    for (let i = 0; i < realRest && day < totalDays; i++) {
      schedule[day] = 'D';
      day++;
    }
    
    isFirstCycle = false;
  }
}

function generateS2Schedule(
  s2: StatusType[],
  s1: StatusType[],
  s3EntryDay: number,
  workDays: number,
  restDays: number,
  inductionDays: number,
  totalDays: number
): void {
  let day = 0;
  let isFirstCycle = true;
  const realRest = restDays - 2;
  
  while (day < totalDays) {
    // Subida
    s2[day] = 'S';
    day++;
    
    // Inducción (first cycle only)
    if (isFirstCycle) {
      for (let i = 0; i < inductionDays && day < totalDays; i++) {
        s2[day] = 'I';
        day++;
      }
    }
    
    // Calculate how many drilling days before needing to go down
    const drillingDays = isFirstCycle ? (workDays - inductionDays) : (workDays - 1);
    
    // Check if we need to adjust for S3 entry in first cycle
    if (isFirstCycle) {
      // S2 needs to leave when S3 starts drilling
      const s3StartsDrilling = s3EntryDay + 1 + inductionDays;
      const s2DrillingStart = 1 + inductionDays;
      const adjustedDrillingDays = Math.max(s3StartsDrilling - s2DrillingStart - 1, drillingDays - 1);
      
      for (let i = 0; i < adjustedDrillingDays && day < totalDays; i++) {
        s2[day] = 'P';
        day++;
      }
    } else {
      // Normal drilling
      for (let i = 0; i < drillingDays && day < totalDays; i++) {
        s2[day] = 'P';
        day++;
      }
    }
    
    // Bajada
    if (day < totalDays) {
      s2[day] = 'B';
      day++;
    }
    
    // Descanso - but need to come back when S1 goes down or S3 goes down
    let restCount = 0;
    while (restCount < realRest && day < totalDays) {
      // Check if S1 or S3 is going down soon and we need to come back
      const needToReturn = shouldS2Return(s1, s2, day, workDays, restDays);
      
      if (needToReturn && restCount >= 1) {
        break; // Come back early
      }
      
      s2[day] = 'D';
      day++;
      restCount++;
    }
    
    isFirstCycle = false;
  }
}

function shouldS2Return(s1: StatusType[], s2: StatusType[], currentDay: number, workDays: number, restDays: number): boolean {
  // Look ahead to see if only one will be drilling
  for (let ahead = 1; ahead <= 5 && currentDay + ahead < s1.length; ahead++) {
    const futureDay = currentDay + ahead;
    if (s1[futureDay] === 'B' || s1[futureDay] === 'D') {
      return true;
    }
  }
  return false;
}

function generateS3Schedule(
  s3: StatusType[],
  s1: StatusType[],
  s2: StatusType[],
  entryDay: number,
  workDays: number,
  restDays: number,
  inductionDays: number,
  totalDays: number
): void {
  let day = entryDay;
  let isFirstCycle = true;
  const realRest = restDays - 2;
  
  // Before entry day, S3 is not present
  for (let i = 0; i < entryDay; i++) {
    s3[i] = '-';
  }
  
  while (day < totalDays) {
    // Subida
    if (day < totalDays) {
      s3[day] = 'S';
      day++;
    }
    
    // Inducción (first cycle only)
    if (isFirstCycle) {
      for (let i = 0; i < inductionDays && day < totalDays; i++) {
        s3[day] = 'I';
        day++;
      }
    }
    
    // Perforación
    const drillingDays = isFirstCycle ? (workDays - inductionDays) : (workDays - 1);
    for (let i = 0; i < drillingDays && day < totalDays; i++) {
      s3[day] = 'P';
      day++;
    }
    
    // Bajada
    if (day < totalDays) {
      s3[day] = 'B';
      day++;
    }
    
    // Descanso
    for (let i = 0; i < realRest && day < totalDays; i++) {
      s3[day] = 'D';
      day++;
    }
    
    isFirstCycle = false;
  }
}

function calculateTrimLength(
  s1: StatusType[],
  s2: StatusType[],
  s3: StatusType[],
  targetDrillingDays: number
): { trimmedLength: number; accumulatedDrilling: number } {
  let accumulated = 0;
  let trimmedLength = 0;
  
  for (let i = 0; i < s1.length; i++) {
    let dailyDrilling = 0;
    if (s1[i] === 'P') dailyDrilling++;
    if (s2[i] === 'P') dailyDrilling++;
    if (s3[i] === 'P') dailyDrilling++;
    
    accumulated += dailyDrilling;
    trimmedLength = i + 1;
    
    if (accumulated >= targetDrillingDays * 2) { // *2 because we want 2 drilling per day
      break;
    }
  }
  
  return { trimmedLength, accumulatedDrilling: accumulated };
}

function findViolations(
  s1: StatusType[],
  s2: StatusType[],
  s3: StatusType[],
  drillingCount: number[],
  s3ActiveDay: number
): ScheduleViolation[] {
  const violations: ScheduleViolation[] = [];
  
  for (let i = 0; i < drillingCount.length; i++) {
    const count = drillingCount[i];
    
    // Check for 3 drilling (always an error)
    if (count > 2) {
      violations.push({
        day: i,
        type: 'too_many',
        message: `Día ${i}: ${count} supervisores perforando (máximo 2)`,
      });
    }
    
    // Check for 1 drilling (error only after S3 is active)
    if (count === 1 && i >= s3ActiveDay) {
      violations.push({
        day: i,
        type: 'too_few',
        message: `Día ${i}: Solo 1 supervisor perforando (mínimo 2)`,
      });
    }
    
    // Check for invalid patterns
    const schedules = [s1, s2, s3];
    const names = ['S1', 'S2', 'S3'];
    
    for (let j = 0; j < 3; j++) {
      if (i < schedules[j].length - 1) {
        const current = schedules[j][i];
        const next = schedules[j][i + 1];
        
        // S-S pattern
        if (current === 'S' && next === 'S') {
          violations.push({
            day: i,
            type: 'invalid_pattern',
            message: `${names[j]} día ${i}: Patrón S-S inválido`,
          });
        }
        
        // S-B pattern (subida followed immediately by bajada)
        if (current === 'S' && next === 'B') {
          violations.push({
            day: i,
            type: 'invalid_pattern',
            message: `${names[j]} día ${i}: Patrón S-B inválido (sin perforación)`,
          });
        }
      }
    }
  }
  
  return violations;
}
