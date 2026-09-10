import React, { useState } from "react";
import type { Player } from "../data/types";
import AddPlayerWindow from "./AddPlayerWindow";

type Props = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    selectedPlayer: number;
    setSelectedPlayer: React.Dispatch<React.SetStateAction<number>>;
    selectedPlayerName: string;
    setSelectedPlayerName: React.Dispatch<React.SetStateAction<string>>;
    discardPile: string[];
    uId: {current: number}
};

export default function PlayerTab({
    players,
    setPlayers,
    selectedPlayer,
    setSelectedPlayer,
    selectedPlayerName,
    setSelectedPlayerName,
    discardPile,
    uId
}: Props) {
    const [showAddPlayer, setShowAddPlayer] = useState<Boolean>(false);

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
                            ({player.score})
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