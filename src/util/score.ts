import type { Player, Trait, Bonus, Color, Catastrophe, ModifierType, TypeValue } from "../data/types";
import { findAttachment, getLocationSize, getTraitsWithAttachments, getTraitData, getAttachment, findTrait, isString } from "./util";

let _discardPile: string[] = [];
let _catastrophe: Catastrophe = {name: 'None', bonus: null, id: '00'};

export function setCatastrophe(catastraphe: Catastrophe) {
  _catastrophe = catastraphe;
}

export function checkScore(players: Player[], discardPile: string[]): number[] {
  _discardPile = discardPile;
  const playerScoreModifier: number[] = Array(players.length).fill(0);
  players.forEach((player: Player, index: number) => {
    player.score = getTraitsWithAttachments(player.traitPile).reduce((acc: number, cur: string) => 
      acc + getTraitTotalValue(players, index, cur, playerScoreModifier), 0);

    player.score += getCatastropheValue(players, index) + playerScoreModifier[index];
  });
  players.forEach((player: Player) => {
    if(player.sign.bonus) {
      player.score += getSignBonus(player);
    }
  });
  return players.map(player => player.score);
}

function getSignBonus(player: Player) {
  const type: String = player.sign.bonusType;
  
  switch(type) {
    case "count":
      const count = getTraitsWithAttachments(player.traitPile).reduce((acc, cur) => {
          const trait: Trait | undefined = getTraitData(cur);
          if(trait) {
            return acc += checkBonusMatch(player, cur, cur, player.sign.target, player.sign.typeValue, trait);
          }
          return 0;
        }, 0);
      return player.sign.bonus.reduce((acc: any, cur: any) => {
        if(cur.typeCount.includes(count)) {
          return acc + cur.points;
        }
        return acc;
      }, 0);
    default: return 0;
  }
}

type bonusTypes = "name" | "color" | "type";
function getTraitModifier<T>(player: Player, trait: Trait, id: string, type: bonusTypes, attachment: Trait | undefined): T {
  let traitType = structuredClone(trait[type]);

  if(trait.effect?.type === "colorChange" && id) {
    traitType = id[2];
  } else if(trait.effect?.type === "rainbow") {
    const highestColor = getAllColorCount(player, getTraitsWithAttachments(player.traitPile));
    const maxColor = Math.max(...highestColor);
    const maxColorIndex = highestColor.indexOf(maxColor) === highestColor.lastIndexOf(maxColor) ? highestColor.indexOf(maxColor) : -1;
    traitType = maxColorIndex !== -1 ? ['r', 'b', 'g', 'p'][maxColorIndex] : 'c';
  }

  if(attachment && attachment.effect) {
    // color
    if(attachment.effect.type === "colorChange" && type === "color" && attachment.effect.value) {
      traitType = attachment.effect.value;
    }
  }
  
  if(player.modifier.length > 0) {
    const mod: ModifierType[] = player.modifier.filter((obj: ModifierType) => obj.type === type);
    if(mod.length > 0) {
      return  mod.reduce((acc: string | string[] , cur: ModifierType) => {
        if(Array.isArray(acc) && acc.includes(cur.from)) {
          const index: number = acc.findIndex((e: string) => e === cur.from);
          acc[index] = cur.to;
          return acc;
        }
        return acc === cur.from ? cur.to : acc;
      }, traitType) as T;
    }
  }
  return traitType as T;
}

function getFaceValue(trait: Trait, attachment: Trait | undefined): number {
  if(attachment?.effect?.type === "faceValueChange" && typeof attachment.effect.value === "number") {
    return attachment.effect.value;
  }
  return trait.faceValue;
}

