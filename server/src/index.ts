import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from './managers/RoomManager';
import { Player, GameState, Card } from './managers/types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const roomManager = new RoomManager();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (playerName: string, callback) => {
        const newPlayer: Player = {
            id: uuidv4(),
            name: playerName,
            socketId: socket.id,
            avatarId: '1', // Default avatar
            isHost: true,
            isConnected: true,
            cards: [],
            sipsConsumed: 0
        };

        // Logic fix: createRoom returns the ID
        const roomId = roomManager.createRoom(newPlayer);

        socket.join(roomId);
        callback({ success: true, roomId, player: newPlayer });
        console.log(`Room created: ${roomId} by ${playerName}`);
    });

    socket.on('join_room', ({ roomId, playerName }, callback) => {
        const newPlayer: Player = {
            id: uuidv4(),
            name: playerName,
            socketId: socket.id,
            avatarId: '2', // Default avatar
            isHost: false,
            isConnected: true,
            cards: [],
            sipsConsumed: 0
        };

        const success = roomManager.joinRoom(roomId, newPlayer);

        if (success) {
            socket.join(roomId);
            const game = roomManager.getGame(roomId);
            // Notify others in the room
            socket.to(roomId).emit('player_joined', newPlayer);

            // Return success and current state to the joiner
            callback({ success: true, state: game?.getState() });
            console.log(`${playerName} joined room ${roomId}`);
        } else {
            callback({ success: false, error: "Cannot join room (Room not found or game started)" });
        }
    });

    socket.on('start_game', ({ roomId }, callback) => {
        const game = roomManager.getGame(roomId);
        if (game) {
            try {
                game.startGame();
                io.to(roomId).emit('game_started', game.getState());
                if (callback) callback({ success: true });
            } catch (e: any) {
                console.error(e);
                if (callback) callback({ success: false, error: e.message });
            }
        } else {
            if (callback) callback({ success: false, error: "Room not found" });
        }
    });

    socket.on('draw_card', ({ roomId, playerId }, callback) => {
        const game = roomManager.getGame(roomId);
        if (game) {
            try {
                const result = game.drawCard(playerId);

                // 1. Broadcast global state update
                io.to(roomId).emit('game_state_update', game.getState());

                // 2. Broadcast specific event for animation triggers
                io.to(roomId).emit('card_drawn', {
                    playerId,
                    card: result.card,
                    penalty: result.penalty
                });

                callback({ success: true, card: result.card });
            } catch (e: any) {
                callback({ success: false, error: e.message });
            }
        }
    });

    socket.on('select_target', ({ roomId, playerId, targetId }) => {
        const game = roomManager.getGame(roomId);
        if (game) {
            game.selectTarget(playerId, targetId);
            io.to(roomId).emit('game_state_update', game.getState());
        }
    });

    socket.on('use_q_card', ({ roomId, playerId, useIt }) => {
        const game = roomManager.getGame(roomId);
        if (game) {
            game.useQCard(playerId, useIt);
            io.to(roomId).emit('game_state_update', game.getState());
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // In a real app, we'd map socketId -> roomId and handle player disconnect state
    });
});

app.get('/health', (req, res) => {
    res.send('Server is running healthy!');
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
