import { useState } from 'react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { Legend } from '@/components/Legend';
import { ViolationsAlert } from '@/components/ViolationsAlert';
import { StatsPanel } from '@/components/StatsPanel';
import { generateSchedule } from '@/lib/scheduleAlgorithm';
import { ScheduleConfig, ScheduleResult } from '@/types/schedule';
import { HardHat, Pickaxe } from 'lucide-react';

const Index = () => {
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);

  const handleCalculate = (newConfig: ScheduleConfig) => {
    setConfig(newConfig);
    const result = generateSchedule(newConfig);
    setSchedule(result);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Pickaxe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Planificador de Turnos Mineros
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de cronogramas para supervisores de perforación
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Config Panel - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ConfigPanel onCalculate={handleCalculate} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!schedule ? (
              <div className="glass-card rounded-lg p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <HardHat className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Configure el Régimen de Trabajo
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ingrese los parámetros del régimen (días de trabajo, descanso, inducción) 
                  y haga clic en "Calcular Cronograma" para generar la planificación.
                </p>
              </div>
            ) : (
              <>
                {/* Stats */}
                {config && <StatsPanel schedule={schedule} config={config} />}

                {/* Legend */}
                <Legend />

                {/* Violations */}
                <ViolationsAlert violations={schedule.violations} />

                {/* Schedule Grid */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HardHat className="h-5 w-5 text-primary" />
                    Cronograma de Supervisores
                    {config && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        Régimen {config.workDays}x{config.restDays} | {config.inductionDays} días inducción
                      </span>
                    )}
                  </h2>
                  <ScheduleGrid schedule={schedule} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
