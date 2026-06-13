import { StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import HomeCard from '@/components/common/HomeCard';

export default function AIChatCard() {
    return (
        <HomeCard emoji="🤖" title="AI 기억 도우미" backgroundColor="#EEF2FF">
            <Text style={styles.cardText}>
                오늘의 할 일과 일기를 바탕으로 대화를 도와드려요.
            </Text>
            <Text style={styles.subText}>
                궁금한 일이나 기억하고 싶은 일을 편하게 물어보세요.
            </Text>

            <Link href="/chat" asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>AI와 대화하기</Text>
                </Pressable>
            </Link>
        </HomeCard>
    );
}

const styles = StyleSheet.create({
    cardText: {
        fontSize: 18,
        color: '#334155',
        marginBottom: 8,
        lineHeight: 28,
    },
    subText: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 8,
        lineHeight: 24,
    },
    button: {
        marginTop: 14,
        backgroundColor: '#6366F1',
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});