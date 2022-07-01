import { moveCursor } from "readline";
import { BISHOP, BLACK, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE } from "../interfaces/constants";
import { Board, GameMove, GameState, Hashtable, Piece, PieceColor, PieceType, PlayerState, PromotionPieces } from "../interfaces/types";
import { expand, flatten, getColor, getType, outOfBounds, getIndex, getImagePath, hashCode, dropIndex, oppColor, Coord, decompose, getPieceId} from "./utils";

const knightOff = [[-1, 2], [1, 2], [2, 1], [2, -1], [-1, -2], [1, -2], [-2, 1], [-2, -1]];
const straight = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const diagonal = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

const blackPieces = [
    BLACK | ROOK,		BLACK | KNIGHT,		BLACK | BISHOP,		BLACK | QUEEN,		BLACK | KING,		BLACK | BISHOP | 1,	BLACK | KNIGHT | 1,	BLACK | ROOK | 1,
	BLACK | PAWN | 0,	BLACK | PAWN | 1,	BLACK | PAWN | 2,	BLACK | PAWN | 3,	BLACK | PAWN | 4,	BLACK | PAWN | 5,	BLACK | PAWN | 6,	BLACK | PAWN | 7
];

const whitePieces = [
    WHITE | PAWN | 0,	WHITE | PAWN | 1,	WHITE | PAWN | 2,	WHITE | PAWN | 3,	WHITE | PAWN | 4,	WHITE | PAWN | 5,	WHITE | PAWN | 6,	WHITE | PAWN | 7,
	WHITE | ROOK,		WHITE | KNIGHT,		WHITE | BISHOP,		WHITE | QUEEN,		WHITE | KING,		WHITE | BISHOP | 1,	WHITE | KNIGHT | 1,	WHITE | ROOK | 1,
]

const initialBoard:Board = [
    ...blackPieces,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	0, 0, 0, 0, 0, 0, 0, 0,
	...whitePieces
];

const initialPieces:Piece[] = [...new Array(32)]
    .map((_, i) => i < 16 ? {
        composition: initialBoard[i],
        pos: expand(i)
    }:{
        composition: initialBoard[i+32],
        pos: expand(i+32)
    });

const initialPlayer:PlayerState = {
    canCastleLeft: true,
    canCastleRight: true,
    timeLeft: 6000000   //10 min
}

export const initialState:GameState = {
    lastMoveTs: 0,
	board: initialBoard,
    pieces: initialPieces,
    white: initialPlayer,
    black: initialPlayer,
    check: false,
    move50Count: 0,
    positionCount: getNewPositionCount([], initialBoard, WHITE, 0, true, true)[0],
    turn: WHITE
};

const generateMoves = (board:Board, deltas:number[][], from:Coord, reach = 8) => {
    const moves:GameMove[] = [];
    const color = getColor(board[flatten(from)]);
    const piece = board[flatten(from)];
    for(const delta of deltas){
        for(let i=0; i<reach; i++){
            const x = from.x + (i+1)*delta[0];
            const y = from.y + (i+1)*delta[1];
            const index = flatten({x, y});
            if(outOfBounds(x, y) || getColor(board[index]) === color)
                break;
            
            let deadPiece = getColor(board[index]) === oppColor(color) ? board[index] : null;
            moves.push({
                piece, from,
                to:{x, y}, 
                deadPiece
            });
            if(deadPiece)
                break;
        }
    }
    return moves;
}

export const getPossibleMoves = (state:GameState, from:Coord) => {
    const {color, type} = decompose(state.board[flatten(from)]);
    const {board} = state;
    let moves:GameMove[];

    switch(type){
        case PAWN: 
            moves = pawnMoves(state, from);
            break;
        case ROOK:
            moves = generateMoves(board, straight, from);
            break;
        case KNIGHT:
            moves = generateMoves(board, knightOff, from, 1);
            break;
        case BISHOP:
            moves = generateMoves(board, diagonal, from);
            break;
        case QUEEN:
            moves = generateMoves(board, [...straight, ...diagonal], from);
            break;
        case KING:
            moves = generateMoves(board, [...straight, ...diagonal], from, 1);
            moves.push(...castlingMoves(state, color));
            break;
        default:
            moves = [];
    }

    //remove illegal moves(the ones that leave you in a check)
    for(let i=moves.length-1; i>=0; i--){
        const newBoard = getNewBoard(state.board, moves[i]);
        if(isCheck(newBoard, color))
            moves.splice(i, 1);
    }
    return moves;
}

const canCastle = (toLeft:boolean, board:Board, color:PieceColor) => {
    const y = color === BLACK ? 0:7;
    const n = toLeft ? 3 : 2;
    const dir = toLeft ? -1:1;
    for(let i=1; i<n+1; i++){
        const field = flatten(4+dir*i, y);

        //are the fields empty
        if(board[field])
            return false;
        
        //am i passing through a check
        const newBoard = [...board];
        newBoard[flatten(4, y)] = 0;
        newBoard[field] = color | KING;
        if(isCheck(newBoard, color))
            return false;
    }
    return true;
}

