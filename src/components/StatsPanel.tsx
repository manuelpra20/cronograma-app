import { ScheduleResult, ScheduleConfig } from '@/types/schedule';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, HardHat, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatsPanelProps {
  schedule: ScheduleResult;
  config: ScheduleConfig;
}

export function StatsPanel({ schedule, config }: StatsPanelProps) {
  const totalDrillingDays = schedule.drillingCount.reduce((sum, count) => sum + count, 0);
  const validDays = schedule.drillingCount.filter(c => c === 2).length;
  const s3FirstDay = schedule.supervisors[2].days.findIndex(d => d !== '-');
  
  const stats = [
    {
      label: 'Total Días',
      value: schedule.totalDays,
      icon: Calendar,
      color: 'text-accent',
    },
    {
      label: 'Días Perforación',
      value: totalDrillingDays,
      icon: HardHat,
      color: 'text-status-perforacion',
    },
    {
      label: 'Días Correctos (2P)',
      value: validDays,
      icon: CheckCircle,
      color: 'text-validation-valid',
    },
    {
      label: 'Violaciones',
      value: schedule.violations.length,
      icon: AlertTriangle,
      color: schedule.violations.length > 0 ? 'text-validation-error' : 'text-validation-valid',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
