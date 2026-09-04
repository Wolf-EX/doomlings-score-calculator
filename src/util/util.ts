import type { Trait, Catastrophe } from "../data/types";
import traits from '../data/traits.json' with {type: 'json'};
import catastrophe from '../data/catastrophe.json' with {type: 'json'};
import attachments from '../data/attachment.json' with {type: 'json'};

export function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

export function findTrait(code: string): Trait | undefined {
  return traits.find(trait => trait.code === code.slice(0, 2)) as Trait;
}

export function findCatastrophe(id: string): Catastrophe {
  return catastrophe.find(catastraphy => catastraphy.id === id) as Catastrophe || catastrophe[0];
}

export function findAttachment(id: string): Trait | undefined {
  return id.length > 4 ? attachments.find(trait => trait.code === id[4]) as Trait : undefined;
}

export function getTraitData(id: string): Trait | undefined {
  return id[5] === "1" ? findAttachment(id) : findTrait(id);
}

export function getAttachment(id: string): Trait | undefined {
  if(id[5] !== "1") {
    return findAttachment(id);
  }
  return undefined;
}

export function getTraitsWithAttachments(location: unknown): string[] {
  if(Array.isArray(location) && location.every(e => typeof e === "string")) {
    const attachments = location.filter(traitId => traitId.length > 4);
    return [...location, ...attachments.map(id => id + "1")];
  }
  return [];
}

export function getLocationSize(location: string[]): number {
  return getTraitsWithAttachments(location).length;
}

// typeGaurd
export function isString(item: unknown) {
  return typeof item === "string" || item instanceof String || Array.isArray(item) && item.every(e => typeof e === "string");
}