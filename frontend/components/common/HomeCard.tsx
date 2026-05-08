import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type HomeCardProps = {
    emoji?: string;
    title: string;
    children: ReactNode;
    backgroundColor?: string;
};

export default function HomeCard({
    emoji,
    title,
    children,
    backgroundColor = '#FFFFFF',
}: HomeCardProps) {
    return (
        <View style={[styles.card, { backgroundColor }]}>
            {emoji && <Text style={styles.emoji}>{emoji}</Text>}
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 22,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    emoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    title: {
        fontSize: 23,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 14,
    },
});