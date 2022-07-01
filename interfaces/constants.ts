//precompute all values for typescript
export const WHITE = 0;
export const BLACK = 128 //1<<7;
export const colors = {BLACK, WHITE};

export const PAWN = 16; // 1<<4
export const ROOK = 32; // 2<<4
export const KNIGHT = 48; // 3<<4
export const BISHOP = 64; //4<<4
export const QUEEN = 80;  //5<<4  0101 0000
export const KING = 96; //6<<4

export const pieces = {PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING};

export const winningReasons = ["Checkmate", "Stalemate", "Repetition"] as const;