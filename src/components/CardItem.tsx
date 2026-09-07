import DeleteButton from "./DeleteButton";
import techlingIcon from "../assets/techlings_icon.png";

type Props = {
    traitListIndex: number;
    traitName: string;
    traitCode: string;
    selectedPile: number;
    setShowAttachmentList: React.Dispatch<React.SetStateAction<Boolean>>;
    setTargetTrait: React.Dispatch<React.SetStateAction<{index: number,code: string}>>;
    onClick: () => void;
}
export default function CardItem({traitListIndex, traitName, traitCode, selectedPile, setShowAttachmentList, setTargetTrait, onClick}:Props) {
    function showAttachmentOnClick() {
        setShowAttachmentList(true);
        setTargetTrait({index: traitListIndex, code: traitCode});
    }

    return (
        <div className="card-item-container">
            <p>{traitName}</p>
            <div className="card-button-container">
            {
                selectedPile === 0 &&
                <div onClick={() => showAttachmentOnClick()}>
                    <img className="card-item-tech" src={techlingIcon} />
                </div>
            }
                <DeleteButton onClick={onClick} />
            </div>
        </div>
    );
}