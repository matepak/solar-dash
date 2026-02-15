import React, { useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    useTheme,
    Tooltip,
    IconButton,
    Chip,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
} from '@mui/icons-material';
import {
    getMoonPhase,
    getMonthMoonPhases,
    getNextPhaseDate,
    type MoonPhaseData,
} from '../utils/moonPhase';

// ─── SVG Moon Phase Path Builder ────────────────────────────────────────
// Shared logic for building the illuminated area SVG path from moon age.
// The key insight: the terminator (shadow boundary) is an ellipse whose
// x-radius = |cos(phaseAngle)| * r. The sweep flags on the two arcs
// (outer edge + terminator) must be set correctly for each of the 4
// phase quadrants to enclose the illuminated area.

const SYNODIC = 29.53058867;

function buildMoonPhasePath(
    age: number,
    cx: number,
    cy: number,
    r: number
): { path: string; illumination: number } {
    const phase = age / SYNODIC; // 0 to 1
    const theta = phase * 2 * Math.PI;
    const illumination = (1 - Math.cos(theta)) / 2;

    if (illumination <= 0.01) return { path: '', illumination };
    if (illumination >= 0.99) {
        return {
            path: `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`,
            illumination,
        };
    }

    // Terminator ellipse x-radius
    const tx = Math.abs(Math.cos(theta)) * r;

    // Determine sweep flags based on phase quadrant:
    // Arc 1 (outer edge): top → bottom
    //   sweep=1 (CW) → right semicircle  |  sweep=0 (CCW) → left semicircle
    // Arc 2 (terminator): bottom → top
    //   The flag is chosen so the terminator curves alongside (crescent)
    //   or opposite (gibbous) the outer edge.
    let s1: number, s2: number;

    if (phase < 0.25) {
        // Waxing Crescent — thin sliver on RIGHT
        s1 = 1; s2 = 0;
    } else if (phase < 0.5) {
        // Waxing Gibbous — more than half, lit on RIGHT
        s1 = 1; s2 = 1;
    } else if (phase < 0.75) {
        // Waning Gibbous — more than half, lit on LEFT
        s1 = 0; s2 = 0;
    } else {
        // Waning Crescent — thin sliver on LEFT
        s1 = 0; s2 = 1;
    }

    return {
        path: `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${s1} ${cx} ${cy + r} A ${tx} ${r} 0 0 ${s2} ${cx} ${cy - r} Z`,
        illumination,
    };
}

// ─── SVG Moon Renderer ──────────────────────────────────────────────────
interface MoonSvgProps {
    age: number; // Moon age in days (0 to ~29.53)
    size?: number;
}

/**
 * Renders a realistic SVG moon with proper shadow/illumination.
 * Uses an elliptical terminator technique to create the crescent shape.
 */
