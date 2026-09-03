import type { Player, Trait, Bonus, Color, Catastrophe, ModifierType, TypeValue } from "../data/types";
import { findAttachment, getLocationSize, getTraitsWithAttachments, getTraitData, getAttachment, findTrait, isString } from "./util";

export function checkScore(players: Player[], catastrophe: Catastrophe): number[] {
  const playerScoreModifier: number[] = Array(players.length).fill(0);
  players.forEach((player: Player, index: number) => {
    player.score = getTraitsWithAttachments(player.traitPile).reduce((acc: number, cur: string) => 
      acc + getTraitTotalValue(players, index, cur, catastrophe, playerScoreModifier), 0);

    player.score += getCatastropheValue(players, index, catastrophe) + playerScoreModifier[index];
  });
  return players.map(player => player.score);
}

// fix these types - return unknown type and put getFaceValue function in here? 
type bonusTypes = "name" | "color" | "type";
function getTraitModifier(player: Player, trait: Trait, type: bonusTypes, attachment: Trait | undefined): string | string[] {
  const traitCopy: Trait = structuredClone(trait);

  if(attachment && attachment.effect) {
    // color
    if(attachment.effect.type === "colorChange" && type === "color" && attachment.effect.value) {
      // check if type === "color" && traitCopy[type] === attachment.effect.value
      traitCopy[type] = [attachment.effect.value];
    }
  }
  
  if(player.modifier.length > 0) {
    const mod: ModifierType[] = player.modifier.filter((obj: ModifierType) => obj.type === type);
    if(mod.length > 0) {
      return mod.reduce((acc: string | string[] , cur: ModifierType) => {
        if(Array.isArray(acc) && acc.includes(cur.from)) {
          const index: number = acc.findIndex((e: string) => e === cur.from);
          acc[index] = cur.to;
          return acc;
        }
        return acc === cur.from ? cur.to : acc;
      }, traitCopy[type]);
    }
  }
  return traitCopy[type];
}

function getFaceValue(trait: Trait, attachment: Trait | undefined): number {
  if(attachment && attachment.effect && attachment.effect.type === "faceValueChange" && typeof attachment.effect.value === "number") {
    return attachment.effect.value;
  }
  return trait.faceValue;
}

export function getCatastropheValue(players: Player[], index: number, catastrophe: Catastrophe): number {
  const player: Player = players[index];
  if(catastrophe.bonus){
    switch(catastrophe.bonus.type) {
      case "missingColor":
        const colors = getAllColorCount(player, getTraitsWithAttachments(player.traitPile));
        return colors.reduce((acc: number, cur: number) => acc += cur === 0 ? -2 : 0, 0);
      case "color":
        const location = catastrophe.bonus.location || "traitPile";
        if(location !== "discardPile" && location !== "genePool") {
          const colorCount: number = getAllColorCount(player,
              getTraitsWithAttachments(player[location]))[["r", "b", "g", "p"].indexOf(catastrophe.bonus.typeValue as Color)];
              return colorCount * catastrophe.bonus.value;
        }
      break;
      case "bonusValue":
        return player.catastropheBonus * catastrophe.bonus.value;
      case "fewest": case "most":
        if(catastrophe.bonus.location === "traitPile") {
          const location = catastrophe.bonus.location;
          const playerPileCount: number[] = players.map(player => {
            return player[location].length; // use getLocationSize() here?
          }) || [];
          return catastrophe.bonus.type === "most" ? 
            player.traitPile.length === Math.max(...playerPileCount) ? catastrophe.bonus.value : 0 :
            player.traitPile.length === Math.min(...playerPileCount) ? catastrophe.bonus.value : 0;
        }
      break;
      case "colorsCount":
        if(catastrophe.bonus.location === "traitPile") {
          const colorCount: number[] = getAllColorCount(player, getTraitsWithAttachments(player[catastrophe.bonus.location]));
          if(Math.max(...colorCount) >= catastrophe.bonus.amount) {
            return catastrophe.bonus.value;
          }
        }
      break;
      default: return 0;
    }
  }
  return 0;
}

