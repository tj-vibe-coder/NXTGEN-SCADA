export type RuntimeStatus = 'running' | 'stopped' | 'warning' | 'critical' | 'idle';

export const STATUS_COLORS: Record<RuntimeStatus, string> = {
    running: '#22c55e',
    stopped: '#6b7280',
    warning: '#f59e0b',
    critical: '#ef4444',
    idle: '#94a3b8',
};
