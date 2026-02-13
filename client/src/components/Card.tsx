import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card as CardType } from '../types/game';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

interface CardProps {
    card: CardType;
    faceUp?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ card, faceUp = true, size = 'medium' }) => {
    const getSuitColor = () => {
        switch (card.suit) {
            case 'SPADES':
                return COLORS.spades;
            case 'HEARTS':
                return COLORS.hearts;
            case 'DIAMONDS':
                return COLORS.diamonds;
            case 'CLUBS':
                return COLORS.clubs;
            default:
                return COLORS.textPrimary;
        }
    };

    const getSuitSymbol = () => {
        switch (card.suit) {
            case 'SPADES':
                return '♠';
            case 'HEARTS':
                return '♥';
            case 'DIAMONDS':
                return '♦';
            case 'CLUBS':
                return '♣';
            default:
                return '';
        }
    };

    const getCardSize = () => {
        switch (size) {
            case 'small':
                return { width: 60, height: 90 };
            case 'medium':
                return { width: 80, height: 120 };
            case 'large':
                return { width: 100, height: 150 };
            default:
                return { width: 80, height: 120 };
        }
    };

    const cardSize = getCardSize();
    const suitColor = getSuitColor();

    if (!faceUp) {
        return (
            <LinearGradient
                colors={[COLORS.neonPurple, COLORS.neonPink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, cardSize]}
            >
                <View style={styles.cardBack}>
                    <Text style={styles.cardBackText}>🎴</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.card, cardSize, styles.cardFront]}>
            <View style={styles.cardContent}>
                <Text style={[styles.rank, { color: suitColor }]}>{card.rank}</Text>
                <Text style={[styles.suit, { color: suitColor }]}>{getSuitSymbol()}</Text>
            </View>
            <View style={[styles.cardContent, styles.cardContentBottom]}>
                <Text style={[styles.suit, { color: suitColor }]}>{getSuitSymbol()}</Text>
                <Text style={[styles.rank, { color: suitColor }]}>{card.rank}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cardFront: {
        backgroundColor: '#FFFFFF',
        padding: SPACING.sm,
    },
    cardBack: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBackText: {
        fontSize: 40,
    },
    cardContent: {
        alignItems: 'center',
    },
    cardContentBottom: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.sm,
        transform: [{ rotate: '180deg' }],
    },
    rank: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    suit: {
        fontSize: 32,
        marginTop: SPACING.xs,
    },
});
