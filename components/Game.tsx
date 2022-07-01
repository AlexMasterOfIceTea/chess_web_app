import { FC, useCallback, useEffect, useState } from "react";
import { useGame } from "../game/useGame";
import { useController } from "../game/useController";
import { PieceType, PromotionPieces } from "../interfaces/types";
import { Board } from "./Board";
import { PromotionDialog } from "./PromotionDialog";
import { DeadPieceDisplay } from "./DeadPieceDisplay";
import { GameOverDialog } from "./GameOverDialog";

export const Game:FC = () => {
    const {move, getPossibleMoves, state, resetGame} = useGame();
    const {focus, gameMove, clickListener, possibleMoves, resetFocus} = useController(state.board, state.turn, getPossibleMoves);

    const onPromotion = useCallback<(p:PromotionPieces | 0) => void>(
        (p) => {
            if(gameMove && p)
                move({
                    ...gameMove,
                    promoteToType: p,
                });
            resetFocus();
        }, 
    [gameMove, resetFocus, move]);

    useEffect(() => {
        if(gameMove && !gameMove.promoting)
            move(gameMove);
    }, [gameMove]);

    return (
        <div>
            <PromotionDialog 
                open={gameMove?.promoting ?? false}
                onChange={onPromotion}
                color={state.turn}
            />
            <Board 
                onClick={clickListener}
                state={state}
                focus={focus}
                possibleMoves={possibleMoves}
            />
            {/* <DeadPieceDisplay pieces={state.pieces.filter(p => p.dead)}/> */}
            <GameOverDialog onNewGame={resetGame}
                reason={state.reason}
                winner={state.winner}
            />
        </div>
    )
}