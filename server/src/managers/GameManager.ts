import { v4 as uuidv4 } from 'uuid';
import { Card, GameState, Player, Rank, Suit } from './types';

const SUITS: Suit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
const RANKS: Rank[] = ['10', 'J', 'Q', 'K', 'A'];

export class GameManager {
    private state: GameState;

    constructor(roomId: string, hostPlayer: Player) {
        this.state = {
            roomId: roomId,
            phase: 'LOBBY',
            players: [hostPlayer],
            currentTurnPlayerId: hostPlayer.id,
            direction: 1, // Clockwise
            deck: [],
            deckCount: 0,
            discardPile: [],
            acesDrawnCount: 0,
            rankCounts: { '10': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0 },
            pendingAction: 'NONE',
            lastActionDescription: 'Waiting for players...'
        };
    }

    public getState(): GameState {
        return this.state;
    }

    public addPlayer(player: Player): void {
        this.state.players.push(player);
    }

    public removePlayer(playerId: string): void {
        this.state.players = this.state.players.filter(p => p.id !== playerId);
        if (this.state.players.length > 0 && this.state.phase === 'LOBBY') {
            // Assign new host if host leaves
            if (!this.state.players.some(p => p.isHost)) {
                this.state.players[0].isHost = true;
            }
        }
    }

    public startGame(): void {
        if (this.state.players.length < 2) {
            throw new Error("Not enough players to start.");
        }

        this.state.phase = 'PLAYING';
        this.setupDeck();
        this.state.currentTurnPlayerId = this.state.players[0].id;
        this.state.lastActionDescription = "Game Started! " + this.state.players[0].name + "'s turn.";

        // Reset counters
        this.state.acesDrawnCount = 0;
        this.state.rankCounts = { '10': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0 };
    }

    private setupDeck(): void {
        const deck: Card[] = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push({
                    id: uuidv4(),
                    suit: suit,
                    rank: rank
                });
            }
        }
        this.state.deck = this.shuffle(deck);
        this.state.deckCount = this.state.deck.length;
        this.state.discardPile = [];
    }

    private shuffle(array: Card[]): Card[] {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    public drawCard(playerId: string): { card: Card, penalty?: string } {
        // Validation
        if (this.state.phase !== 'PLAYING') throw new Error("Game not active");
        if (this.state.currentTurnPlayerId !== playerId) throw new Error("Not your turn");
        if (this.state.pendingAction !== 'NONE') throw new Error("Resolve pending action first");

        // Deck Management
        if (this.state.deck.length === 0) {
            // Reshuffle discard pile (except top card)
            if (this.state.discardPile.length <= 1) {
                throw new Error("No cards left to shuffle!"); // Should be impossible with minimal checks
            }
            const activeCard = this.state.discardPile.pop()!;
            const newDeck = this.state.discardPile;
            this.state.deck = this.shuffle(newDeck);
            this.state.discardPile = [activeCard];
            this.state.lastActionDescription = "Deck reshuffled!";
        }

        const card = this.state.deck.pop()!;
        this.state.discardPile.push(card);
        this.state.deckCount = this.state.deck.length;

        // Update Stats
        this.state.rankCounts[card.rank]++;

        let penaltyMessage: string | undefined = undefined;

        // FIRE RULE CHECK
        if (this.state.rankCounts[card.rank] === 4) {
            penaltyMessage = `FIRE RULE! 4th ${card.rank} drawn! DRINK!`;
            this.state.rankCounts[card.rank] = 0; // Reset or keep? Design says "trigger penalty". Usually resets to prevent infinite loop next turn.
            this.state.lastActionDescription = `${this.getPlayerName(playerId)} triggered FIRE RULE with ${card.rank}!`;
        }

        // Apply Card Logic
        this.handleCardEffect(card, playerId);

        if (!penaltyMessage) {
            this.state.lastActionDescription = `${this.getPlayerName(playerId)} drew ${card.rank} of ${card.suit}`;
        }

        // Advance Turn only if no pending action blocks it (like King target selection)
        if (this.state.pendingAction === 'NONE' && this.state.phase === 'PLAYING') {
            this.advanceTurn();
        }

        return { card, penalty: penaltyMessage };
    }

    private handleCardEffect(card: Card, playerId: string) {
        switch (card.rank) {
            case 'A':
                this.state.acesDrawnCount++;
                if (this.state.acesDrawnCount >= 4) {
                    this.state.phase = 'GAME_OVER';
                    this.state.lastActionDescription = `GAME OVER! ${this.getPlayerName(playerId)} drew the 4th Ace!`;
                }
                break;
            case 'K':
                this.state.pendingAction = 'WAITING_FOR_TARGET_SELECTION';
                this.state.lastActionDescription = `${this.getPlayerName(playerId)} drew a King! Select a victim!`;
                break;
            case 'J':
                this.state.direction *= -1;
                this.state.lastActionDescription = "Direction Reversed!";
                break;
            case 'Q':
                const player = this.state.players.find(p => p.id === playerId);
                if (player) {
                    player.cards.push(card); // Add to inventory
                }
                this.state.lastActionDescription = `${this.getPlayerName(playerId)} kept a Shield (Q).`;
                break;
            case '10':
                // No state change, just a description update usually or a "Community Drink" flag?
                this.state.lastActionDescription = "Social! Everyone drinks!";
                break;
        }
    }

    public selectTarget(playerId: string, targetId: string) {
        if (this.state.pendingAction !== 'WAITING_FOR_TARGET_SELECTION') return;
        if (this.state.currentTurnPlayerId !== playerId) return;

        this.state.actionTargetId = targetId;
        this.state.lastActionDescription = `${this.getPlayerName(playerId)} selected ${this.getPlayerName(targetId)} to drink!`;
        this.advanceTurn();
    }

    public useQCard(playerId: string, useIt: boolean) {
        if (this.state.pendingAction !== 'WAITING_FOR_Q_DECISION') return;
        if (this.state.currentTurnPlayerId !== playerId) return;

        const player = this.state.players.find(p => p.id === playerId);
        if (!player) return;

        if (useIt) {
            // Use one Q card
            if (player.cards.length > 0) {
                player.cards.pop(); // Remove one Q card
                this.state.lastActionDescription = `${player.name} used a Shield (Q) to skip their turn!`;
                this.state.pendingAction = 'NONE';
                this.advanceTurn();
            } else {
                this.state.pendingAction = 'NONE'; // Should not happen
            }
        } else {
            // Decided not to use it, proceed to draw
            this.state.pendingAction = 'NONE';
            this.state.lastActionDescription = `${player.name} decided not to use their Shield. Draw a card!`;
        }
    }

    private advanceTurn() {
        const currentIndex = this.state.players.findIndex(p => p.id === this.state.currentTurnPlayerId);
        if (currentIndex === -1) return; // Should not happen

        // Logic for circular array with direction
        let nextIndex = (currentIndex + this.state.direction) % this.state.players.length;
        if (nextIndex < 0) nextIndex += this.state.players.length;

        const nextPlayerId = this.state.players[nextIndex].id;
        const nextPlayer = this.state.players[nextIndex];

        this.state.currentTurnPlayerId = nextPlayerId;

        // Check if next player has Q cards
        if (nextPlayer.cards.length > 0) {
            this.state.pendingAction = 'WAITING_FOR_Q_DECISION';
            this.state.lastActionDescription = `${nextPlayer.name}, you have a Shield! Use it to skip?`;
        } else {
            this.state.pendingAction = 'NONE';
        }
    }

    private getPlayerName(playerId: string): string {
        return this.state.players.find(p => p.id === playerId)?.name || "Unknown";
    }
}
