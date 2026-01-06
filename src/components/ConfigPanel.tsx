import { useState } from 'react';
import { ScheduleConfig } from '@/types/schedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Calculator, Calendar, Users, Clock } from 'lucide-react';

interface ConfigPanelProps {
  onCalculate: (config: ScheduleConfig) => void;
}

export function ConfigPanel({ onCalculate }: ConfigPanelProps) {
  const [workDays, setWorkDays] = useState(14);
  const [restDays, setRestDays] = useState(7);
  const [inductionDays, setInductionDays] = useState(5);
  const [totalDrillingDays, setTotalDrillingDays] = useState(90);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      workDays,
      restDays,
      inductionDays,
      totalDrillingDays,
    });
  };

  const presets = [
    { label: '14x7 / 5 ind / 90d', work: 14, rest: 7, ind: 5, drill: 90 },
    { label: '21x7 / 3 ind / 90d', work: 21, rest: 7, ind: 3, drill: 90 },
    { label: '10x5 / 2 ind / 90d', work: 10, rest: 5, ind: 2, drill: 90 },
    { label: '14x6 / 4 ind / 95d', work: 14, rest: 6, ind: 4, drill: 95 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setWorkDays(preset.work);
    setRestDays(preset.rest);
    setInductionDays(preset.ind);
    setTotalDrillingDays(preset.drill);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5 text-primary" />
          Configuración del Régimen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Presets */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
              Preajustes Rápidos
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Regime NxM */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workDays" className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Días de Trabajo (N)
              </Label>
              <Input
                id="workDays"
                type="number"
                min={5}
                max={30}
                value={workDays}
                onChange={(e) => setWorkDays(Number(e.target.value))}
                className="input-industrial font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restDays" className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Días Libres (M)
              </Label>
              <Input
                id="restDays"
                type="number"
                min={3}
                max={14}
                value={restDays}
                onChange={(e) => setRestDays(Number(e.target.value))}
                className="input-industrial font-mono"
              />
            </div>
          </div>

          {/* Regime Display */}
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <span className="text-2xl font-bold font-mono text-primary">
              {workDays}x{restDays}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Descanso real: {Math.max(restDays - 2, 0)} días
            </p>
          </div>

          {/* Induction Days */}
          <div className="space-y-2">
            <Label htmlFor="inductionDays" className="flex items-center gap-1.5 text-sm">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Días de Inducción
            </Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={inductionDays === n ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 font-mono"
                  onClick={() => setInductionDays(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Total Drilling Days */}
          <div className="space-y-2">
            <Label htmlFor="totalDrillingDays" className="flex items-center gap-1.5 text-sm">
              <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
              Total Días de Perforación
            </Label>
            <Input
              id="totalDrillingDays"
              type="number"
              min={10}
              max={365}
              value={totalDrillingDays}
              onChange={(e) => setTotalDrillingDays(Number(e.target.value))}
              className="input-industrial font-mono"
            />
          </div>

          {/* Calculate Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold animate-pulse-glow"
          >
            <Calculator className="h-5 w-5 mr-2" />
            Calcular Cronograma
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
