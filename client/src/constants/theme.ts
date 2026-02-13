// Neon/Cyberpunk Color Palette
export const COLORS = {
    // Primary Neon Colors
    neonPink: '#FF006E',
    neonBlue: '#00F5FF',
    neonPurple: '#B967FF',
    neonGreen: '#05FFA1',
    neonYellow: '#FFEA00',

    // Background
    darkBg: '#0A0E27',
    cardBg: '#1A1F3A',
    glassBg: 'rgba(26, 31, 58, 0.7)',

    // Suits
    spades: '#00F5FF',
    hearts: '#FF006E',
    diamonds: '#FFEA00',
    clubs: '#05FFA1',

    // UI States
    success: '#05FFA1',
    warning: '#FFEA00',
    danger: '#FF006E',
    info: '#00F5FF',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B8D4',
    textMuted: '#6B7280',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    fontFamily: {
        regular: 'Roboto_400Regular',
        medium: 'Roboto_500Medium',
        bold: 'Roboto_700Bold',
    },
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },
};

export const SHADOWS = {
    neonGlow: {
        shadowColor: COLORS.neonPink,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
};
