import { useEffect, useRef, useState } from 'react';
import type { Player, Trait } from '../data/types';
import traits from '../data/traits.json' with {type: 'json'};
import attachments from '../data/attachment.json' with {type: 'json'};
import CardItem from './CardItem';
import ListItem from './ListItem';
import { findAttachment } from '../util/util';
import { checkScore } from '../util/score';

const attachmentList: Trait[] = attachments as Trait[];

type Props = {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    selectedPlayer: number;
    selectedPile: number;
    discardPile: string[];
    traitList: string[];
    removeFn: Function;
};

export default function CardList({traitList, selectedPile, players, setPlayers, selectedPlayer, discardPile, removeFn}: Props) {
    const [targetTrait, setTargetTrait] = useState<{index: number, code: string}>({index: 0, code: ""}); // Item targeted for techlings attachment
    const [showAttachmentList, setShowAttachmentList] = useState<Boolean>(false);

    const attachmentListRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onOuterClick(event: MouseEvent) {
            if(attachmentListRef.current && event.target instanceof Node && !attachmentListRef.current.contains(event.target)) {
                setShowAttachmentList(false);
            }
        }

        document.addEventListener("mouseup", onOuterClick);

        return () => {
            document.removeEventListener("mouseup", onOuterClick);
        }
    }, [attachmentListRef]);

    function attachmentOnClick(trait: Trait) {
        const attachmentCode: string = trait.code;
        let traitCode: string = targetTrait.code;

        if(attachmentCode === "0") {
            if(targetTrait.code.length > 2) {
                traitCode = targetTrait.code[2] !== "0" && targetTrait.code[3] !== "0" ?
                targetTrait.code.slice(0, 4) : targetTrait.code.slice(0, 2);
            }
        } else {
            traitCode = targetTrait.code.length === 2 ?
                targetTrait.code + "00" + attachmentCode : `${targetTrait.code.slice(0, 4)}${attachmentCode}`;
        }

        players[selectedPlayer].traitPile[targetTrait.index] = traitCode;

        setPlayers([...players]);
        setShowAttachmentList(false);
        setTargetTrait({index: 0,code: ""});

        checkScore(players, discardPile);
    }

    return (
        <div>
            {
                showAttachmentList && <div ref={attachmentListRef} className='list-container modal window'>
                {
                    attachmentList.map((trait: Trait, index) =>
                        <ListItem 
                            key={index + trait.code}
                            className='attachment-item'
                            text={trait.name}
                            onClick={() => attachmentOnClick(trait)}
                        />
                    )
                }
                </div>
            }
            <ul id='scrollWindow' className='scrollable'>
            {
                traitList && traitList.map((traitId, index) => {
                    const trait = traits.find(e => e.code === traitId.slice(0, 2));
                    const attachment: Trait | void = findAttachment(traitId);
                    const attachmentName = trait && attachment ? attachment.name : null;
                    const traitName = trait ? attachmentName ? `${trait.name} / ${attachmentName}` : trait?.name : "";
                    return (
                        <li key={traitId + index}>
                        {
                            <CardItem 
                                traitListIndex={index}
                                traitName={traitName}
                                traitCode={traitId}
                                selectedPile={selectedPile}
                                setShowAttachmentList={setShowAttachmentList}
                                setTargetTrait={setTargetTrait}
                                onClick={() => removeFn(traitList, index)}
                            />
                        }
                        </li>
                    );
                })
            }
            </ul>
        </div>
    );
}