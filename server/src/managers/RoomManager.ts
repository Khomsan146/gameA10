import { GameManager } from './GameManager';
import { Player } from './types';

export class RoomManager {
    private rooms: Map<string, GameManager> = new Map();

    public createRoom(host: Player): string {
        const roomId = this.generateRoomId();
        const game = new GameManager(roomId, host);
        this.rooms.set(roomId, game);
        return roomId;
    }

    public getGame(roomId: string): GameManager | undefined {
        return this.rooms.get(roomId);
    }

    public joinRoom(roomId: string, player: Player): boolean {
        const game = this.rooms.get(roomId);
        if (!game) return false;

        // Prevent joining if game started (unless reconnect logic is added later)
        if (game.getState().phase !== 'LOBBY') return false;

        game.addPlayer(player);
        return true;
    }

    public removePlayer(roomId: string, playerId: string): void {
        const game = this.rooms.get(roomId);
        if (game) {
            game.removePlayer(playerId);
            if (game.getState().players.length === 0) {
                this.rooms.delete(roomId);
            }
        }
    }

    private generateRoomId(): string {
        return Math.random().toString(36).substring(2, 6).toUpperCase();
    }
}
