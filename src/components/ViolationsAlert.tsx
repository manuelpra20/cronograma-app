import { ScheduleViolation } from '@/types/schedule';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ViolationsAlertProps {
  violations: ScheduleViolation[];
}

export function ViolationsAlert({ violations }: ViolationsAlertProps) {
  if (violations.length === 0) {
    return (
      <Alert className="border-validation-valid/30 bg-validation-valid/10">
        <CheckCircle2 className="h-5 w-5 text-validation-valid" />
        <AlertTitle className="text-validation-valid">Cronograma Válido</AlertTitle>
        <AlertDescription className="text-validation-valid/80">
          No se encontraron violaciones en las reglas del cronograma.
        </AlertDescription>
      </Alert>
    );
  }

  const tooMany = violations.filter(v => v.type === 'too_many');
  const tooFew = violations.filter(v => v.type === 'too_few');
  const invalidPatterns = violations.filter(v => v.type === 'invalid_pattern');

  return (
    <div className="space-y-3">
      {tooMany.length > 0 && (
        <Alert className="border-validation-error/30 bg-validation-error/10">
          <XCircle className="h-5 w-5 text-validation-error" />
          <AlertTitle className="text-validation-error">
            3 Supervisores Perforando ({tooMany.length} días)
          </AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-20 mt-2">
              <div className="text-sm text-validation-error/80 space-y-1">
                {tooMany.slice(0, 10).map((v, i) => (
                  <div key={i} className="font-mono text-xs">{v.message}</div>
                ))}
                {tooMany.length > 10 && (
                  <div className="text-xs opacity-60">...y {tooMany.length - 10} más</div>
                )}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {tooFew.length > 0 && (
        <Alert className="border-validation-error/30 bg-validation-error/10">
          <AlertTriangle className="h-5 w-5 text-validation-error" />
          <AlertTitle className="text-validation-error">
            Solo 1 Supervisor Perforando ({tooFew.length} días)
          </AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-20 mt-2">
              <div className="text-sm text-validation-error/80 space-y-1">
                {tooFew.slice(0, 10).map((v, i) => (
                  <div key={i} className="font-mono text-xs">{v.message}</div>
                ))}
                {tooFew.length > 10 && (
                  <div className="text-xs opacity-60">...y {tooFew.length - 10} más</div>
                )}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}

      {invalidPatterns.length > 0 && (
        <Alert className="border-validation-warning/30 bg-validation-warning/10">
          <AlertTriangle className="h-5 w-5 text-validation-warning" />
          <AlertTitle className="text-validation-warning">
            Patrones Inválidos ({invalidPatterns.length})
          </AlertTitle>
          <AlertDescription>
            <ScrollArea className="h-20 mt-2">
              <div className="text-sm text-validation-warning/80 space-y-1">
                {invalidPatterns.slice(0, 10).map((v, i) => (
                  <div key={i} className="font-mono text-xs">{v.message}</div>
                ))}
                {invalidPatterns.length > 10 && (
                  <div className="text-xs opacity-60">...y {invalidPatterns.length - 10} más</div>
                )}
              </div>
            </ScrollArea>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
