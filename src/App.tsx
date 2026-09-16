import { useEffect, useRef, useState } from 'react';
import './App.css';
import { type Player, type Catastrophe, type ModifierType, type Sign } from './data/types';
import { findCatastrophe, findTrait } from './util/util';
import { checkScore } from './util/score';
import signs from "./data/sign.json" with {type: 'json'};
import PlayerTab from './components/PlayerTab';
import CardList from './components/CardList';
import CardInput from './components/CardInput';
import PlayerInfoBar from './components/PlayerInfoBar';
import PileTab from './components/PileTab';
import CatastropheButton from './components/CatastropheButton';
import SignList from './components/SignList';

const signData: Sign[] = signs;

export default function App() {
  const [players, setPlayers] = useState<Player[] | []>([]);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [selectedPile, setSelectedPile] = useState<number>(0);
  const [selectedCatastrophe, setSelectedCatastrophe] = useState<Catastrophe>(() => findCatastrophe("00"));
  const [traitList, setTraitList] = useState<string[]>([]);
  const [discardPile, setDiscardPile] = useState<string[]>([]);
  const [showSignList, setShowSignList] = useState<boolean>(false);
  const [sign, setSign] = useState<Sign>(signData[0]);

  const uid = useRef(0);

  useEffect(() => {
    setPlayers([]);
    checkScore([], discardPile);
    
    window.addEventListener('resize', resizeTraitList);
    
    return () => {
      window.removeEventListener('resize', resizeTraitList);
    }
  }, []);

  useEffect(() => {
      resizeTraitList();
  }, [players.length, showSignList]);

  useEffect(() => {
    // move this to function that selects catastrophe instead(updates after page redraws)
    if(players.length > 0) {
      checkScore(players, discardPile);
    }
  }, [players, selectedCatastrophe]);

  useEffect(() => {
    setTraitList(() => players.length > 0 ? getTraitPile() : []);
  }, [players, selectedPlayer, selectedPile, discardPile]);
  

  function resizeTraitList(): void {
    const scrollWindow: HTMLElement | null = document.getElementById("scrollWindow");
    if(scrollWindow) {
      const rect = scrollWindow.getBoundingClientRect();
      scrollWindow.style.height = `${(window.innerHeight - rect.y - 8).toString()}px`;
    }

    const signListWindow: HTMLElement | null = document.getElementById("signListWindow");
    if(signListWindow) {
      signListWindow.style.maxHeight = `${(window.innerHeight - 64).toString()}px`;
    }
  }

  function getTraitPile(): string[] {
    switch(selectedPile) {
      case 0:
        return players[selectedPlayer].traitPile;
      case 1:
        return players[selectedPlayer].hand;
      case 2:
        return discardPile;
      default : return [];
    }
  }

  function removeTrait(list: string[] | null, index: number): void {
    if(list) {
      const removingTraitId: string = list.splice(index, 1)[0];
      const removingTrait = findTrait(removingTraitId.slice(0, 2));
      if(removingTraitId.length > 2) {
          const modifier = removingTrait?.effect?.type;
          if(modifier === "colorChange") {
              const fromColor = removingTraitId.slice(2, 3);
              const toColor = removingTraitId.slice(3, 4);
              const index: number = players[selectedPlayer].modifier.findIndex((e: ModifierType) => {
                return (typeof e === "object" && e.type === "color" && e.from === fromColor && e.to == toColor);
              });
              players[selectedPlayer].modifier.splice(index, 1);
          }
      }

      setPlayers([...players]);
      checkScore(players, discardPile);
    }
  }

  return (
    <div className='app-container'>
      <SignList
        signData={signData}
        setSign={setSign}
        showSignList={showSignList}
        setShowSignList={setShowSignList}
      />
      <header>
        <p className='title'>Doomlings Score Calculator</p>
      </header>
      <CatastropheButton
        players={players}
        discardPile={discardPile}
        selectedCatastrophe={selectedCatastrophe}
        setSelectedCatastrophe={setSelectedCatastrophe}
      /> 
      <main>
        <PlayerTab 
          players={players}
          setPlayers={setPlayers}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          selectedPlayerName={selectedPlayerName}
          setSelectedPlayerName={setSelectedPlayerName}
          discardPile={discardPile}
          uId={uid}
          sign={sign}
          setSign={setSign}
          setShowSignList={setShowSignList}
        />
        <PlayerInfoBar
          players={players}
          setPlayers={setPlayers}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          selectedPlayerName={selectedPlayerName}
          setSelectedPlayerName={setSelectedPlayerName}
          discardPile={discardPile}
          uId={uid}
          sign={sign}
          setSign={setSign}
          setShowSignList={setShowSignList}
        />
        <CardInput
          players={players}
          setPlayers={setPlayers}
          selectedPlayer={selectedPlayer}
          discardPile={discardPile}
          setDiscardPile={setDiscardPile}
        />
        <PileTab selectedPile={selectedPile} setSelectedPile={setSelectedPile}/>
        <CardList
          traitList={traitList}
          selectedPile={selectedPile}
          players={players}
          setPlayers={setPlayers}
          selectedPlayer={selectedPlayer}
          discardPile={discardPile}
          removeFn={removeTrait} />
      </main>
    </div>
  );
}