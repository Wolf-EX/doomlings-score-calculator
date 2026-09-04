export type Trait = {
  name: string;
  color: string[];
  type: string[];
  faceValue: number;
  bonus: Bonus | null;
  effect: {
    popup?: "none" | "single" | "double";
    type: string;
    value?: Color;
  } | null; // string is temp till I implement bonus effects (like color change)
  code: string; // change to id
}

export type Catastrophe = {
  name: string;
  bonus: Bonus | null;
  id: string;
}

export type Bonus = {
  type: string;
  typeValue?: TypeValue;
  location: Location;
  target?: 'all' | 'self' | 'opponent' | 'player' | 'host';
  amount: number;
  value: number;
}

export type Location = 'traitPile' | 'hand' | 'discardPile' | 'genePool';

export type TypeValue = number | Color[] | Color | 'c' | 'positive' | 'negative' | 'choice' | 'host' | undefined; // string is temp

export type Player = {
  id: number;
  name: string;
  score: number;
  genePool: number | number[];
  traitPile: string[];
  hand: string[];
  modifier: ModifierType[];
  catastropheBonus: number;
}

//add Color type 'change'? for "Free WILL" and "RAINBOW HORN". If has that type, check the characters after first 2 of code
export type Color = 'r' | 'b' | 'g' | 'p';

// update this, object should be specific
export type ModifierType = ColorChangeMod;

export type ColorChangeMod = {
  type: "color";
  from: Color;
  to: Color;
}