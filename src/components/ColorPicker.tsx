import Popup from "./Popup";

type Props = {
    title: string;
    double: boolean;
    doubleTitle?: string;
    onSelect: (index: number, colorCode: number) => void;
    onAdd?: () => void;
    onCancel: () => void;
    show?: boolean;
    selectedColor?: number[];
};

export default function ColorPicker({title, double=false, doubleTitle="", onSelect, onAdd, onCancel, show=true, selectedColor}: Props) {
    function onColorButtonClick(row: number, column: number): void {
        onSelect(row, column);
    }

    function getSelectedColor(index: number, value: number): string {
        if(selectedColor) {
            return selectedColor[index] === value ?  "selected" : "unselected";
        }
        return "";
    }
    
    return (
        <>
        {
            show && <Popup>
                <h2 className="dbl-color-picker-header">{title}</h2>
                <div className="color-pick-button-container">
                    <div className={"color-pick-button bg-red " + getSelectedColor(0, 0)} onClick={() => onColorButtonClick(0, 0)}>Red</div>
                    <div className={"color-pick-button bg-blue " + getSelectedColor(0, 1)} onClick={() => onColorButtonClick(0, 1)}>Blue</div>
                    <div className={"color-pick-button bg-green " + getSelectedColor(0, 2)} onClick={() => onColorButtonClick(0, 2)}>Green</div>
                    <div className={"color-pick-button bg-purple " + getSelectedColor(0, 3)} onClick={() => onColorButtonClick(0, 3)}>Purple</div>
                </div>
                {
                    double && <>
                        <h2 className="dbl-color-picker-header">{doubleTitle}</h2>
                        <div className="color-pick-button-container">
                            <div className={"color-pick-button bg-red " + getSelectedColor(1, 0)} onClick={() => onColorButtonClick(1, 0)}>Red</div>
                            <div className={"color-pick-button bg-blue " + getSelectedColor(1, 1)} onClick={() => onColorButtonClick(1, 1)}>Blue</div>
                            <div className={"color-pick-button bg-green " + getSelectedColor(1, 2)} onClick={() => onColorButtonClick(1, 2)}>Green</div>
                            <div className={"color-pick-button bg-purple " + getSelectedColor(1, 3)} onClick={() => onColorButtonClick(1, 3)}>Purple</div>
                        </div>
                    </>
                }
                <div className="color-pick-select-container">
                    <button onClick={onAdd}>OK</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </Popup>
        }
        </>
    );
}