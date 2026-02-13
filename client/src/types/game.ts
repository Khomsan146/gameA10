export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';
export type Rank = '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    id: string;
    suit: Suit;
    rank: Rank;
}

export interface Player {
    id: string;
    name: string;
    socketId: string;
    avatarId: string;
    isHost: boolean;
    isConnected: boolean;
    cards: Card[];
    sipsConsumed: number;
}

export type GamePhase = 'LOBBY' | 'PLAYING' | 'GAME_OVER';

export interface GameState {
    roomId: string;
    phase: GamePhase;
    players: Player[];
    currentTurnPlayerId: string;
    direction: 1 | -1;
    deck: Card[];
    deckCount: number;
    discardPile: Card[];
    acesDrawnCount: number;
    rankCounts: Record<Rank, number>;
    pendingAction: 'NONE' | 'WAITING_FOR_DEFENSE' | 'WAITING_FOR_TARGET_SELECTION' | 'WAITING_FOR_Q_DECISION';
    actionTargetId?: string;
    lastActionDescription: string;
}
