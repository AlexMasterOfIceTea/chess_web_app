import { useCallback, useState } from "react"
import { GameMove } from "../interfaces/types";
import { initialState, move as getNewState, getPossibleMoves} from "./gamerules";
import { Coord } from "./utils";

export const useGame = () => {
    const [state, setState] = useState(initialState);
    const move = (mv:GameMove) => setState(s => getNewState(s, mv));
    const possibleMoves = useCallback((from:Coord) => getPossibleMoves(state, from), [state]);
    const resetGame = useCallback(() => setState(initialState), []);


    return {
        state,
        move,
        getPossibleMoves: possibleMoves,
        resetGame
    }
}