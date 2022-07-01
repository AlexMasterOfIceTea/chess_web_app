import { FC, MouseEventHandler, useCallback, useEffect, useRef } from "react";
import { Coord, expand, flatten, getColor, getImagePath, getPieceId } from "../game/utils";
import { BLACK, WHITE } from "../interfaces/constants";
import {
  Board as BoardType,
  GameMove,
  GameState,
  Piece as PieceType,
  PromotionPieces,
} from "../interfaces/types";


/*
const getPieces = (board: BoardType) => {
  const pieces = [...new Array(254)].map((_,i) => ({
    id: i,
    pos: {x:0, y:0},
    dead: true
  }));

  board.forEach((v, i) => {
    if(v)
      pieces[v].pos = expand(i);
      pieces[v].dead = false;
  });
  if(deadPiece)
    pieces[deadPiece.id] = {
      ...deadPiece,
      dead: true
    }
  return pieces.map(({id, pos, dead}) => (
    <Piece {...{id, pos, dead}}/>
  ))
}
*/

type Props = {
  state: GameState;
  focus: Coord;
  possibleMoves: GameMove[];
  onClick: (x: number, y: number) => void;
  onFocus?: (x: number, y: number) => void;
};

export const Board: FC<Props> = ({state:{pieces, turn, check}, focus, possibleMoves, onClick }) => {
  const listener: MouseEventHandler<HTMLDivElement> = (e) => {
    const ind = (e.target as HTMLDivElement).id;
    const id = ind.split("_")[1];
    const coords = expand(parseInt(id));
    onClick(coords.x, coords.y);
  };

  const markings = {};
  if (focus) markings[flatten(focus)] = selectedField;
  possibleMoves.forEach((move) => {
    markings[flatten(move.to)] = friendlyField;
    if(move.deadPiece)
      markings[flatten(move.to)] = oppField;
    
  });

  return (
    <div className="mx-auto [width:90vmin] aspect-square relative">
      <div
        className="absolute inset-0 w-full h-full flex flex-wrap"
        onClick={listener}
      >
        {[...new Array(64)].map((_, i) => (
          <Field index={i} marked={markings[i]} />
        ))}
      </div>
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {
          pieces.map((p, i) => (
            <Piece {...p} focusable={getColor(p.composition) === turn}/>
          ))
        }
      </div>
      <h2 className={`absolute select-none pointer-events-none text-red-500 z-10 text-2xl transition-opacity inset-x-1/2 top-10 ${turn === BLACK && check ? "opacity-100" : "opacity-0"}`}>Check</h2>
      <h2 className={`absolute select-none pointer-events-none text-red-500 z-10 text-2xl transition-opacity inset-x-1/2 bottom-10 ${turn === WHITE && check ? "opacity-100" : "opacity-0"}`}>Check</h2>
    </div>
  );
};

const friendlyField = "[filter:drop-shadow(0_0_2vmin_green)]";
const oppField = "[filter:drop-shadow(0_0_2vmin_red)]";
const selectedField = "[filter:drop-shadow(0_0_2vmin_orange)]";

export const Piece: FC<PieceType & {focusable:boolean}> = ({ composition, pos: { x, y }, dead, focusable}) => (
  <div
    tabIndex={focusable ? composition : -1}
    id={`piece_${getPieceId(composition)}`}
    key={getPieceId(composition)  }
    style={{
      backgroundImage: `url(${getImagePath(composition)})`,
      left: `${x * 12.5}%`,
      top: `${y * 12.5}%`,
    }}
    className={`
      ${dead ? "blur-3xl opacity-0" : "opacity-100 blur-none"}
      absolute transition-all duration-300
      bg-contain bg-no-repeat
      w-[12.5%] h-[12.5%] 
    `}
  ></div>
);

type FieldProps = {
  index: number;
  marked?: typeof friendlyField | typeof oppField | typeof selectedField;
};

const Field: FC<FieldProps> = ({ index, marked }) => (
  <div
    className={`
            flex justify-center items-center
            w-[12.5%] h-[12.5%] 
            ${marked ?? ""}
            ${
              index % 2 !== Math.floor(index / 8) % 2
                ? "bg-gray-900/50"
                : "bg-gray-200/50"
            }  
        `}
    key={index}
    id={`field_${index}`}
  ></div>
);