const castlingMoves = ({board, white, black}:Pick<GameState, "black" | "white" | "board">, color:PieceColor) => {
    const moves:GameMove[] = [];
    const y = color === BLACK ? 0:7;
    let {canCastleLeft, canCastleRight} = color === WHITE ? white : black;
    //castle left and right
    //try casteling to the left
    if(canCastleLeft && canCastle(true, board, color)){
        moves.push({
            piece: board[flatten(4, y)],
            from: {x: 4, y},
            to: {x: 2, y},
            castelingLeft: true,
        })
    }

    if(canCastleRight && canCastle(false, board, color)){
        moves.push({
            piece: board[flatten(4, y)],
            from: {x: 4, y},
            to: {x: 6, y},
            castelingRight: true
        })
    }
    return moves;
}

const pawnMoves = ({board, enPassantSquare}:GameState, from) => {
    const moves:GameMove[] = [];

    const piece = board[flatten(from)];
    const color = getColor(piece);
    const dir = color === WHITE ? -1 : 1;
    const canMoveTwice = from.y === 1 && color === BLACK || from.y === 6 && color === WHITE;

    const getNeighbour = (dx, dy) => {
        const [myX, myY] = [from.x+dx, from.y+dy];
        if(outOfBounds(myX, myY))
            return null;
        return board[flatten(myX, myY)];
    }

    //forward moves
    if(!getNeighbour(0, dir)){
        moves.push({
            piece,
            from,
            to: {x: from.x, y: from.y + dir},
        });
        if(canMoveTwice && !getNeighbour(0, 2*dir))
            moves.push({
                piece, from,
                to: {x: from.x, y: from.y + 2*dir},
                enPassantSquare: flatten(from.x, from.y + dir)
            });
    }

    //attacks
    for(const dx of [-1, 1]){
        if(getColor(getNeighbour(dx, dir)) === oppColor(color)){
            const to = {x: from.x+dx, y: from.y+dir};
            const deadPiece = board[flatten(to)];

            moves.push({piece, from, to, deadPiece});
        }
    }

    //En passant
    if(enPassantSquare) 
        for(const dx of [-1, 1]){
            const [x, y] = [from.x+dx, from.y+dir];
            if(!outOfBounds(x,y) && enPassantSquare === flatten(x,y))
                moves.push({
                    piece, from, 
                    to: {x, y},
                    deadPiece:board[flatten(from.x+dx, from.y)]
                });
        }
    
    //adds the promoting flag to each move
    return moves.map(mv => ({
        ...mv,
        promoting: mv.to.y === 7 || mv.to.y === 0, 
    }));
}

const getNewBoard = (board:Board, move:GameMove) => {
    const newBoard = [...board];
    const [toIndex, fromIndex] = [flatten(move.to), flatten(move.from)];
    
    if(move.deadPiece){
        const ind = board.findIndex(v => v === move.deadPiece);
        newBoard[ind] = 0;
    }

    if(toIndex !== fromIndex){
        newBoard[toIndex] = board[fromIndex];
        newBoard[fromIndex] = 0;
    }

    if(move.castelingLeft){
        newBoard[flatten(3, move.from.y)] = newBoard[flatten(0, move.from.y)];
        newBoard[flatten(0, move.from.y)] = 0;
    }else if(move.castelingRight){
        newBoard[flatten(5, move.from.y)] = newBoard[flatten(7, move.from.y)];
        newBoard[flatten(7, move.from.y)] = 0;        
    }else if(move.promoting){
        newBoard[toIndex] = promotePiece(newBoard[toIndex], move.promoteToType);
    }
    return newBoard;
}
/*
export const backtrack = (state) => {
    const {history} = state;
    const board = history[history.length - 2];
    const newBoard = [...board];
    return {
        ...state, 
        history: [...history.slice(-1), newBoard],
        board: newBoard,
        PAWNTransform: false        //transform is over
    } 
}
*/

const getPlayerState = () => {

}

const promotePiece = (piece:number, promotion:PromotionPieces) => {
    const {color, index} = decompose(piece);
    console.log({color, index, piece, promotion, newPiece:color | promotion | 8 | index})
    return color | promotion | 8 | index;
}

const getPieces = (board:Board) => {
    const pieces:Piece[] = [...blackPieces, ...whitePieces].map((piece, i) => {
        const ind = board.findIndex(v => getPieceId(v) === piece);
        const color =  i<16 ? BLACK : WHITE;
        let pos = expand(ind);
        if(ind === -1){
            pos = {x: 3.5, y:color === WHITE ? -1 : 8}
        }
        return {
            composition: board[ind] ?? piece,
            pos,
            dead: ind < 0,
        }            
    });
    return pieces;
}

