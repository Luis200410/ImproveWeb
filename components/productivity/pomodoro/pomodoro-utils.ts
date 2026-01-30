
export const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const calculateEfficiency = (workedMinutes: number, goalMinutes: number): number => {
    if (goalMinutes === 0) return 0;
    return Math.min(100, Math.round((workedMinutes / goalMinutes) * 100));
}

export interface PomodoroConfig {
    sprintDuration: number; // minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStartBreaks: boolean;
    autoStartSprints: boolean;
    sessionsBeforeLongBreak: number;
}

export const DEFAULT_CONFIG: PomodoroConfig = {
    sprintDuration: 50,
    shortBreakDuration: 7,
    longBreakDuration: 25,
    autoStartBreaks: true,
    autoStartSprints: false,
    sessionsBeforeLongBreak: 4
}
