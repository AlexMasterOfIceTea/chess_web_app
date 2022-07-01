import { Coord } from "../game/utils";
import { WHITE, BLACK, ROOK, KNIGHT, winningReasons, PAWN, BISHOP, QUEEN, KING } from "./constants"

export type PieceColor = typeof WHITE | typeof BLACK;

export type PieceType = typeof PAWN |
    typeof ROOK |
    typeof KNIGHT |
    typeof BISHOP |
    typeof QUEEN |
    typeof KING;

export type PieceIndex = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15;

//Thats enough information to infer the next game state
export type CompressedGameMove = {
    from:number,
    to:number,
}

export type Board = number[];

export type PromotionPieces = typeof ROOK | typeof KNIGHT | typeof BISHOP | typeof QUEEN;

export type Hashtable<T = number> = {
    [hash:number]:T
};

export type Piece = {
    composition:number,
    pos: Coord,
    dead?: boolean,
}

export type GameMove = {
    from: Coord,
    to: Coord,
    //composition of the piece being moved
    piece: number,
    //composition of the piece that died
    deadPiece?:number,
    castelingLeft?:boolean,
    castelingRight?:boolean,
    enPassantSquare?:number,
    promoting?:boolean,
    promoteToType?: PromotionPieces,
}

export type PlayerState = {
    timeLeft: number,
    canCastleLeft: boolean,
    canCastleRight: boolean,
}

export type GameState = {
    turn: PieceColor,
    lastMoveTs: number,
    board: number[],
    //pieces by their composition
    pieces: Piece[],
    check: boolean,
    winner?: PieceColor | "draw",
    reason?: typeof winningReasons[number],
    enPassantSquare?: number,
    promotionSquare?: number,
    white: PlayerState,
    black: PlayerState,
    //array of hashed gamestates, used to count repetititve positions
    positionCount: Hashtable,    
    move50Count: number,
}