export function getCatastropheValue(players: Player[], index: number): number {
  const player: Player = players[index];
  const location = _catastrophe.bonus?.location || "traitPile";

  if(_catastrophe.bonus){
    switch(_catastrophe.bonus.type) {
      case "missingColor":
        const colors = getAllColorCount(player, getTraitsWithAttachments(player.traitPile));
        return colors.reduce((acc: number, cur: number) => acc += cur === 0 ? -2 : 0, 0);
      case "color":
        if(location !== "discardPile" && location !== "genePool") {
          const colorCount: number = getAllColorCount(player,
              getTraitsWithAttachments(player[location]))[["r", "b", "g", "p"].indexOf(_catastrophe.bonus.typeValue as Color)];
              return colorCount * _catastrophe.bonus.value;
        }
        break;
      case "bonusValue":
        return player.catastropheBonus * _catastrophe.bonus.value;
      case "fewest": case "most":
        if(_catastrophe.bonus.location === "traitPile") {
          const playerPileCount: number[] = players.map(player => {
            return getLocationSize(player["traitPile"]);
          }) || [];
          return _catastrophe.bonus.type === "most" ?
            getLocationSize(player["traitPile"]) === Math.max(...playerPileCount) ? _catastrophe.bonus.value : 0 :
            getLocationSize(player["traitPile"]) === Math.min(...playerPileCount) ? _catastrophe.bonus.value : 0;
        }
        break;
      case "colorsCount":
        if(_catastrophe.bonus.location === "traitPile") {
          const colorCount: number[] = getAllColorCount(player, getTraitsWithAttachments(player[_catastrophe.bonus.location]));
          if(Math.max(...colorCount) >= _catastrophe.bonus.amount) {
            return _catastrophe.bonus.value;
          }
        }
        break;
      case "faceHigh":
        return countBonusType(players, index, "-1", _catastrophe.bonus);
      default: return 0;
    }
  }
  return 0;
}

