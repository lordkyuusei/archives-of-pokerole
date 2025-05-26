export const TrainerSkills = ['Brawl'
    , 'Throw'
    , 'Evasion'
    , 'Weapons'
    , 'Alert'
    , 'Athletic'
    , 'Nature'
    , 'Stealth'
    , 'Empathy'
    , 'Etiquette'
    , 'Intimidate'
    , 'Perform'
    , 'Crafts'
    , 'Lore'
    , 'Medicine'
    , 'Science'
];

export const PokemonSkills = ['Brawl'
    , 'Channel'
    , 'Clash'
    , 'Evasion'
    , 'Alert'
    , 'Athletic'
    , 'Nature'
    , 'Stealth'
    , 'Allure'
    , 'Etiquette'
    , 'Intimidate'
    , 'Perform'] as const;

export type PokemonSkill = typeof PokemonSkills[number];
export type TrainerSkill = typeof TrainerSkills[number];
