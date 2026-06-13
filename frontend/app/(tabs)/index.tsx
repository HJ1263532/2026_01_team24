import { ScrollView, StyleSheet } from 'react-native';

import HomeHeader from '@/components/home/HomeHeader';
import TodayLifeCard from '@/components/home/TodayLifeCard';
import DiaryCard from '@/components/home/DiaryCard';
import MemoryHelperCard from '@/components/home/AIChatCard';
import MoodCheckCard from '@/components/home/MoodCheckCard';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HomeHeader />
      <TodayLifeCard />
      <DiaryCard />
      <MemoryHelperCard />
      <MoodCheckCard />
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
});