export function getTraitTotalValue(players: Player[], index: number, id: string, modifier: number[]): number {
  const trait: Trait | undefined = getTraitData(id);
  const attachment = getAttachment(id);
  if(trait === undefined) {
    return 0;
  }

  // AI TAKEOVER
  if(_catastrophe?.bonus?.type === "colorBlock" || (_catastrophe?.bonus?.type === "colorBlock2" && !trait.type.includes("dominant"))) {
    if(getTraitModifier<"color">(players[index], trait, id, "color", attachment).includes(_catastrophe?.bonus?.typeValue as Color)) {
      return _catastrophe?.bonus?.value;
    }
  }
  
  // LYONIZATION
  if(attachment && attachment.bonus?.type === "block") {
    return trait.faceValue;
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
  let bonusValue = bonus.value;
  let bonusType = bonus.type;
  let targetPlayer: Player = players[index]; // Current player, change to player?
  let location: string[] | number[] | number | undefined; // undefined is temp until I implement discard and hand
  
  if(bonus.target === 'opponent') {
    targetPlayer = {
      id: index,
      name: "opponents",
      score: 0,
      genePool: 0,
      traitPile: [],
      hand: [],
      modifier: [],
      catastropheBonus: 0,
      sign: {
        "name": "none",
        "id": "00"
      }
    };

    players.forEach((e, i) => {
      if(i !== index) {
        targetPlayer.traitPile.push(...e.traitPile); // do i need to set the target.traitPile to check location?
      }
    });
  } else if(bonus.target === 'all') {
    targetPlayer = {
      id: index,
      name: "opponents",
      genePool: [],
      score: 0,
      traitPile: [],
      hand: [],
      modifier: [],
      catastropheBonus: 0,
      sign: {
        "name": "none",
        "id": "00"
      }
    };
    
    if(bonus.location && bonus.location !== 'discardPile') {
      location = targetPlayer?.[bonus.location];
    }
    if(bonus.location === 'genePool') {
      players.forEach(e => {
        if(Array.isArray(targetPlayer.genePool) && typeof e.genePool === 'number')
        targetPlayer.genePool.push(e.genePool);
      });
    } else {
      players.forEach(e => {
        targetPlayer.traitPile.push(...e.traitPile); // do i need to set the target.traitPile to check location?
      });
    }
  } else {
    if(bonus.location) {
      if(bonus.location !== "discardPile") {
        location = targetPlayer[bonus.location];
      } else {
        location = _discardPile;
      }
    }
  }

  if(location) {
    // find out where location is set to number to update with attachments
    if(typeof location === 'number') {
      if(bonusType === 'size') {
        // need function to getLocationSize so attachments get counted
        count = location / bonus.amount;
      }
    } else {
     switch(bonusType) {
      case "diffColors":
        count = getAllColorCount(targetPlayer, getTraitsWithAttachments(location)).reduce((acc, cur) => {
          return acc += cur > 0 ? 1 : 0;
        }, 0);
        break;
      case "colorPair":
        const reducedcolorCount: number[] = getAllColorCount(targetPlayer, getTraitsWithAttachments(location));
        count = reducedcolorCount.reduce((acc, cur) => {
          return acc += Math.floor(cur / bonus.amount);
        }, 0);
        break;
      case "lowestColor":
        const filteredColorCount: number[] = getAllColorCount(targetPlayer, getTraitsWithAttachments(location)).filter(e => e !== 0);
        if(filteredColorCount.length > 1) {
          count = Math.min(...filteredColorCount);
        }
        break;
      case "mostColor":
        let highestValue = 0;
        let highestIndex = -1;
        getAllColorCount(targetPlayer, getTraitsWithAttachments(location)).forEach((count, index) => {
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
          const playerPileCount: number[] = players.map(player => {
            return getLocationSize(player["traitPile"]);
          }) || [];
          hasMost = playerPileCount.every((pileCount, pileIndex) => {
            if(pileIndex === index) {
              return true;
            }
            return playerPileCount[index] > pileCount;
          });
        }
        return hasMost ? bonusValue : 0;
      case "faceValue":
        const value = getBonusTypeValue(id);
        if(typeof value === "number") {
          return value;
        }
        return 0;
      case "greatestValue":
        if(Array.isArray(location) && location.every(e => typeof e === "number")) {
          return Math.max(...location);
        }
        return 0;
      default:
        if(bonus.type === "bionic") {
          bonusType = "type";
          if(getAttachment(id)){
            bonusValue = 2;
          }
        }
        const typeValue = getBonusTypeValue(id) || bonus.typeValue;
        count = getTraitsWithAttachments(location).reduce((acc, cur) => {
          const trait: Trait | undefined = getTraitData(cur);
          if(trait) {
            return acc += checkBonusMatch(targetPlayer, id, cur, bonusType, typeValue, trait);
          }
          return 0;
        }, 0);
      }
    }
  }
  return Math.floor(count / bonus.amount) * bonusValue;
}

function getAllColorCount(player: Player, location: string[]): number[] {
  const colors: Color[] = ['r', 'b', 'g', 'p'];
  let rainbowTraitsCount: number = 0;

  const allColors = colors.map((color, index) =>
    location.reduce((acc, id) => {
      const trait: Trait | undefined = getTraitData(id);
      const attachment = getAttachment(id);

      if(trait) {
        if(trait.effect?.type === "rainbow") {
          if(index === 0) {
            rainbowTraitsCount++;
          }
          return acc;
        }
        return acc + (getTraitModifier<"color">(player, trait, id, 'color', attachment).includes(color) ? 1 : 0);
      }
      return acc;
    }, 0)
  );

  const maxColor = Math.max(...allColors);
  const maxColorIndex = allColors.indexOf(maxColor) === allColors.lastIndexOf(maxColor) ? allColors.indexOf(maxColor) : -1;
  if(maxColorIndex !== -1) {
    allColors[maxColorIndex] += rainbowTraitsCount;
  }

  return allColors;
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

  if(bonusType === 'faceHigh' && typeof typeValue === 'number') {
    return getFaceValue(trait, getAttachment(traitId)) >= typeValue ? 1 : 0;
  }

  if(bonusType && typeValue) {
    if(bonusType=== 'name' || bonusType === 'color' || bonusType === 'type') {
      if(isString(typeValue)) {
        const attachment = findAttachment(pid);
        const traitMod = getTraitModifier<typeof trait[typeof bonusType]>(player, trait, traitId, bonusType, attachment);
        if(!Array.isArray(typeValue)) {
          if(!Array.isArray(traitMod)) {
            return traitMod === typeValue ? 1 : 0;
          }
          return traitMod.includes(typeValue) ? 1 : 0;
        }
        return typeValue.some(e => traitMod.includes(e)) ? 1 : 0;
      }
    }
    if(bonusType === 'typeMissing' && typeof typeValue === 'string') {
      const attachment = findAttachment(pid);
      return getTraitModifier<"type">(player, trait, traitId, "type", attachment).includes(typeValue) ? 0 : 1;
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
        return host["color"] as Color[];
      }
      if(trait.bonus.type === "faceValue") {
        return host["faceValue"];
      }
    }
    return host.bonus?.typeValue;
  }
}