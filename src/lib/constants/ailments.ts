export const AILMENTS = [
    'Healthy',
    'Burned 1',
    'Burned 2',
    'Burned 3',
    'Paralysis',
    'Frozen',
    'Poisoned',
    'Badly poisoned',
    'Asleep',
    'Flinched',
    'Confused',
    'Disabled',
    'Infatuatted',
] as const;

export type Ailment = typeof AILMENTS[number];