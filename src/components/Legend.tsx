import { STATUS_LABELS, StatusType } from '@/types/schedule';

const legendItems: { status: StatusType; class: string }[] = [
  { status: 'S', class: 'status-S' },
  { status: 'I', class: 'status-I' },
  { status: 'P', class: 'status-P' },
  { status: 'B', class: 'status-B' },
  { status: 'D', class: 'status-D' },
  { status: '-', class: 'status-empty' },
];

export function Legend() {
  return (
    <div className="flex flex-wrap gap-3 p-4 glass-card rounded-lg">
      {legendItems.map(({ status, class: className }) => (
        <div key={status} className="flex items-center gap-2">
          <div className={`status-cell w-8 h-8 text-xs ${className}`}>
            {status}
          </div>
          <span className="text-sm text-muted-foreground">
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
      
      <div className="border-l border-border/50 mx-2" />
      
      <div className="flex items-center gap-2">
        <div className="status-cell w-8 h-8 text-xs count-valid">2</div>
        <span className="text-sm text-muted-foreground">Correcto</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="status-cell w-8 h-8 text-xs count-warning">1</div>
        <span className="text-sm text-muted-foreground">Advertencia</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="status-cell w-8 h-8 text-xs count-error">3</div>
        <span className="text-sm text-muted-foreground">Error</span>
      </div>
    </div>
  );
}