const MoonSvg: React.FC<MoonSvgProps> = ({ age, size = 160 }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const r = size / 2 - 4; // radius with padding
    const cx = size / 2;
    const cy = size / 2;

    const { path: illuminatedPath, illumination } = useMemo(
        () => buildMoonPhasePath(age, cx, cy, r),
        [age, cx, cy, r]
    );

    // Subtle surface texture colors
    const moonBaseColor = isDark ? '#1a1a2e' : '#2a2a3e';
    const moonLitColor = isDark ? '#d4d4d8' : '#e8e8ec';
    const moonLitColorAlt = isDark ? '#b8b8be' : '#d0d0d6';
    const glowColor = isDark
        ? 'rgba(180, 200, 255, 0.15)'
        : 'rgba(180, 200, 255, 0.25)';

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ filter: isDark ? `drop-shadow(0 0 ${size * 0.1}px ${glowColor})` : 'none' }}
        >
            <defs>
                {/* Moon surface gradient */}
                <radialGradient id="moonSurface" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor={moonLitColor} />
                    <stop offset="70%" stopColor={moonLitColorAlt} />
                    <stop offset="100%" stopColor={isDark ? '#8a8a90' : '#a0a0a8'} />
                </radialGradient>
                {/* Subtle crater texture overlay */}
                <radialGradient id="crater1" cx="55%" cy="40%" r="12%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <radialGradient id="crater2" cx="35%" cy="60%" r="8%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <radialGradient id="crater3" cx="60%" cy="65%" r="10%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.07)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                {/* Glow effect for full/near-full moon */}
                {illumination > 0.7 && (
                    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="85%" stopColor="transparent" />
                        <stop offset="100%" stopColor={glowColor} />
                    </radialGradient>
                )}
            </defs>

            {/* Outer glow for bright phases */}
            {illumination > 0.7 && (
                <circle cx={cx} cy={cy} r={r + 8} fill="url(#moonGlow)" />
            )}

            {/* Dark side of the moon */}
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={moonBaseColor}
                stroke={isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.2)'}
                strokeWidth="1"
            />

            {/* Illuminated area */}
            {illuminatedPath && (
                <>
                    <clipPath id="moonClip">
                        <circle cx={cx} cy={cy} r={r} />
                    </clipPath>
                    <path
                        d={illuminatedPath}
                        fill="url(#moonSurface)"
                        clipPath="url(#moonClip)"
                    />
                    {/* Crater texture overlays on illuminated side */}
                    <circle cx={cx} cy={cy} r={r} fill="url(#crater1)" clipPath="url(#moonClip)" />
                    <circle cx={cx} cy={cy} r={r} fill="url(#crater2)" clipPath="url(#moonClip)" />
                    <circle cx={cx} cy={cy} r={r} fill="url(#crater3)" clipPath="url(#moonClip)" />
                </>
            )}

            {/* Subtle edge highlight */}
            <circle
                cx={cx}
                cy={cy}
                r={r - 0.5}
                fill="none"
                stroke={isDark ? 'rgba(200, 210, 230, 0.1)' : 'rgba(100, 116, 139, 0.15)'}
                strokeWidth="1"
            />
        </svg>
    );
};

// ─── Mini Moon Icon for Calendar ────────────────────────────────────────
interface MiniMoonProps {
    phase: MoonPhaseData;
    size?: number;
}

const MiniMoon: React.FC<MiniMoonProps> = ({ phase, size = 18 }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const r = size / 2 - 1;
    const cx = size / 2;
    const cy = size / 2;

    const { path: litPath } = buildMoonPhasePath(phase.age, cx, cy, r);
    const baseColor = isDark ? '#1a1a2e' : '#2a2a3e';
    const litColor = isDark ? '#c8c8d0' : '#dddde2';

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill={baseColor} />
            {litPath && (
                <>
                    <clipPath id={`miniClip-${phase.age.toFixed(2)}`}>
                        <circle cx={cx} cy={cy} r={r} />
                    </clipPath>
                    <path d={litPath} fill={litColor} clipPath={`url(#miniClip-${phase.age.toFixed(2)})`} />
                </>
            )}
        </svg>
    );
};

