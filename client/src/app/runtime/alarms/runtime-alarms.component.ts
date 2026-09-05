import { Component } from '@angular/core';
import { STATUS_COLORS } from '../runtime-status.util';

interface RuntimeAlarm {
    time: string;
    tag: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    acked: boolean;
}

@Component({
    selector: 'runtime-alarms',
    templateUrl: './runtime-alarms.component.html',
    styleUrls: ['./runtime-alarms.component.scss', '../runtime-shared.scss']
})
export class RuntimeAlarmsComponent {
    statusColors = STATUS_COLORS;

    alarms: RuntimeAlarm[] = [
        { time: '09:42:11', tag: 'CNV-M3-FAULT', description: 'Conveyor Motor M3 overload trip', severity: 'critical', acked: false },
        { time: '09:38:55', tag: 'PE-3-LOSS', description: 'Photoeye PE-3 signal loss', severity: 'warning', acked: false },
        { time: '08:15:02', tag: 'TEMP-HIGH', description: 'Packaging zone temperature high', severity: 'warning', acked: true },
        { time: '07:50:30', tag: 'SHIFT-START', description: 'Shift change - Line reset', severity: 'info', acked: true },
    ];

    severityColor(severity: RuntimeAlarm['severity']): string {
        if (severity === 'critical') { return this.statusColors.critical; }
        if (severity === 'warning') { return this.statusColors.warning; }
        return this.statusColors.idle;
    }

    get activeCount(): number {
        return this.alarms.filter(a => !a.acked).length;
    }
}