// clean this up, do if trait !== undefined instead and return 0 at bottom
export function getTraitTotalValue(players: Player[], index: number, id: string, catastrophe: Catastrophe, modifier: number[]): number {
  const trait: Trait | undefined = getTraitData(id);
  const attachment = getAttachment(id);
  if(trait === undefined) {
    return 0;
  }

  if(catastrophe?.bonus?.type === "colorBlock" || (catastrophe?.bonus?.type === "colorBlock2" && !trait.type.includes("dominant"))) {
    if(getTraitModifier(players[index], trait, "color", attachment).includes(catastrophe?.bonus?.typeValue as Color)) {
      return catastrophe?.bonus?.value;
    }
  }

  let total: number = getFaceValue(trait, attachment);

  if(trait?.effect?.type === "modify" && trait?.bonus){
    applyScoreModifier(trait.bonus, players, index, id, modifier);
  } else if(typeof trait?.bonus?.amount === 'number') {
    total += countBonusType(players, index, id, trait.bonus);
  }

  return total;
}

function applyScoreModifier(bonus: Bonus, players: Player[], index: number, id: string, modifier: number[]): void {
  if(bonus.type === "colorAttack") {
    let value: Color = bonus.typeValue as Color;
    if(bonus.typeValue === "choice"){
      // value = getColor(id.slice(2)) || value;
      value = id.slice(2) as Color || value;
    }

    if(['r', 'b', 'g', 'p'].includes(value)) {
      players.forEach((player, i) => {
        if(i !== index) {
          if(bonus.location && bonus.location !== "discardPile" && bonus.location !== "genePool"){
            const pile = getTraitsWithAttachments(player[bonus.location]);
            modifier[i] += getAllColorCount(player, pile)[['r', 'b', 'g', 'p'].indexOf(value)] * bonus.value;
          }
        }
      });
    }
  }
}

function countBonusType(players: Player[], index: number, id: string, bonus: Bonus): number {
  let count = 0;
  let target: Player = players[index]; // Current player, change to player?
  let location: number | string[] | undefined; // undefined is temp until I implement discard and hand

  /* if(bonus.target === 'self') {
    // why is this here if it initializes as player already?
    target = player;
  }  */
  if(bonus.target === 'opponent') {
    // make target a new Player object and add all opponent piles to it
    target = {
      id: index,
      name: "opponents",
      score: 0,
      genePool: 0,
      traitPile: [],
      hand: [],
      modifier: [],
      catastropheBonus: 0
    };

    players.forEach((e, i) => {
      if(i !== index) {
        target.traitPile.push(...e.traitPile); // do i need to set the target.traitPile to check location?
      }
    });
  } else if(bonus.target === 'all') {
    target = {
      id: index,
      name: "opponents",
      genePool: 0,
      score: 0,
      traitPile: [],
      hand: [],
      modifier: [],
      catastropheBonus: 0
    };

    players.forEach(e => {
      target.traitPile.push(...e.traitPile); // do i need to set the target.traitPile to check location?
    });
  }

  if(bonus.location && bonus.location !== 'discardPile') {
    location = target?.[bonus.location];
  }

  // temp, there will always be a location once I implement discard and hand
  if(location) {
    // find out where location is set to number to update with attachments
    if(typeof location === 'number') {
      if(bonus.type === 'size') {
        // need function to getLocationSize so attachments get counted
        count = location / bonus.amount;
      }
    } else {
     switch(bonus.type) {
      case "diffColors":
        count = getAllColorCount(target, getTraitsWithAttachments(location)).reduce((acc, cur) => {
          return acc += cur > 0 ? 1 : 0;
        }, 0);
      break;
      case "colorPair":
        const reducedcolorCount: number[] = getAllColorCount(target, getTraitsWithAttachments(location));
        count = reducedcolorCount.reduce((acc, cur) => {
          return acc += Math.floor(cur / bonus.amount);
        }, 0);
      break;
      case "lowestColor":
        const filteredColorCount: number[] = getAllColorCount(target, getTraitsWithAttachments(location)).filter(e => e !== 0);
        if(filteredColorCount.length > 1) {
          count = Math.min(...filteredColorCount);
        }
      break;
      case "mostColor":
        // try highestIndex = colorCount.indexOf(Math.max(...colorCount));
        let highestValue = 0;
        let highestIndex = -1;
        getAllColorCount(target, getTraitsWithAttachments(location)).forEach((count, index) => {
          if(count > highestValue) {
            highestValue = count;
            highestIndex = index;
          } else if(count === highestValue) {
            highestIndex = -1;
          }
        });
        if(["r", "b", "g", "p"][highestIndex] === bonus.typeValue) {
          return 2
        }
        return 0;
      case "most":
        let hasMost: boolean = false;
        if(bonus.location === "traitPile") {
          const location = bonus.location; // why is this here instead of moving bonus.location in the player return
          const playerPileCount: number[] = players.map(player => {
            return getLocationSize(player[location]);
          }) || [];
          hasMost = playerPileCount.every((pileCount, pileIndex) => {
            if(pileIndex === index) {
              return true;
            }
            return playerPileCount[index] > pileCount;
          });
        }
        return hasMost ? bonus.value : 0;
      case "faceValue":
        // update this to just take id
        const value = getBonusTypeValue(id);
        if(typeof value === "number") {
          return value;
        }
        return 0;
      default:
        const typeValue = getBonusTypeValue(id);
        if(typeValue) {
          count = getTraitsWithAttachments(location).reduce((acc, cur) => {
            const trait: Trait | undefined = getTraitData(cur);
            if(trait) {
              return acc += checkBonusMatch(target, id, cur, bonus.type, typeValue, trait);
            }
            return 0;
          }, 0);
       }
      }
    }
  }
  return count * bonus.value;
}

