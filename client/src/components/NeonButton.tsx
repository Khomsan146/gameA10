import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface NeonButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    fullWidth?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    fullWidth = false,
}) => {
    const getColors = () => {
        switch (variant) {
            case 'primary':
                return [COLORS.neonPink, COLORS.neonPurple];
            case 'secondary':
                return [COLORS.neonBlue, COLORS.neonGreen];
            case 'danger':
                return [COLORS.danger, '#FF4500'];
            default:
                return [COLORS.neonPink, COLORS.neonPurple];
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, fullWidth && styles.fullWidth, disabled && styles.disabled]}
        >
            <LinearGradient
                colors={disabled ? ['#4A5568', '#2D3748'] : getColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <Text style={styles.buttonText}>{title}</Text>
            </LinearGradient>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: COLORS.neonPink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 8,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
        shadowOpacity: 0,
    },
    gradient: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSize.lg,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
