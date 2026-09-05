import { Component } from '@angular/core';
import { STATUS_COLORS, RuntimeStatus } from '../runtime-status.util';

@Component({
    selector: 'runtime-conveyor',
    templateUrl: './runtime-conveyor.component.html',
    styleUrls: ['./runtime-conveyor.component.scss', '../runtime-shared.scss']
})
export class RuntimeConveyorComponent {
    statusColors = STATUS_COLORS;

    segments = Array.from({ length: 16 }, (_, i) => i + 1);

    motors: { id: string; x: number; status: RuntimeStatus; speed: string }[] = [
        { id: 'M1', x: 120, status: 'running', speed: '1.2 m/s' },
        { id: 'M2', x: 400, status: 'running', speed: '1.2 m/s' },
        { id: 'M3', x: 680, status: 'stopped', speed: '0.0 m/s' },
    ];

    sensors: { label: string; x: number; active: boolean }[] = [
        { label: 'PE-1', x: 220, active: true },
        { label: 'PE-2', x: 500, active: true },
        { label: 'PE-3', x: 760, active: false },
    ];

    beltSpeed = '1.2 m/s';
}
