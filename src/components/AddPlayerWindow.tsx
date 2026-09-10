import React, { useEffect, useState } from "react";
import qrlogo from "../assets/qr-icon.png";
import type { Player } from "../data/types";
import Popup from "./Popup";
import QRScanner from "./QRScanner";
import { checkScore } from "../util/score";

type Props = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    selectedPlayer?: number;
    selectedPlayerName: string;
    setSelectedPlayerName: React.Dispatch<React.SetStateAction<string>>;
    discardPile: string[];
    showAddPlayer: Boolean;
    setShowAddPlayer: React.Dispatch<React.SetStateAction<Boolean>>;
    edit: Boolean;
    uId: {current: number}
}

export default function AddPlayerWindow({
    players,
    setPlayers,
    selectedPlayer,
    selectedPlayerName,
    setSelectedPlayerName,
    discardPile,
    showAddPlayer,
    setShowAddPlayer,
    edit,
    uId
}: Props) {
    const [genePool, setGenePool] = useState<number | number[]>(5);
    const [catastropheBonus, setCatastropheBonus] = useState<number>(0);
    const [useQr, setUseQr] = useState<Boolean>(false);

    useEffect(() => {
        const player: Player | null = selectedPlayer !== undefined ? players[selectedPlayer] : null;
        if(edit && player) {
            setSelectedPlayerName(player.name);
            setGenePool(player.genePool);
            setCatastropheBonus(player.catastropheBonus);
        } else {
            setSelectedPlayerName("");
            setGenePool(5);
            setCatastropheBonus(0);
        }
    }, [showAddPlayer])

    function hidePlayerPopup() {
        setSelectedPlayerName("");
        setGenePool(5);
        setCatastropheBonus(0);
        setShowAddPlayer(false);
    }

    function addPlayer(playerData?: Player) {
        if(playerData || selectedPlayerName.trim().length > 0) {
            const _playerData: Player = playerData || {
                "id": 0,
                "name": selectedPlayerName,
                "score": 0,
                "genePool": genePool,
                "traitPile": [],
                "hand": [],
                "modifier": [],
                "catastropheBonus": catastropheBonus
            }

            // Checks if duplicate playername and adds unique number to end of it
            const playerNames: string[] = players.map(p => p.name);
            let index: number = 0;
            let name: string = _playerData.name;

            while(playerNames.includes(name)) {
                name = `${_playerData.name}_${index.toString()}`;
                index++;
            }

            _playerData.name = name;
            _playerData.id = uId.current++;
            const newPlayers = [...players, _playerData];

            checkScore(newPlayers, discardPile);
            setPlayers(newPlayers);
            setGenePool(5);
            setCatastropheBonus(0);
            hidePlayerPopup();
        }
    }

    function editPlayer() {
        if(selectedPlayerName.trim().length > 0) {
            const _playerData: Player = {
                "id": 0,
                "name": selectedPlayerName,
                "score": 0,
                "genePool": genePool,
                "traitPile": [],
                "hand": [],
                "modifier": [],
                "catastropheBonus": catastropheBonus
            }

            if(selectedPlayer !== undefined) {
                _playerData.id = players[selectedPlayer].id;
                _playerData.traitPile = players[selectedPlayer].traitPile;
                _playerData.hand = players[selectedPlayer].hand;
                _playerData.modifier = players[selectedPlayer].modifier;
            }

            // Checks if duplicate playername and adds unique number to end of it
            const playerNames: string[] = players.map(p => p.name).filter(n => n !== selectedPlayerName);

            let index: number = 0;
            let name: string = _playerData.name;

            while(playerNames.includes(name)) {
                name = `${_playerData.name}_${index.toString()}`;
                index++;
            }

            _playerData.name = name;
            players[selectedPlayer || 0] = _playerData;
            checkScore(players, discardPile);
            setPlayers(players);
            setGenePool(5);
            setCatastropheBonus(0);
            hidePlayerPopup();
        }
    }

    const onNewScanResult = (decodedText: string) => {
        const newPlayer: Player = JSON.parse(decodedText);
        if(newPlayer) {
            addPlayer(newPlayer);
            setUseQr(false);
            setShowAddPlayer(false);
        }
    };

    function onInputKeyDown(e: React.KeyboardEvent): void {
        if(showAddPlayer && e.key === 'Enter') {
            edit ? editPlayer() : addPlayer();
        }
    }

    function onInputChange(e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void {
        setSelectedPlayerName(e.target.value);
    }

    return (
        <Popup className="add-player-popup-container">
            <h2>{edit ? "Edit " : "Add "}Player</h2>
            {
                useQr ?
                (
                    <div>
                        <QRScanner
                            fps={10}
                            qrbox={250}
                            disableFlip={false}
                            qrCodeSuccessCallback={onNewScanResult}
                        />
                        <button className="qr-scanner-button" onClick={() => setUseQr(false)}>Back</button>
                    </div>
                    
                )
                :
                (
                    <div>
                        <input
                            className="add-player-popup-input"
                            placeholder="Enter name"
                            value={selectedPlayerName}
                            onChange={e => onInputChange(e)}
                            onKeyDown={onInputKeyDown}
                            autoFocus
                        />
                        <div className="add-player-popup-gene-container">
                            <p>Gene Pool:</p>
                            <button onClick={() => setGenePool(Math.max(genePool as number - 1, 0))}>-</button>
                            {genePool}
                            <button onClick={() => setGenePool(Math.min(genePool as number + 1, 8))}>+</button>
                        </div>
                        <div className="add-player-popup-gene-container">
                            <p>Catastrophy Bonus:</p>
                            <button onClick={() => setCatastropheBonus(Math.max(catastropheBonus - 1, -10))}>-</button>
                            {catastropheBonus}
                            <button onClick={() => setCatastropheBonus(Math.min(catastropheBonus + 1, 10))}>+</button>
                        </div>
                        {/* <div className="add-player-popup-gene-container">
                            Sign Button Here
                        </div> */}
                        {
                            !edit && <div className="qr-scanner-container">
                                <div className="qr-scanner-img-container" onClick={() => setUseQr(true)}>
                                    <img src={qrlogo} />
                                </div>
                            </div>
                        }
                        <div className="add-player-popup-button-container">
                            {
                                edit ? <button onClick={() => editPlayer()}>Confirm</button> : <button onClick={() => addPlayer()}>Add</button>
                            }
                            <button onClick={hidePlayerPopup}>Cancel</button>
                        </div>
                    </div>
                )
            }
        </Popup>
    );
}