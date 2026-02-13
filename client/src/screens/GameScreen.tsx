import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Alert,
    Modal,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Card } from '../components/Card';
import { NeonButton } from '../components/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import socketService from '../services/socket';
import { Player, GameState, Card as CardType } from '../types/game';

interface GameScreenProps {
    route: any;
    navigation: any;
}

const { width, height } = Dimensions.get('window');
const typo = TYPOGRAPHY;

export const GameScreen: React.FC<GameScreenProps> = ({ route, navigation }) => {
    const { roomId, initialState, currentPlayer } = route.params;
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const onStateUpdate = (newState: GameState) => {
            setGameState(newState);
            if (newState.phase === 'GAME_OVER') {
                setTimeout(() => {
                    navigation.navigate('End', {
                        lastActionDescription: newState.lastActionDescription
                    });
                }, 2000);
            }
        };

        const onCardDrawn = ({ playerId, card, penalty }: { playerId: string; card: CardType; penalty?: string }) => {
            if (penalty) {
                // Display penalty overlay or alert
                console.log(`Penalty for ${playerId}: ${penalty}`);
            }
        };

        socketService.on('game_state_update', onStateUpdate);
        socketService.on('card_drawn', onCardDrawn);

        return () => {
            socketService.off('game_state_update', onStateUpdate);
            socketService.off('card_drawn', onCardDrawn);
        };
    }, []);

    const handleDrawCard = async () => {
        setIsDrawing(true);
        try {
            const response = await socketService.drawCard(roomId, currentPlayer.id);
            if (!response.success) {
                Alert.alert('Error', response.error || 'Failed to draw card');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsDrawing(false);
        }
    };

    const handleSelectTarget = (targetId: string) => {
        socketService.selectTarget(roomId, currentPlayer.id, targetId);
    };

    const handleUseQCard = (useIt: boolean) => {
        socketService.useQCard(roomId, currentPlayer.id, useIt);
    };

    const isMyTurn = gameState.currentTurnPlayerId === currentPlayer.id;
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];

    return (
        <LinearGradient
            colors={[COLORS.darkBg, '#050a1f', COLORS.darkBg]}
            style={styles.container}
        >
            <StatusBar style="light" hidden />

            {/* UI Elements around the table */}
            <View style={styles.header}>
                <View style={styles.directionIndicator}>
                    <Text style={styles.directionText}>
                        {gameState.direction === 1 ? '↻ CLOCKWISE' : '↺ COUNTER-CLOCKWISE'}
                    </Text>
                </View>
                <View style={styles.aceProgress}>
                    <Text style={styles.aceTitle}>ACES FOUND</Text>
                    <Text style={styles.aceCount}>{gameState.acesDrawnCount}/4</Text>
                </View>
            </View>

            <View style={styles.gameContent}>
                {/* Discard Pile (Center) */}
                <View style={styles.centerArea}>
                    {topCard ? (
                        <View style={styles.cardContainer}>
                            <Card card={topCard} size="large" />
                        </View>
                    ) : (
                        <View style={styles.emptyPile}>
                            <Text style={styles.emptyText}>DECK READY</Text>
                        </View>
                    )}

                    <View style={styles.deckInfo}>
                        <Text style={styles.deckCountText}>DECK: {gameState.deckCount} CARDS LEFT</Text>
                    </View>

                    <View style={styles.statusBox}>
                        <Text style={styles.statusText}>{gameState.lastActionDescription}</Text>
                    </View>
                </View>

                {/* Players ring (Simplified list for now) */}
                <View style={styles.playersContainer}>
                    {gameState.players.map((p) => (
                        <View
                            key={p.id}
                            style={[
                                styles.playerCircle,
                                p.id === gameState.currentTurnPlayerId && styles.activePlayer
                            ]}
                        >
                            <Text style={styles.playerChar}>{p.name.charAt(0)}</Text>
                            <Text style={styles.playerCircleName} numberOfLines={1}>{p.name}</Text>
                            {p.cards.length > 0 && (
                                <View style={styles.shieldBadge}>
                                    <Text style={styles.shieldIcon}>🛡️</Text>
                                    {p.cards.length > 1 && (
                                        <Text style={styles.shieldCount}>x{p.cards.length}</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.controls}>
                <NeonButton
                    title={isMyTurn ? "DRAW CARD" : "WAITING..."}
                    onPress={handleDrawCard}
                    disabled={!isMyTurn || isDrawing || gameState.phase === 'GAME_OVER'}
                    variant={isMyTurn ? "primary" : "secondary"}
                    fullWidth={false}
                />

                {gameState.phase === 'GAME_OVER' && (
                    <NeonButton
                        title="BACK TO LOBBY"
                        onPress={() => navigation.navigate('Home')}
                        variant="danger"
                    />
                )}
            </View>

            {/* Target Selection Modal */}
            <Modal
                visible={isMyTurn && gameState.pendingAction === 'WAITING_FOR_TARGET_SELECTION'}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>SELECT A VICTIM! 😈</Text>
                        <Text style={styles.modalSubtitle}>Choose who should drink!</Text>

                        <View style={styles.targetList}>
                            {gameState.players.filter(p => p.id !== currentPlayer.id).map(p => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={styles.targetItem}
                                    onPress={() => handleSelectTarget(p.id)}
                                >
                                    <View style={styles.targetAvatar}>
                                        <Text style={styles.targetChar}>{p.name.charAt(0)}</Text>
                                    </View>
                                    <Text style={styles.targetName}>{p.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Q-Card Decision Modal */}
            <Modal
                visible={isMyTurn && gameState.pendingAction === 'WAITING_FOR_Q_DECISION'}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { borderColor: COLORS.neonYellow }]}>
                        <Text style={[styles.modalTitle, { color: COLORS.neonYellow }]}>USE SHIELD? 🛡️</Text>
                        <Text style={styles.modalSubtitle}>You can spend 1 Q card to skip this turn.</Text>

                        <View style={styles.decisionButtons}>
                            <NeonButton
                                title="USE SHIELD"
                                variant="primary"
                                onPress={() => handleUseQCard(true)}
                                fullWidth={false}
                            />
                            <NeonButton
                                title="DRAW CARD"
                                variant="secondary"
                                onPress={() => handleUseQCard(false)}
                                fullWidth={false}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    directionIndicator: {
        backgroundColor: COLORS.glassBg,
        padding: SPACING.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.neonBlue,
    },
    directionText: {
        color: COLORS.neonBlue,
        fontSize: typo.fontSize.sm,
        fontWeight: 'bold',
    },
    aceProgress: {
        alignItems: 'center',
    },
    aceTitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        letterSpacing: 1,
    },
    aceCount: {
        color: COLORS.neonPink,
        fontSize: 24,
        fontWeight: 'bold',
    },
    gameContent: {
        flex: 1,
        flexDirection: 'row',
    },
    centerArea: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        transform: [{ scale: 1.2 }],
        shadowColor: COLORS.neonPink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    emptyPile: {
        width: 100,
        height: 150,
        borderWidth: 2,
        borderColor: COLORS.textMuted,
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    statusBox: {
        marginTop: SPACING.xl,
        padding: SPACING.md,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.neonPurple,
        maxWidth: '80%',
    },
    statusText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.md,
        textAlign: 'center',
    },
    playersContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: SPACING.md,
        paddingRight: SPACING.lg,
    },
    playerCircle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        padding: SPACING.sm,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activePlayer: {
        borderColor: COLORS.neonGreen,
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    playerChar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.neonBlue,
        color: COLORS.darkBg,
        textAlign: 'center',
        lineHeight: 30,
        fontWeight: 'bold',
        marginRight: SPACING.sm,
    },
    playerCircleName: {
        color: COLORS.textPrimary,
        fontSize: 12,
        flex: 1,
    },
    shieldBadge: {
        backgroundColor: COLORS.neonYellow,
        borderRadius: 12,
        paddingHorizontal: 6,
        height: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -5,
        right: -5,
        elevation: 5,
        shadowColor: COLORS.neonYellow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    shieldIcon: {
        fontSize: 12,
    },
    shieldCount: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.darkBg,
        marginLeft: 2,
    },
    controls: {
        padding: SPACING.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.lg,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: SPACING.xl,
        borderWidth: 2,
        borderColor: COLORS.neonPink,
        alignItems: 'center',
    },
    modalTitle: {
        color: COLORS.neonPink,
        fontSize: TYPOGRAPHY.fontSize.xxl,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    modalSubtitle: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSize.md,
        marginBottom: SPACING.xl,
    },
    targetList: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    targetItem: {
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        width: 100,
    },
    targetAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.neonBlue,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    targetChar: {
        color: COLORS.darkBg,
        fontSize: TYPOGRAPHY.fontSize.xl,
        fontWeight: 'bold',
    },
    targetName: {
        color: COLORS.textPrimary,
        fontSize: 12,
        textAlign: 'center',
    },
    deckInfo: {
        marginTop: SPACING.md,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderRadius: 20,
    },
    deckCountText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    decisionButtons: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginTop: SPACING.md,
    },
});