// ─── Monthly Calendar ───────────────────────────────────────────────────
interface MoonCalendarProps {
    year: number;
    month: number;
    onMonthChange: (year: number, month: number) => void;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MoonCalendar: React.FC<MoonCalendarProps> = ({ year, month, onMonthChange }) => {
    const theme = useTheme();
    const phases = useMemo(() => getMonthMoonPhases(year, month), [year, month]);

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Get the day of week for the 1st (0=Sun -> convert to Mon=0)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Monday-based

    const daysInMonth = phases.length;

    const handlePrev = () => {
        if (month === 0) onMonthChange(year - 1, 11);
        else onMonthChange(year, month - 1);
    };

    const handleNext = () => {
        if (month === 11) onMonthChange(year + 1, 0);
        else onMonthChange(year, month + 1);
    };

    return (
        <Box>
            {/* Month navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <IconButton size="small" onClick={handlePrev} aria-label="Previous month">
                    <ChevronLeft fontSize="small" />
                </IconButton>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {MONTH_NAMES[month]} {year}
                </Typography>
                <IconButton size="small" onClick={handleNext} aria-label="Next month">
                    <ChevronRight fontSize="small" />
                </IconButton>
            </Box>

            {/* Day headers */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                    mb: 0.5,
                }}
            >
                {DAY_HEADERS.map((day) => (
                    <Typography
                        key={day}
                        variant="caption"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 600,
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                        }}
                    >
                        {day}
                    </Typography>
                ))}
            </Box>

            {/* Calendar grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                }}
            >
                {/* Empty cells for offset */}
                {Array.from({ length: startOffset }).map((_, i) => (
                    <Box key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {phases.map((phase, dayIndex) => {
                    const day = dayIndex + 1;
                    const isToday = isCurrentMonth && today.getDate() === day;

                    return (
                        <Tooltip
                            key={day}
                            title={`${day} ${MONTH_NAMES[month]} — ${phase.phaseName} (${Math.round(phase.illumination * 100)}%)`}
                            arrow
                            placement="top"
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: '2px',
                                    borderRadius: '4px',
                                    cursor: 'default',
                                    border: isToday
                                        ? `1.5px solid ${theme.palette.primary.main}`
                                        : '1.5px solid transparent',
                                    bgcolor: isToday
                                        ? theme.palette.mode === 'dark'
                                            ? 'rgba(144, 202, 249, 0.08)'
                                            : 'rgba(25, 118, 210, 0.04)'
                                        : 'transparent',
                                    '&:hover': {
                                        bgcolor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.04)'
                                                : 'rgba(0,0,0,0.02)',
                                    },
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.6rem',
                                        lineHeight: 1.2,
                                        fontWeight: isToday ? 700 : 400,
                                        color: isToday ? 'primary.main' : 'text.secondary',
                                    }}
                                >
                                    {day}
                                </Typography>
                                <MiniMoon phase={phase} size={16} />
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Box>
    );
};

// ─── Upcoming Phases Timeline ───────────────────────────────────────────
const MAJOR_PHASES = [
    { index: 0, name: 'New Moon', emoji: '🌑' },
    { index: 2, name: 'First Quarter', emoji: '🌓' },
    { index: 4, name: 'Full Moon', emoji: '🌕' },
    { index: 6, name: 'Last Quarter', emoji: '🌗' },
];

const UpcomingPhases: React.FC = () => {
    const now = new Date();

    const upcoming = useMemo(() => {
        return MAJOR_PHASES.map(({ index, name, emoji }) => {
            const date = getNextPhaseDate(index, now);
            const daysUntil = Math.ceil(
                (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            return { name, emoji, date, daysUntil };
        }).sort((a, b) => a.daysUntil - b.daysUntil);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [now.toDateString()]);

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {upcoming.map(({ name, emoji, daysUntil }) => (
                <Tooltip key={name} title={`${name} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`} arrow>
                    <Chip
                        label={`${emoji} ${daysUntil}d`}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontSize: '0.75rem',
                            height: 26,
                            borderColor: 'divider',
                        }}
                    />
                </Tooltip>
            ))}
        </Box>
    );
};

// ─── Main Widget ────────────────────────────────────────────────────────
const MoonPhaseWidget: React.FC = () => {
    const theme = useTheme();
    const now = new Date();

    const currentPhase = useMemo(() => getMoonPhase(now), [now.toDateString()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps

    const [calYear, setCalYear] = useState(now.getFullYear());
    const [calMonth, setCalMonth] = useState(now.getMonth());

    const handleMonthChange = (year: number, month: number) => {
        setCalYear(year);
        setCalMonth(month);
    };

    return (
        <Paper
            sx={{
                p: 2,
                boxShadow: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Typography variant="h6" component="div" gutterBottom>
                Moon Phase
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    flexGrow: 1,
                }}
            >
                {/* Left: Current moon visualization */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: { sm: 200 },
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                        }}
                    >
                        <MoonSvg
                            age={currentPhase.age}
                            size={140}
                        />
                    </Box>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 0.5,
                            textAlign: 'center',
                            background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                                : 'linear-gradient(135deg, #334155, #64748b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {currentPhase.phaseName}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, textAlign: 'center' }}
                    >
                        {Math.round(currentPhase.illumination * 100)}% illuminated
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mb: 1.5, textAlign: 'center' }}
                    >
                        Age: {currentPhase.age.toFixed(1)} / 29.5 days
                    </Typography>

                    {/* Upcoming phases */}
                    <UpcomingPhases />
                </Box>

                {/* Right: Monthly calendar */}
                <Box
                    sx={{
                        flexGrow: 1,
                        minWidth: { sm: 220 },
                        borderLeft: { sm: `1px solid ${theme.palette.divider}` },
                        pl: { sm: 2 },
                        pt: { xs: 2, sm: 0 },
                        borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
                    }}
                >
                    <MoonCalendar
                        year={calYear}
                        month={calMonth}
                        onMonthChange={handleMonthChange}
                    />
                </Box>
            </Box>
        </Paper>
    );
};

export default MoonPhaseWidget;
