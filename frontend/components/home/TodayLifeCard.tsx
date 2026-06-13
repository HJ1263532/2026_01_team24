import { StyleSheet, Text, Pressable, View } from 'react-native';
import { Link } from 'expo-router';
import HomeCard from '@/components/common/HomeCard';

export default function TodayLifeCard() {
    return (
        <HomeCard emoji="☀️" title="오늘의 생활" backgroundColor="#EFF6FF">
            <Text style={styles.sectionTitle}>해야 할 일</Text>
            <Text style={styles.cardText}>☐ 아침 약 먹기</Text>
            <Text style={styles.cardText}>☐ 물 마시기</Text>
            <Text style={styles.cardText}>☐ 가볍게 산책하기</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>오늘의 일정</Text>
            <Text style={styles.cardText}>오후 2:00 치매안심센터 방문</Text>

            <Link href="/todolist" asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>전체 보기</Text>
                </Pressable>
            </Link>
        </HomeCard>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#334155',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 18,
        color: '#334155',
        marginBottom: 8,
        lineHeight: 28,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(100, 116, 139, 0.2)',
        marginVertical: 16,
    },
    button: {
        marginTop: 16,
        backgroundColor: '#2563EB',
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