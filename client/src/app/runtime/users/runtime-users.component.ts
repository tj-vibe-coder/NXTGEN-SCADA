import { Component } from '@angular/core';

interface RuntimeUser {
    name: string;
    role: 'Administrator' | 'Operator' | 'Viewer';
    lastLogin: string;
    active: boolean;
}

@Component({
    selector: 'runtime-users',
    templateUrl: './runtime-users.component.html',
    styleUrls: ['./runtime-users.component.scss', '../runtime-shared.scss']
})
export class RuntimeUsersComponent {
    users: RuntimeUser[] = [
        { name: 'T. Caballero', role: 'Administrator', lastLogin: 'Today 09:12', active: true },
        { name: 'J. Reyes', role: 'Operator', lastLogin: 'Today 07:45', active: true },
        { name: 'M. Santos', role: 'Operator', lastLogin: 'Yesterday 16:30', active: false },
        { name: 'A. Cruz', role: 'Viewer', lastLogin: '3 days ago', active: false },
    ];

    roleClass(role: RuntimeUser['role']): string {
        return 'role-' + role.toLowerCase();
    }
}
