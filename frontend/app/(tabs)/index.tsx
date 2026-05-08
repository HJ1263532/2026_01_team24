import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 상단 인사 영역 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요</Text>
        <Text style={styles.title}>오늘도 천천히 하루를 시작해볼까요?</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* 오늘의 생활 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 생활</Text>

        <Text style={styles.sectionTitle}>해야 할 일</Text>
        <Text style={styles.cardText}>☐ 아침 약 먹기</Text>
        <Text style={styles.cardText}>☐ 물 마시기</Text>
        <Text style={styles.cardText}>☐ 가볍게 산책하기</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>오늘의 일정</Text>
        <Text style={styles.cardText}>오후 2:00 치매안심센터 방문</Text>

        <Link href="/todolist" asChild>
          <Pressable style={styles.smallButton}>
            <Text style={styles.smallButtonText}>전체 보기</Text>
          </Pressable>
        </Link>
      </View>

      {/* 일기 작성 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 일기</Text>
        <Text style={styles.cardText}>오늘 있었던 일을 써볼까요?</Text>
        <Text style={styles.subText}>짧게 적어도 괜찮아요.</Text>

        <Link href="/diary" asChild>
          <Pressable style={styles.mainButton}>
            <Text style={styles.mainButtonText}>일기 쓰기</Text>
          </Pressable>
        </Link>
      </View>

      {/* 기억 도우미 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI와 대화하기</Text>
        <Text style={styles.cardText}>AI와 대화하면서 오늘의 감정을 이야기해보세요!</Text>
        <Text style={styles.subText}>최근 기록을 바탕으로 대화해볼 수 있어요.</Text>

        <Link href="/memory-chat" asChild>
          <Pressable style={styles.memoryButton}>
            <Text style={styles.memoryButtonText}>대화하러 가기</Text>
          </Pressable>
        </Link>
      </View>

      {/* 오늘의 기분 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>오늘의 기분</Text>
        <Text style={styles.cardText}>오늘 기분은 어떠세요?</Text>

        <View style={styles.moodContainer}>
          {['좋아요', '보통이에요', '불안해요'].map((mood) => (
            <Pressable
              key={mood}
              style={[
                styles.moodButton,
                selectedMood === mood && styles.selectedMoodButton,
              ]}
              onPress={() => setSelectedMood(mood)}
            >
              <Text
                style={[
                  styles.moodButtonText,
                  selectedMood === mood && styles.selectedMoodButtonText,
                ]}
              >
                {mood}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
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
    paddingBottom: 110,
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
    lineHeight: 36,
  },
  date: {
    fontSize: 16,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 18,
    color: '#334155',
    marginBottom: 8,
    lineHeight: 26,
  },
  subText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  smallButton: {
    marginTop: 14,
    backgroundColor: '#E0F2FE',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  smallButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0369A1',
  },
  mainButton: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  memoryButton: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  memoryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4338CA',
  },
  moodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  moodButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  selectedMoodButton: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  moodButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  selectedMoodButtonText: {
    color: '#15803D',
    fontWeight: '700',
  },
});