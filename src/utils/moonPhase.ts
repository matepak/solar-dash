/**
 * Moon phase calculation utilities.
 * Based on the synodic month (lunation) period of ~29.53059 days.
 * Reference new moon: January 6, 2000 18:14 UTC (a well-known new moon epoch).
 */

// Synodic month in days
const SYNODIC_MONTH = 29.53058867;

// Reference new moon: 2000-01-06 18:14 UTC
const REFERENCE_NEW_MOON = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));

export type MoonPhaseName =
    | 'New Moon'
    | 'Waxing Crescent'
    | 'First Quarter'
    | 'Waxing Gibbous'
    | 'Full Moon'
    | 'Waning Gibbous'
    | 'Last Quarter'
    | 'Waning Crescent';

export interface MoonPhaseData {
    /** Phase age in days (0 = new moon, ~14.76 = full moon) */
    age: number;
    /** Illumination fraction (0 to 1) */
    illumination: number;
    /** Phase name */
    phaseName: MoonPhaseName;
    /** Is the moon waxing (growing)? */
    isWaxing: boolean;
    /** Phase emoji */
    emoji: string;
    /** Phase index (0-7) */
    phaseIndex: number;
}

/**
 * Compute the moon's age in days for a given date.
 * Age 0 = new moon, ~14.76 = full moon, ~29.53 = next new moon.
 */
export function getMoonAge(date: Date): number {
    const diffMs = date.getTime() - REFERENCE_NEW_MOON.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    let age = diffDays % SYNODIC_MONTH;
    if (age < 0) age += SYNODIC_MONTH;
    return age;
}

/**
 * Map the moon age to a phase index (0-7).
 */
function getPhaseIndex(age: number): number {
    const phase = age / SYNODIC_MONTH; // 0 to 1
    // Divide the lunation into 8 equal segments
    return Math.floor(phase * 8) % 8;
}

/**
 * Get the illumination fraction (0 to 1) from the moon age.
 * Uses a simple cosine model.
 */
function getIllumination(age: number): number {
    // At age 0 (new moon), illumination = 0
    // At age ~14.76 (full moon), illumination = 1
    const phase = age / SYNODIC_MONTH; // 0 to 1
    return (1 - Math.cos(phase * 2 * Math.PI)) / 2;
}

const PHASE_NAMES: MoonPhaseName[] = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
];

const PHASE_EMOJIS: string[] = [
    '🌑', // New Moon
    '🌒', // Waxing Crescent
    '🌓', // First Quarter
    '🌔', // Waxing Gibbous
    '🌕', // Full Moon
    '🌖', // Waning Gibbous
    '🌗', // Last Quarter
    '🌘', // Waning Crescent
];

/**
 * Calculate complete moon phase data for a given date.
 */
export function getMoonPhase(date: Date = new Date()): MoonPhaseData {
    const age = getMoonAge(date);
    const phaseIndex = getPhaseIndex(age);
    const illumination = getIllumination(age);
    const isWaxing = age < SYNODIC_MONTH / 2;

    return {
        age,
        illumination,
        phaseName: PHASE_NAMES[phaseIndex],
        isWaxing,
        emoji: PHASE_EMOJIS[phaseIndex],
        phaseIndex,
    };
}

/**
 * Get moon phases for every day in a given month.
 */
export function getMonthMoonPhases(year: number, month: number): MoonPhaseData[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const phases: MoonPhaseData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day, 12, 0, 0); // noon local time
        phases.push(getMoonPhase(date));
    }

    return phases;
}

/**
 * Get the next occurrence of a specific phase.
 */
export function getNextPhaseDate(targetPhaseIndex: number, fromDate: Date = new Date()): Date {
    const currentAge = getMoonAge(fromDate);
    const targetAge = (targetPhaseIndex / 8) * SYNODIC_MONTH;

    let daysUntil = targetAge - currentAge;
    if (daysUntil <= 0) daysUntil += SYNODIC_MONTH;

    return new Date(fromDate.getTime() + daysUntil * 24 * 60 * 60 * 1000);
}
