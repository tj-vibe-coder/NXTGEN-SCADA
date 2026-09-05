import { Component } from '@angular/core';

@Component({
    selector: 'runtime-trends',
    templateUrl: './runtime-trends.component.html',
    styleUrls: ['./runtime-trends.component.scss', '../runtime-shared.scss']
})
export class RuntimeTrendsComponent {
    timeLabels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

    series = [
        { name: 'Belt Speed (m/s)', color: '#06b6d4', points: [1.1, 1.2, 1.2, 1.15, 1.2, 0.4, 1.2] },
        { name: 'Motor Temp (°C)', color: '#f59e0b', points: [42, 44, 46, 48, 47, 50, 49] },
    ];

    gridLines = [0, 1, 2, 3, 4, 5];

    pointsToPath(points: number[], min: number, max: number): string {
        const w = 720;
        const h = 200;
        const step = w / (points.length - 1);
        return points
            .map((p, i) => {
                const x = i * step;
                const y = h - ((p - min) / (max - min)) * h;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
    }

    get maxima(): number[] {
        return this.series.map(s => Math.max(...s.points) * 1.1);
    }

    get minima(): number[] {
        return this.series.map(s => Math.min(...s.points) * 0.9);
    }
}
