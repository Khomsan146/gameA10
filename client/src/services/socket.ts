import { io, Socket } from 'socket.io-client';
import { GameState, Player, Card } from '../types/game';

const SERVER_URL = 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect() {
        if (this.socket?.connected) return;

        this.socket = io(SERVER_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Room Management
    createRoom(playerName: string): Promise<{ success: boolean; roomId?: string; player?: Player; error?: string }> {
        return new Promise((resolve) => {
            this.socket?.emit('create_room', playerName, (response: any) => {
                resolve(response);
            });
        });
    }

    joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; state?: GameState; error?: string }> {
        return new Promise((resolve) => {
            this.socket?.emit('join_room', { roomId, playerName }, (response: any) => {
                resolve(response);
            });
        });
    }

    startGame(roomId: string): Promise<{ success: boolean; error?: string }> {
        return new Promise((resolve) => {
            this.socket?.emit('start_game', { roomId }, (response: any) => {
                resolve(response);
            });
        });
    }

    drawCard(roomId: string, playerId: string): Promise<{ success: boolean; card?: Card; error?: string }> {
        return new Promise((resolve) => {
            this.socket?.emit('draw_card', { roomId, playerId }, (response: any) => {
                resolve(response);
            });
        });
    }

    selectTarget(roomId: string, playerId: string, targetId: string): void {
        this.socket?.emit('select_target', { roomId, playerId, targetId });
    }

    useQCard(roomId: string, playerId: string, useIt: boolean): void {
        this.socket?.emit('use_q_card', { roomId, playerId, useIt });
    }

    // Event Listeners
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
        this.socket?.on(event, callback as any);
    }

    off(event: string, callback?: Function) {
        if (callback) {
            this.socket?.off(event, callback as any);
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) callbacks.splice(index, 1);
            }
        } else {
            this.socket?.off(event);
            this.listeners.delete(event);
        }
    }

    removeAllListeners() {
        this.listeners.forEach((_, event) => {
            this.socket?.off(event);
        });
        this.listeners.clear();
    }
}

export default new SocketService();
