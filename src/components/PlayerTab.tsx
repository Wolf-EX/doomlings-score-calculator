import React, { useState } from "react";
import type { Player, Sign } from "../data/types";
import AddPlayerWindow from "./AddPlayerWindow";

type Props = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    selectedPlayer: number;
    setSelectedPlayer: React.Dispatch<React.SetStateAction<number>>;
    selectedPlayerName: string;
    setSelectedPlayerName: React.Dispatch<React.SetStateAction<string>>;
    discardPile: string[];
    uId: {current: number};
    sign: Sign;
    setSign: React.Dispatch<React.SetStateAction<Sign>>;
    setShowSignList: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PlayerTab({
    players,
    setPlayers,
    selectedPlayer,
    setSelectedPlayer,
    selectedPlayerName,
    setSelectedPlayerName,
    discardPile,
    uId,
    sign,
    setSign,
    setShowSignList
}: Props) {
    const [showAddPlayer, setShowAddPlayer] = useState<boolean>(false);

    function onSelectPlayer(index: number) {
        setSelectedPlayer(index);
    }

    return (
        <div className="player-tab-container">
            {
                showAddPlayer && <AddPlayerWindow
                    players={players}
                    setPlayers={setPlayers}
                    selectedPlayerName={selectedPlayerName}
                    setSelectedPlayerName={setSelectedPlayerName}
                    discardPile={discardPile}
                    showAddPlayer={showAddPlayer}
                    setShowAddPlayer={setShowAddPlayer}
                    edit={false}
                    uId={uId}
                    sign={sign}
                    setSign={setSign}
                    setShowSignList={setShowSignList}
                />
            }
            <h2>Players</h2>
            <div className="player-item-container">
            {
                players.map((player, index) => (
                    <div 
                        className={selectedPlayer === index ? 'player-highlighted' : 'player-button'}
                        key={player.id}
                        onClick={() => onSelectPlayer(index)}
                    >
                        <div className="player-item">
                            <div>{player.name} </div>
                            ({player.score + player.signBonus})
                        </div>
                    </div>
                ))
            }
            {
                players.length < 6 && <div className="add-player-button" onClick={() => setShowAddPlayer(true)}>Add Player</div>
            }
            </div>
        </div>
    );
}