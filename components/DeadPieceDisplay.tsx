import { FC } from "react";
import { getImagePath } from "../game/utils";
import { Piece } from "../interfaces/types";

export const DeadPieceDisplay:FC<{pieces: Piece[]}> = ({pieces}) => {
    return (
        <div className="flex flex-row flex-wrap-reverse w-80 h-16">
            {pieces.map(p => (
                <div 
                    style={{backgroundImage: `url(${getImagePath(p.composition)})`}}
                    className="w-1/6 h-auto bg-no-repeat bg-contain">
                    </div>
            ))}
        </div>
    )
}