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

// update this
export type Sign = {
  name: string;
  bonusType?: string;
  target?: string;
  targetMod?: string;
  typeValue?: TypeValue;
  bonus?: any;
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

export type Player = {
  id: number;
  name: string;
  score: number;
  signBonus: number;
  genePool: number | number[];
  traitPile: string[];
  hand: string[];
  modifier: ModifierType[];
  catastropheBonus: number;
  sign: any;
}

export type Location = 'traitPile' | 'hand' | 'discardPile' | 'genePool';

export type TypeValue = number | string | Color[] | Color | 'c' | 'positive' | 'negative' | 'choice' | 'host' | undefined; // string is temp

export type Color = 'r' | 'b' | 'g' | 'p';

// update this, object should be specific
export type ModifierType = ColorChangeMod;

export type ColorChangeMod = {
  type: "color";
  from: Color;
  to: Color;
}