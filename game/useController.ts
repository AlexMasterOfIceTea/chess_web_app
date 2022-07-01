import { useCallback, useEffect, useState } from "react";
import { Board, GameMove, PieceColor } from "../interfaces/types";
import { getPossibleMoves } from "./gamerules";
import { Coord, flatten, getColor, pointsEqual } from "./utils"

type State = {
    focus: Coord,
    move: GameMove,
    possibleMoves: GameMove[]
}

export const useController = (board:Board, turn:PieceColor, getPossibleMoves: (from:Coord) => GameMove[]) => {

    const NO_FOCUS:() => State = () => ({
        focus: null,
        move: null,
        possibleMoves: [],
    });
    
    const FOCUSED:(x:number, y:number) => State = (x, y) => ({
        focus: {x, y},
        move: null,
        possibleMoves: getPossibleMoves({x, y})
    });
    
    const MOVE_CHOSEN:(mv:GameMove) => State = (move) => ({
        focus: null,
        move: move,
        possibleMoves: [],
    })

    const [{focus, move, possibleMoves}, setState] = useState<State>(NO_FOCUS);

    const resetFocus = useCallback(() => setState(NO_FOCUS), []);

    const clickListener = useCallback((x:number, y:number) => {
        if(focus == null){
            if(getColor(board[flatten(x, y)]) === turn)
                setState(FOCUSED(x, y));
        }else{
            if(pointsEqual(focus, {x, y})){
                setState(NO_FOCUS);
                return
            }
            if(getColor(board[flatten(x, y)]) === turn){
                setState(FOCUSED(x, y));
                return
            }

            const move = possibleMoves.find(({to}) => pointsEqual({x, y}, to));
            setState(MOVE_CHOSEN(move));
        }
    }, [focus, board, getPossibleMoves]);

    return {
        resetFocus,
        clickListener,
        focus,
        gameMove: move,
        possibleMoves
    }
}