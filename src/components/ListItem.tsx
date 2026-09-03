import type React from "react";

type Props = {
    className?: string;
    text: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>
}

export default function({className, text, onClick}: Props) {
    return (
        <div
            className={'list-item ' + className}
            onClick={onClick}
        >
            {text}
        </div>
    )
}