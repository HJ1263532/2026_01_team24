import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요</Text>
        <Text style={styles.title}>오늘도 함께 기억해볼까요?</Text>
        <Text style={styles.date}>2026년 1월 24일</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 할 일</Text>
        <Text style={styles.cardText}>☐ 아침 약 먹기</Text>
        <Text style={styles.cardText}>☐ 점심 식사하기</Text>
        <Text style={styles.cardText}>☐ 가볍게 산책하기</Text>

        <Link href="/todolist" asChild>
          <Pressable style={styles.smallButton}>
            <Text style={styles.smallButtonText}>할 일 보러가기</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 일정</Text>
        <Text style={styles.cardText}>오후 2:00 치매안심센터 방문</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>기억 도우미</Text>
        <Text style={styles.cardText}>오늘 기억해야 할 일을 천천히 확인해보세요.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI 도우미</Text>
        <Text style={styles.cardText}>무엇을 해야 할지 모르겠다면 물어보세요.</Text>
        <Pressable style={styles.mainButton}>
          <Text style={styles.mainButtonText}>AI 도우미에게 물어보기</Text>
        </Pressable>
      </View>

      <Pressable style={styles.emergencyButton}>
        <Text style={styles.emergencyButtonText}>보호자에게 연락하기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    color: '#64748B',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 18,
    color: '#334155',
    marginBottom: 8,
    lineHeight: 26,
  },
  smallButton: {
    marginTop: 12,
    backgroundColor: '#E0F2FE',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0369A1',
  },
  mainButton: {
    marginTop: 12,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emergencyButton: {
    backgroundColor: '#F97316',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  emergencyButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});