function getAllColorCount(player: Player, location: string[]): number[] {
  const colors: Color[] = ['r', 'b', 'g', 'p'];
  
  return colors.map(color =>
    location.reduce((acc, cur) => {
      const trait: Trait | undefined = getTraitData(cur);
      const attachment = getAttachment(cur);

      if(trait) {
        return acc + (getTraitModifier(player, trait, 'color', attachment).includes(color) ? 1 : 0);
      }
      return acc;
    }, 0)
  );
}

function checkBonusMatch(player: Player, pid: string, traitId: string, bonusType: string, typeValue: TypeValue, trait: Trait): 1 | 0 {
  if(bonusType === 'all') {
      return 1;
  }

  if(bonusType === 'face') {
    if(typeof typeValue === 'number') {
      return getFaceValue(trait, getAttachment(traitId)) === typeValue ? 1 : 0;
    } else if(typeValue === 'negative') {
      return getFaceValue(trait, getAttachment(traitId)) < 0 ? 1 : 0;
    }
    console.error(`bonus typevalue ${typeValue} isn't a valid value.`);
    return 0;
  }

  if(bonusType && typeValue) {
    if(bonusType=== 'name' || bonusType === 'color' || bonusType === 'type') {
      if(isString(typeValue)) {
        const attachment = findAttachment(pid); 
        // typeValue[0] is temp till I implement multicolor
        return getTraitModifier(player, trait, bonusType, attachment).includes(typeValue[0]) ? 1 : 0;
      }
    }
    if(bonusType === 'typeMissing' && typeof typeValue === 'string') {
      const attachment = findAttachment(pid);
      return getTraitModifier(player, trait, "type", attachment).includes(typeValue) ? 0 : 1;
    }
  }
  return 0;
}

function getBonusTypeValue(id: string) {
  const trait = getTraitData(id);
  const host = findTrait(id);
  if(host) {
    if(trait && trait.bonus && trait.bonus.typeValue === "host") {
      if(trait.bonus.type === "color") {
        return host["color"];
      }
      if(trait.bonus.type === "faceValue") {
        return host["faceValue"];
      }
    }
    return host.bonus?.typeValue;
  }
}