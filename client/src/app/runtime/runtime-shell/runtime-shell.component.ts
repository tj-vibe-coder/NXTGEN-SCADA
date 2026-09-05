import { Component } from '@angular/core';
import { RUNTIME_NAV_ITEMS, RuntimeNavItem } from '../runtime-nav.model';

@Component({
    selector: 'runtime-shell',
    templateUrl: './runtime-shell.component.html',
    styleUrls: ['./runtime-shell.component.scss']
})
export class RuntimeShellComponent {
    navItems: RuntimeNavItem[] = RUNTIME_NAV_ITEMS;
}
