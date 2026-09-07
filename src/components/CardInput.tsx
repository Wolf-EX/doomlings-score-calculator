import React, { useEffect, useState } from "react";
import AutoCompleteItem from "./AutoCompleteItem";
import traits from '../data/traits.json' with {type: 'json'};
import type { Catastrophe, Color, Player, Trait } from "../data/types";
import { mod } from "../util/util";
import { checkScore } from "../util/score";
import ColorPicker from "./ColorPicker";

type Props = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    selectedPlayer: number;
    setDiscardPile: React.Dispatch<React.SetStateAction<string[]>>;
    selectedCatastrophe: Catastrophe;
};

export default function CardInput({players, setPlayers, selectedPlayer, setDiscardPile, selectedCatastrophe}: Props) {
    const [cardName, setCardName] = useState<string>('');
    const [currentTrait, setCurrentTrait] = useState<Trait>();
    const [autoCompleteList, setAutoCompleteList] = useState<string[]>([]);
    const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
    const [highlightedAutoComplete, setHighlightedAutoComplete] = useState<number>(0);
    const [showHighlighted, setShowHighlighted] = useState<boolean>(false);
    const [inputIsFocused, setInputIsFocused] = useState<boolean>(false);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [showDoubleColorPicker, setShowDoubleColorPicker] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<number[]>([0, 0]);
    
    useEffect(() => {
        if(!inputIsFocused) {
            setShowAutoComplete(false);
        }
    });

    function inputOnChange(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void {
        const name = e.target.value;
        if(name.length > 0) {
            const list: string[] = traits.filter(e => e.name.toLowerCase().startsWith(name.toLowerCase()))
                .slice(0, 6).map(trait => trait.name);
            setAutoCompleteList(list);
            setShowAutoComplete(true);
            setHighlightedAutoComplete(0);
            setShowHighlighted(false);
        } else {
            setAutoCompleteList([]);
        }
        setCardName(name);
    }

    function onColorSelectButtonClick(index: number, colorCode: number): void {
        selectedColor[index] = colorCode;
        setSelectedColor([...selectedColor]);
    }

    function onColorSelectAdd() {
        if(currentTrait?.effect?.type) { // this isn't needed
            const color: Color[] = [];
            color[0] = ['r', 'b', 'g', 'p'][selectedColor[0]] as Color;
            players[selectedPlayer].traitPile.push(currentTrait.code+color.slice(0, 1));
            setPlayers([...players]);
            checkScore(players, selectedCatastrophe);
        }
        setShowColorPicker(false);
    }

    function onDoubleColorSelectAdd(): void {
        const color: Color[] = [];
        color[0] = ['r', 'b', 'g', 'p'][selectedColor[0]] as Color;
        color[1] = ['r', 'b', 'g', 'p'][selectedColor[1]] as Color;
        if(currentTrait?.effect){ // this isn't needed
            if(currentTrait.effect.type === 'colorChange'){
                players[selectedPlayer].modifier.push({"type": "color", "from": color[0], "to": color[1]});
            }
            players[selectedPlayer].traitPile.push(currentTrait.code+color[0].slice(0, 1)+color[1].slice(0, 1));
            setPlayers([...players]);
            checkScore(players, selectedCatastrophe);
        }
        setShowDoubleColorPicker(false);
    }

    function addTrait(location: number): void {
        const trait: Trait | undefined = traits.find(e => e.name === cardName.toUpperCase()) as Trait;
        if(players[selectedPlayer] && trait) {
            if(location === 0) {
                if(trait.effect?.popup === "single") {
                    setCurrentTrait(trait);
                    setShowColorPicker(true);
                } else if(trait.effect?.popup === "double"){
                    setCurrentTrait(trait);
                    setShowDoubleColorPicker(true);
                } else {
                    players[selectedPlayer].traitPile.push(trait.code);
                    checkScore(players, selectedCatastrophe);
                    setPlayers([...players]);
                }
            } else if(location === 1) {
                players[selectedPlayer].hand.push(trait.code);
                checkScore(players, selectedCatastrophe);
                setPlayers([...players]);
            } else if(location === 2) {
                setDiscardPile(prev => [...prev, trait.code]);
            }
        }
        setCardName("");
        setShowAutoComplete(false);
    }

    function autoCompleteItemOnClick(name: string): void {
        setCardName(name);
        setShowAutoComplete(false);
    }

    function onKeyEvent(e: React.KeyboardEvent): void {
        let highlightedIndex: number = highlightedAutoComplete;

        if (e.key === 'ArrowDown') {
            if(showHighlighted) {
                highlightedIndex++;
            } else if(inputIsFocused) {
                setShowHighlighted(true);
            }
        } else if(e.key === 'ArrowUp') {
            if(showHighlighted) {
                highlightedIndex--;
            } else if(inputIsFocused)  {
                setShowHighlighted(true);
            }
        } else if(e.key === 'Enter') {
            if(showHighlighted) {
                setCardName(autoCompleteList[highlightedAutoComplete]);
                setHighlightedAutoComplete(0);
                setShowHighlighted(false);
                setAutoCompleteList([]);
            }
        } else if(e.key === 'ArrowRight') {
            if(showHighlighted) {
                setCardName(autoCompleteList[highlightedAutoComplete]);
            }
        }
        highlightedIndex = mod(highlightedIndex, autoCompleteList.length)
        setHighlightedAutoComplete(highlightedIndex);
    }

    return (
        <div>
            {
                // combine these into one
                showColorPicker && <ColorPicker 
                    title="Pick a color"
                    show={showColorPicker}
                    double={false}
                    selectedColor={selectedColor}
                    onSelect={onColorSelectButtonClick}
                    onAdd={onColorSelectAdd}
                    onCancel={() => setShowColorPicker(false)}
                />
            }
            {
                showDoubleColorPicker && <ColorPicker
                    title="Change traits of color"
                    show={showDoubleColorPicker}
                    double={true}
                    doubleTitle="To color of"
                    selectedColor={selectedColor}
                    onSelect={onColorSelectButtonClick}
                    onAdd={onDoubleColorSelectAdd}
                    onCancel={() => setShowDoubleColorPicker(false)}
                />
            }
            <div className="addtrait-container">
                <h2>Add Traits</h2>
                <div className="addtrait-container-group">
                    <button onClick={() => addTrait(0)}>Add to traits</button>
                    <button onClick={() => addTrait(1)}>Add to hand</button>
                    <button onClick={() => addTrait(2)}>Add to discard</button>
                </div>
            </div>
            <div className="cardinput-container">
                <input
                    placeholder="Enter card name."
                    value={cardName}
                    onChange={e => inputOnChange(e)}
                    onKeyDown={onKeyEvent}
                    onFocus={() => setInputIsFocused(true)}
                    onBlur={() => setInputIsFocused(false)}
                />
            </div>
            <div className="autocomplete-container">
                {
                    showAutoComplete && autoCompleteList.map((e, index) => (
                        <AutoCompleteItem
                            key={index}
                            cardName={e}
                            onClick={() => autoCompleteItemOnClick(e)}
                            isHighlighted={showHighlighted && index === highlightedAutoComplete}
                        />
                    ))
                }
            </div>
        </div>
    );
}