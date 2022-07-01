//Datastructure:
//board = byte[64] array
//each field is 1 byte and is structured
//as follows:

import { Board, GameState, Hashtable, Piece, PieceColor, PieceIndex, PieceType } from "../interfaces/types";
import { BLACK, colors, PAWN, pieces, WHITE } from "../interfaces/constants";

export type Coord = { x: number; y: number };

// i=> index
// t=> type
// c=> color
// cttt iiii

//empty fields are 0

export const getPieceId = (p:number) => {
	//if piece was promoted, return its OG-id
	if(8 & p)
		return getColor(p) | PAWN | (getIndex(p)-8);
	return p;
}

export const flatten:(arg1: number | Coord, y?: number)=>number = (arg1, y) => {
    if(typeof arg1 === "number")
        return arg1 + y * 8;
  return arg1 == null ? null : flatten(arg1.x, arg1.y);
};

export const expand = (i: number) =>
    i == null ? null : { x: i % 8, y: Math.floor(i / 8) };

export const oppColor:(myColor:PieceColor) => PieceColor = (myColor) => (myColor^BLACK) as PieceColor;

export const pointsEqual = (a:Coord, b:Coord) => a.x === b.x && a.y === b.y;

export const getColor = (piece:number) =>
    (piece ? piece & 0x80 : null) as PieceColor;

export const getType = (piece:number) => 
    (piece ? piece & 0x70 : null) as PieceType;

export const getIndex = (piece:number) => 
    (piece ? piece & 0x0f : null) as PieceIndex;

export const decompose = (piece:number) => ({
    color: getColor(piece),
    type: getType(piece),
    index: getIndex(piece)
});

export const colorToString = (c:PieceColor) => c === WHITE ? "white" : "black";

export const typeToString = (t:PieceType) => 
	Object.keys(pieces).filter(
		k => pieces[k] === t
	);

export const dropIndex = (piece:number) => (piece == null ? null : piece & ~0x0f);

export const getImagePath = (piece:number) => {
    const color = Object.keys(colors).filter(
        k => colors[k] === getColor(piece)
	);

	const type = Object.keys(pieces).filter(
		k => pieces[k] === getType(piece)
	);

	//not a valid id
	if (color.length === 0 || type.length === 0) 
        return null;
	return `/images/${color[0].toLowerCase()}_${type[0].toLowerCase()}.svg`;
}

export const outOfBounds = (x:number, y:number) => x < 0 || x > 7 || y < 0 || y > 7;

export function hashCode(intArray:number[]){
	const p = 16777619;
	let hash = intArray.reduce((hash, element) => (hash ^ element) * p, 2166136261);

	hash += hash << 13;
	hash ^= hash >> 7;
	hash += hash << 3;
	hash ^= hash >> 17;
	hash += hash << 5;
	return hash;
};

/*

export const outOfBounds = (x, y) => x < 0 || x > 7 || y < 0 || y > 7;

//move encoded as 00ffffff ttttttpp
//f => fromIndex
//t => toIndex
//p => pawnType

export const intToType = type => (type + 2) << 4;

export const typeToInt = number => number && (number >> 4) - 2;

export const encodeMove = ({ from, to }, type = 0) => {
	const [fromIndex, toIndex] = [flatten(from), flatten(to)];
	return typeToInt(type) | (toIndex << 2) | (fromIndex << 8);
};



//Accurate up to ms
export const timestampToUnix = (ts) => ts.seconds * 1000 + ts.nanoseconds / 1000000;

export const decodeMove = (board, moveNumber) => {
	const fromIndex = moveNumber >> 8;
	const toIndex = (moveNumber & 0x00ff) >> 2;
	const pawnType = moveNumber & 0x0003;
	const piece = board[fromIndex];

	const [from, to] = [expand(fromIndex), expand(toIndex)];
	const mv = { from, to };
	if (board[toIndex] && fromIndex !== toIndex) 
		mv.deadPiece = {
			id: board[toIndex],
			...expand(toIndex)
		}

	//check pawnTransform
	if (idToType(piece) === pawn && (to.y === 7 || to.y === 0)){
		mv.promotionType = intToType(pawnType);
	}
	//check casteling
	else if (
		idToType(piece) === king &&
		Math.abs(from.x - to.x) === 2
	){
		mv.casteling = true;
	}
	//set enPassantSquare
	else if(
		idToType(piece) === pawn && 
		Math.abs(from.y - to.y) === 2
	){
		mv.enPassantSquare = flatten(from.x, (from.y + to.y)/2);
	}
	//check en passant (pawn moves diagonally without killing directly)
	else if (
		idToType(piece) === pawn &&
		Math.abs(from.x - to.x) === Math.abs(from.y - to.y) &&
		!board[toIndex]
	){
		mv.deadPiece = {
			id: board[flatten(to.x, from.y)],
			x: to.x,
			y: from.y,
		}
	}
	return mv;
};
*/
