import { StyleSheet, Text, View } from 'react-native';

export default function HomeHeader() {
    const today = new Date();

    const formattedDate = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });

    return (
        <View style={styles.header}>
            <Text style={styles.greeting}>안녕하세요</Text>
            <Text style={styles.title}>오늘도 천천히 하루를 시작해볼까요?</Text>
            <Text style={styles.date}>{formattedDate}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 26,
        paddingTop: 8,
    },
    greeting: {
        fontSize: 20,
        color: '#64748B',
        marginBottom: 6,
        fontWeight: '600',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 10,
        lineHeight: 38,
    },
    date: {
        fontSize: 17,
        color: '#64748B',
        fontWeight: '500',
    },
});