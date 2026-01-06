import { ScheduleResult, StatusType, STATUS_LABELS } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ScheduleGridProps {
  schedule: ScheduleResult;
}

function StatusCell({ status, day }: { status: StatusType; day: number }) {
  const baseClass = 'status-cell';
  const statusClass = status === '-' ? 'status-empty' : `status-${status}`;
  
  return (
    <div 
      className={cn(baseClass, statusClass)}
      title={`Día ${day}: ${STATUS_LABELS[status]}`}
    >
      {status}
    </div>
  );
}

function DrillingCountCell({ count, day, s3Active }: { count: number; day: number; s3Active: boolean }) {
  let countClass = 'count-valid';
  
  if (count > 2) {
    countClass = 'count-error';
  } else if (count < 2 && s3Active) {
    countClass = 'count-error';
  } else if (count < 2) {
    countClass = 'count-warning';
  }
  
  return (
    <div 
      className={cn('status-cell', countClass)}
      title={`Día ${day}: ${count} perforando`}
    >
      {count}
    </div>
  );
}

export function ScheduleGrid({ schedule }: ScheduleGridProps) {
  const { supervisors, drillingCount, totalDays } = schedule;
  
  // Find when S3 becomes active (first non-empty day)
  const s3FirstActiveDay = supervisors[2].days.findIndex(d => d !== '-');
  const s3StartsDrilling = s3FirstActiveDay > -1 
    ? supervisors[2].days.findIndex(d => d === 'P') 
    : totalDays;

  // Group days by weeks for better readability
  const daysPerRow = 30;
  const rows = Math.ceil(totalDays / daysPerRow);

  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const startDay = rowIndex * daysPerRow;
        const endDay = Math.min(startDay + daysPerRow, totalDays);
        
        return (
          <div key={rowIndex} className="glass-card p-4 rounded-lg">
            <div className="text-xs text-muted-foreground mb-3 font-mono">
              Días {startDay} - {endDay - 1}
            </div>
            <ScrollArea className="w-full">
              <div className="min-w-max">
                {/* Header row with day numbers */}
                <div className="flex gap-0.5 mb-1">
                  <div className="w-16 h-8 flex items-center justify-start text-xs font-medium text-muted-foreground">
                    Día
                  </div>
                  {Array.from({ length: endDay - startDay }).map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-8 flex items-center justify-center text-xs font-mono text-muted-foreground"
                    >
                      {startDay + i}
                    </div>
                  ))}
                </div>

                {/* Supervisor rows */}
                {supervisors.map((supervisor) => (
                  <div key={supervisor.id} className="flex gap-0.5 mb-0.5">
                    <div className="w-16 h-10 flex items-center justify-start text-sm font-semibold text-foreground">
                      {supervisor.id}
                    </div>
                    {supervisor.days.slice(startDay, endDay).map((status, i) => (
                      <StatusCell key={i} status={status} day={startDay + i} />
                    ))}
                  </div>
                ))}

                {/* Drilling count row */}
                <div className="flex gap-0.5 mt-2 pt-2 border-t border-border/50">
                  <div className="w-16 h-10 flex items-center justify-start text-xs font-medium text-muted-foreground">
                    #P
                  </div>
                  {drillingCount.slice(startDay, endDay).map((count, i) => (
                    <DrillingCountCell
                      key={i}
                      count={count}
                      day={startDay + i}
                      s3Active={startDay + i >= s3StartsDrilling}
                    />
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
