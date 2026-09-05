import { Component } from '@angular/core';

interface EquipmentItem {
    name: string;
    hoursRun: number;
    nextServiceHours: number;
    status: 'ok' | 'due-soon' | 'overdue';
}

@Component({
    selector: 'runtime-maintenance',
    templateUrl: './runtime-maintenance.component.html',
    styleUrls: ['./runtime-maintenance.component.scss', '../runtime-shared.scss']
})
export class RuntimeMaintenanceComponent {
    equipment: EquipmentItem[] = [
        { name: 'Motor M1', hoursRun: 1180, nextServiceHours: 1500, status: 'ok' },
        { name: 'Motor M2', hoursRun: 1420, nextServiceHours: 1500, status: 'due-soon' },
        { name: 'Motor M3', hoursRun: 1610, nextServiceHours: 1500, status: 'overdue' },
        { name: 'Photoeye PE-1', hoursRun: 3020, nextServiceHours: 5000, status: 'ok' },
    ];

    progressPct(item: EquipmentItem): number {
        return Math.min(100, Math.round((item.hoursRun / item.nextServiceHours) * 100));
    }
}
