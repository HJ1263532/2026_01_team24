import { StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import HomeCard from '@/components/common/HomeCard';

export default function MemoryHelperCard() {
    return (
        <HomeCard emoji="💬" title="AI 챗봇" backgroundColor="#EEF2FF">
            <Text style={styles.cardText}>AI와 대화를 나눠보세요!</Text>
            <Text style={styles.subText}>최근 기록을 바탕으로 대화해볼 수 있어요.</Text>

            <Link href="/memory-chat" asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>AI와 대화하러 가기</Text>
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