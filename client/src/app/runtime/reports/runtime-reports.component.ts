import { Component } from '@angular/core';

interface RuntimeReport {
    name: string;
    schedule: string;
    lastRun: string;
    status: 'generated' | 'pending' | 'failed';
}

@Component({
    selector: 'runtime-reports',
    templateUrl: './runtime-reports.component.html',
    styleUrls: ['./runtime-reports.component.scss', '../runtime-shared.scss']
})
export class RuntimeReportsComponent {
    reports: RuntimeReport[] = [
        { name: 'Shift Production Summary', schedule: 'Every 8 hours', lastRun: 'Today 06:00', status: 'generated' },
        { name: 'Daily Alarm Log', schedule: 'Daily at 00:00', lastRun: 'Today 00:00', status: 'generated' },
        { name: 'Weekly Maintenance Report', schedule: 'Weekly - Monday', lastRun: 'Pending', status: 'pending' },
        { name: 'Monthly OEE Report', schedule: 'Monthly - 1st', lastRun: 'Last month', status: 'failed' },
    ];

    statusIcon(status: RuntimeReport['status']): string {
        if (status === 'generated') { return 'check_circle'; }
        if (status === 'pending') { return 'schedule'; }
        return 'error';
    }
}