const getCastelingState = (leftCastle:boolean, {board, black, white}:Pick<GameState, "board" | "black" | "white">, mv:GameMove) => {
    const {color, index, type} = decompose(board[flatten(mv.from)]);
    if(type === KING || mv.castelingLeft || mv.castelingRight)
        return false;

    const ind = leftCastle ? 0 : 1;
    if(type === ROOK && index === ind)
        return false;
    
    const player = color === WHITE ? white : black;
    return leftCastle ? player.canCastleLeft : player.canCastleRight;
}

export const move:(state:GameState, validMove:GameMove) => GameState 
    = ({board, positionCount, move50Count, enPassantSquare, turn, white, black, pieces}, validMove) => {
    const color = getColor(board[flatten(validMove.from)]);
    const opp = oppColor(color);
    const piece = board[flatten(validMove.from)];

    const newBoard = getNewBoard(board, validMove);
    const newPieces = getPieces(newBoard);

    console.log(newPieces);

    const player = {
        canCastleLeft: getCastelingState(true, {black, white, board}, validMove),
        canCastleRight: getCastelingState(false, {board, black, white}, validMove)
    }
    
    const [newPositionCount, hash] = getNewPositionCount(positionCount, newBoard, turn, enPassantSquare, player.canCastleLeft, player.canCastleRight);
    const newMove50Count = getMove50Count(move50Count, piece, validMove.deadPiece);

    const newState:GameState = {
        lastMoveTs: Date.now(),
        enPassantSquare: validMove?.enPassantSquare,
        pieces: newPieces,
        white: color === WHITE ? {...white, ...player} : white, 
        black: color === BLACK ? {...black, ...player} : black, 
        positionCount: newPositionCount,
        move50Count: newMove50Count,
        board: newBoard, 
        turn: opp,
        check: false
    };

    if(isCheck(newBoard, opp)){
        if(isStalemate(newState, opp))
            return {...newState, winner: color, reason: "Checkmate"} as GameState;
        return {...newState, check: true} as GameState;
    }
    if(isStalemate(newState, opp)){
        return {...newState, winner: "draw", reason: "Stalemate"} as GameState;
    }
    if(isRepetition(newPositionCount, hash)){
        return {...newState, winner: "draw", reason: "Repetition"} as GameState;
    }
        /*
    if(move50Count >= 100)
        return {...newState, canWHITEDraw: true};
        */
    return newState;
}

function getNewPositionCount(positionCount:Hashtable, newBoard:Board, turn:PieceColor, enPassantSquare:number,  canCastleLeft:boolean, canCastleRight:boolean) {
    const newHashmap =  {...positionCount};
    const arrayToHash = newBoard.map(piece => dropIndex(piece));
    arrayToHash.push(turn);
    arrayToHash.push(enPassantSquare == null ? 0 : enPassantSquare);
    arrayToHash.push(canCastleLeft ? 0 : 1);
    arrayToHash.push(canCastleRight ? 0 : 1);

    const hash = hashCode(arrayToHash);
    newHashmap[hash] = (newHashmap[hash]+1) || 1;
    return [newHashmap, hash] as [Hashtable, number];
};

const getMove50Count = (count:number, piece:number, deadPiece:number) => {
    if(getType(piece) === PAWN || deadPiece)
        return 0;
    return count+1;
}

const isCheck = (board:Board, color:PieceColor) => {
    const from = expand(board.findIndex(v => v === (color | KING)));
    const pawnDir = color === BLACK ? 1 : -1;
    const attackLines:GameMove[][] = [];
    attackLines[BISHOP] = generateMoves(board, diagonal, from);
    attackLines[ROOK] = generateMoves(board, straight, from);
    attackLines[KNIGHT] = generateMoves(board, knightOff, from, 1);
    attackLines[PAWN] = generateMoves(board, [[1, pawnDir], [-1, pawnDir]], from, 1);
    attackLines[QUEEN] = generateMoves(board, [...straight, ...diagonal], from);
    attackLines[KING] = generateMoves(board, [...straight, ...diagonal], from, 1);

    //if the king was of type pieceType, could it kill an opponents pieceType
    //if so, you are in a check 
    for(const pieceType of [BISHOP, ROOK, KNIGHT, PAWN, QUEEN, KING]){
        for(const move of attackLines[pieceType]){
            if(getType(move.deadPiece) === pieceType)
                return true;
        }
    }
    return false;
}

const isStalemate = (state:GameState, color:PieceColor) => {
    for(let i=0; i<64; i++){
        if(getColor(state.board[i]) !== color)
            continue;
        const moves = getPossibleMoves(state, expand(i));
        if(moves.length > 0)
            return false;
    }
    return true;
}

const isRepetition = (counter, hash) => counter[hash] >= 3;