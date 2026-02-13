export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';
export type Rank = '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    id: string; // unique card id for tracking animations
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
    cards: Card[]; // For Q cards held in hand
    sipsConsumed: number; // For detailed stats
}

export type GamePhase = 'LOBBY' | 'PLAYING' | 'GAME_OVER';

export interface GameState {
    roomId: string;
    phase: GamePhase;
    players: Player[];

    // Game Logic State
    currentTurnPlayerId: string;
    direction: 1 | -1; // 1 for Clockwise, -1 for Counter-Clockwise
    deck: Card[]; // Server-side only
    deckCount: number; // Visible to clients
    discardPile: Card[]; // Last card is the visible one

    // Rule Tracking
    acesDrawnCount: number; // 0-4
    rankCounts: Record<Rank, number>; // Tracks counts for Fire Rule (4 of a kind)

    // Temporary States
    pendingAction: 'NONE' | 'WAITING_FOR_DEFENSE' | 'WAITING_FOR_TARGET_SELECTION' | 'WAITING_FOR_Q_DECISION';
    actionTargetId?: string; // Who is being targeted (e.g., by King)
    lastActionDescription: string; // "Player A drew a King!"
}
