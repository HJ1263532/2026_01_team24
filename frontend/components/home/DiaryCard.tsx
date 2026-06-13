import { StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import HomeCard from '@/components/common/HomeCard';

export default function DiaryCard() {
    return (
        <HomeCard emoji="📝" title="오늘의 일기" backgroundColor="#FFFBEB">
            <Text style={styles.cardText}>오늘 있었던 일을 한 줄로 남겨볼까요?</Text>
            <Text style={styles.subText}>짧게 적어도 괜찮아요.</Text>

            <Link href="/diary" asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>일기 쓰기</Text>
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
        backgroundColor: '#F59E0B',
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