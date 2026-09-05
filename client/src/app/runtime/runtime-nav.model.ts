export interface RuntimeNavItem {
    label: string;
    icon: string;
    path: string;
}

export const RUNTIME_NAV_ITEMS: RuntimeNavItem[] = [
    { label: 'Home', icon: 'home', path: 'home' },
    { label: 'Conveyor Overview', icon: 'precision_manufacturing', path: 'conveyor' },
    { label: 'Alarms', icon: 'warning', path: 'alarms' },
    { label: 'Trends', icon: 'show_chart', path: 'trends' },
    { label: 'Reports', icon: 'description', path: 'reports' },
    { label: 'Maintenance', icon: 'build', path: 'maintenance' },
    { label: 'User Management', icon: 'group', path: 'users' },
];
