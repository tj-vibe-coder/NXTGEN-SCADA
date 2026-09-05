import { Component } from '@angular/core';
import { STATUS_COLORS, RuntimeStatus } from '../runtime-status.util';

@Component({
    selector: 'runtime-home',
    templateUrl: './runtime-home.component.html',
    styleUrls: ['./runtime-home.component.scss', '../runtime-shared.scss']
})
export class RuntimeHomeComponent {
    statusColors = STATUS_COLORS;

    kpis = [
        { label: 'Line Uptime', value: '97.4%' },
        { label: 'Units Produced Today', value: '4,812' },
        { label: 'Active Alarms', value: '2' },
        { label: 'Avg Cycle Time', value: '3.2s' },
    ];

    stages: { name: string; status: RuntimeStatus }[] = [
        { name: 'Infeed', status: 'running' },
        { name: 'Conveyor Line', status: 'running' },
        { name: 'Packaging', status: 'warning' },
    ];
}
