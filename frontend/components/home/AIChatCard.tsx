import { StyleSheet, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import HomeCard from '@/components/common/HomeCard';

export default function MemoryHelperCard() {
    return (
        <HomeCard emoji="💬" title="기억 도우미" backgroundColor="#EEF2FF">
            <Text style={styles.cardText}>기억이 잘 나지 않을 때 눌러보세요.</Text>
            <Text style={styles.subText}>최근 기록을 바탕으로 대화해볼 수 있어요.</Text>

            <Link href="/memory-chat" asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>기억 도우미 열기</Text>
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