import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { NeonButton } from '../components/NeonButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface EndScreenProps {
    route: any;
    navigation: any;
}

const { width } = Dimensions.get('window');

export const EndScreen: React.FC<EndScreenProps> = ({ route, navigation }) => {
    const { lastActionDescription } = route.params;

    return (
        <LinearGradient
            colors={['#000000', '#1a0033', '#000000']}
            style={styles.container}
        >
            <StatusBar style="light" hidden />

            <View style={styles.content}>
                <Text style={styles.gameOverText}>GAME OVER</Text>

                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>{lastActionDescription}</Text>
                </View>

                <Text style={styles.cheersText}>🍻 CHEERS! 🍻</Text>

                <View style={styles.footer}>
                    <NeonButton
                        title="PLAY AGAIN"
                        onPress={() => navigation.navigate('Home')}
                        fullWidth
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xxl,
    },
    gameOverText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: COLORS.neonPink,
        textShadowColor: COLORS.neonPink,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
        letterSpacing: 10,
        marginBottom: SPACING.xl,
    },
    resultBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.xl,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: COLORS.neonPurple,
        maxWidth: width * 0.7,
        marginBottom: SPACING.xxl,
    },
    resultText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.xl,
        textAlign: 'center',
        lineHeight: 32,
    },
    cheersText: {
        color: COLORS.neonYellow,
        fontSize: TYPOGRAPHY.fontSize.xxl,
        fontWeight: 'bold',
        marginBottom: SPACING.xxl,
    },
    footer: {
        width: 300,
    },
});
