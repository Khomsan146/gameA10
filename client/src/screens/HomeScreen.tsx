import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { NeonButton } from '../components/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import socketService from '../services/socket';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        socketService.connect();

        return () => {
            socketService.removeAllListeners();
        };
    }, []);

    const handleCreateRoom = async () => {
        if (!playerName.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setIsConnecting(true);
        try {
            const response = await socketService.createRoom(playerName.trim());

            if (response.success && response.roomId && response.player) {
                navigation.navigate('Lobby', {
                    roomId: response.roomId,
                    player: response.player,
                    isHost: true,
                });
            } else {
                Alert.alert('Error', response.error || 'Failed to create room');
            }
        } catch (error) {
            Alert.alert('Error', 'Connection failed. Please try again.');
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!playerName.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        if (!roomCode.trim()) {
            Alert.alert('Error', 'Please enter room code');
            return;
        }

        setIsConnecting(true);
        try {
            const response = await socketService.joinRoom(roomCode.trim().toUpperCase(), playerName.trim());

            if (response.success && response.state) {
                const currentPlayer = response.state.players.find(p => p.name === playerName.trim());

                navigation.navigate('Lobby', {
                    roomId: response.state.roomId,
                    player: currentPlayer,
                    isHost: false,
                });
            } else {
                Alert.alert('Error', response.error || 'Failed to join room');
            }
        } catch (error) {
            Alert.alert('Error', 'Connection failed. Please try again.');
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.darkBg, '#1a0033', COLORS.darkBg]}
            style={styles.container}
        >
            <StatusBar style="light" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>PARTY CARD</Text>
                    <Text style={styles.subtitle}>Real-time Multiplayer Drinking Game</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor={COLORS.textMuted}
                        value={playerName}
                        onChangeText={setPlayerName}
                        maxLength={20}
                        autoCapitalize="words"
                    />

                    <View style={styles.buttonContainer}>
                        <NeonButton
                            title="Create Room"
                            onPress={handleCreateRoom}
                            disabled={isConnecting}
                            fullWidth
                        />
                    </View>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter room code"
                        placeholderTextColor={COLORS.textMuted}
                        value={roomCode}
                        onChangeText={(text) => setRoomCode(text.toUpperCase())}
                        maxLength={4}
                        autoCapitalize="characters"
                    />

                    <View style={styles.buttonContainer}>
                        <NeonButton
                            title="Join Room"
                            onPress={handleJoinRoom}
                            variant="secondary"
                            disabled={isConnecting}
                            fullWidth
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>🎴 Landscape Mode Only 🎴</Text>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.xxxl,
        fontWeight: 'bold',
        color: COLORS.neonPink,
        textShadowColor: COLORS.neonPink,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        letterSpacing: 4,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSize.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        letterSpacing: 1,
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    input: {
        backgroundColor: COLORS.cardBg,
        borderWidth: 2,
        borderColor: COLORS.neonBlue,
        borderRadius: 12,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        fontSize: TYPOGRAPHY.fontSize.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    buttonContainer: {
        marginBottom: SPACING.lg,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.textMuted,
    },
    dividerText: {
        color: COLORS.textSecondary,
        marginHorizontal: SPACING.md,
        fontSize: TYPOGRAPHY.fontSize.md,
    },
    footer: {
        position: 'absolute',
        bottom: SPACING.lg,
    },
    footerText: {
        color: COLORS.textMuted,
        fontSize: TYPOGRAPHY.fontSize.sm,
    },
});
