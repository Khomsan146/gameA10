import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    Dimensions,
    Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { NeonButton } from '../components/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import socketService from '../services/socket';
import { Player, GameState } from '../types/game';

interface LobbyScreenProps {
    route: any;
    navigation: any;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ route, navigation }) => {
    const { roomId, player, isHost } = route.params;
    const [players, setPlayers] = useState<Player[]>([player]);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        // Listen for new players
        const onPlayerJoined = (updatedPlayers: Player[]) => {
            setPlayers(updatedPlayers);
        };

        const onGameStarted = (gameState: GameState) => {
            navigation.navigate('Game', {
                roomId,
                initialState: gameState,
                currentPlayer: player,
            });
        };

        socketService.on('player_joined', onPlayerJoined);
        socketService.on('game_started', onGameStarted);

        return () => {
            socketService.off('player_joined', onPlayerJoined);
            socketService.off('game_started', onGameStarted);
        };
    }, [roomId, navigation, player]);

    const handleStartGame = async () => {
        if (players.length < 2) {
            Alert.alert('Not enough players', 'Wait for at least one more friend to join!');
            return;
        }

        setIsStarting(true);
        try {
            const response = await socketService.startGame(roomId);
            if (!response.success) {
                Alert.alert('Error', response.error || 'Failed to start game');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setIsStarting(false);
        }
    };

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `Join my Party Card game! Code: ${roomId}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const renderPlayer = ({ item }: { item: Player }) => (
        <View style={styles.playerItem}>
            <View style={[styles.avatarPlaceholder, { borderColor: item.isHost ? COLORS.neonPink : COLORS.neonBlue }]}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.playerName}>
                {item.name} {item.isHost ? '(Host)' : ''}
            </Text>
            {item.id === player.id && <View style={styles.youBadge}><Text style={styles.youText}>YOU</Text></View>}
        </View>
    );

    return (
        <LinearGradient
            colors={[COLORS.darkBg, '#0f172a', COLORS.darkBg]}
            style={styles.container}
        >
            <StatusBar style="light" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.roomCodeLabel}>ROOM CODE</Text>
                    <View style={styles.roomCodeContainer}>
                        <Text style={styles.roomCodeText}>{roomId}</Text>
                    </View>
                    <NeonButton
                        title="SHARE CODE"
                        onPress={handleShareCode}
                        variant="secondary"
                        fullWidth={false}
                    />
                </View>

                <View style={styles.playersListContainer}>
                    <Text style={styles.listTitle}>PLAYERS ({players.length})</Text>
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPlayer}
                        contentContainerStyle={styles.listContent}
                    />
                </View>

                <View style={styles.footer}>
                    {isHost ? (
                        <NeonButton
                            title="START GAME"
                            onPress={handleStartGame}
                            disabled={isStarting || players.length < 2}
                            fullWidth
                        />
                    ) : (
                        <View style={styles.waitingContainer}>
                            <Text style={styles.waitingText}>Waiting for host to start...</Text>
                        </View>
                    )}
                    <NeonButton
                        title="LEAVE ROOM"
                        onPress={() => navigation.goBack()}
                        variant="danger"
                        fullWidth
                        disabled={isStarting}
                    />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
        flexDirection: 'row',
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roomCodeLabel: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSize.sm,
        letterSpacing: 2,
        marginBottom: SPACING.xs,
    },
    roomCodeContainer: {
        backgroundColor: COLORS.cardBg,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.neonPurple,
        marginBottom: SPACING.md,
        minWidth: 150,
        alignItems: 'center',
    },
    roomCodeText: {
        color: COLORS.neonPurple,
        fontSize: 48,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        letterSpacing: 8,
    },
    playersListContainer: {
        flex: 1.5,
        backgroundColor: COLORS.glassBg,
        borderRadius: 20,
        padding: SPACING.md,
        marginHorizontal: SPACING.md,
    },
    listTitle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontFamily: TYPOGRAPHY.fontFamily.bold,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: SPACING.md,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.sm,
        borderRadius: 12,
        marginBottom: SPACING.sm,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.md,
        fontWeight: 'bold',
    },
    playerName: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.md,
        flex: 1,
    },
    youBadge: {
        backgroundColor: COLORS.neonGreen,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    youText: {
        color: COLORS.darkBg,
        fontSize: 10,
        fontWeight: 'bold',
    },
    footer: {
        flex: 1,
        justifyContent: 'center',
        gap: SPACING.md,
    },
    waitingContainer: {
        padding: SPACING.md,
        alignItems: 'center',
    },
    waitingText: {
        color: COLORS.neonBlue,
        fontSize: TYPOGRAPHY.fontSize.md,
        fontStyle: 'italic',
    },
});
