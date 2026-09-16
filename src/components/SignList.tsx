import type { Sign } from "../data/types";
import ListItem from "./ListItem";
import { useEffect, useRef } from "react";


type Props = {
    setSign: React.Dispatch<React.SetStateAction<Sign>>;
    signData: Sign[]
    showSignList: boolean;
    setShowSignList: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SignList({setSign, signData, showSignList, setShowSignList}: Props) {

    const signListRef: React.RefObject<HTMLDivElement | null> = useRef(null);

    function signOnClick(sign: Sign) {
        setSign(sign);
        setShowSignList(false);
    }

    useEffect(() => {
        function onOuterClick(event: MouseEvent) {
            if(signListRef.current && event.target instanceof Node && !signListRef.current.contains(event.target)) {
                setShowSignList(false);
            }
        }

        document.addEventListener("mouseup", onOuterClick);

        return () => {
            document.removeEventListener("mouseup", onOuterClick);
        }
    }, [signListRef]);

    return (
        <>
        {
            showSignList &&
            <div ref={signListRef} id="signListWindow" className='sign-container window'>
                {
                    signData.map((sign, index) => 
                        <ListItem
                            key={index + sign.id}
                            className='attachment-item'
                            text={sign.name}
                            onClick={() => signOnClick(sign)}
                        />
                    )
                }
            </div>
        }
        </>
    );
}