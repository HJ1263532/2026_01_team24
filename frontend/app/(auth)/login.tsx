import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', emoji: '🌿', title: '오늘의 일기', subtitle: '하루를 기록하고\n소중한 순간을 간직해요' },
  { id: '2', emoji: '💬', title: 'AI와 채팅', subtitle: '대화를 나누며\n하루에 대해 이야기해보아요' },
  { id: '3', emoji: '📅', title: '일정 관리', subtitle: '중요한 날을 기록하고\n놓치지 않게 알려드려요' },
];

export default function LoginScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync('token');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();
      console.log('API 응답:', data);

      if (data.token) {
        await SecureStore.setItemAsync('token', data.token);
        router.replace('/(tabs)');
      }

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('이미 로그인 진행 중이에요');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services가 필요해요');
      } else {
        console.log('로그인 오류:', error);
        Alert.alert('로그인 실패', '다시 시도해주세요');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.buttonText}>{loading ? '로그인 중...' : '구글로 시작하기'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  slide: { width, flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 16 },
  emoji: { fontSize: 72, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D5A3D', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B8F71', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8DBC9' },
  dotActive: { backgroundColor: '#2D5A3D', width: 20 },
  bottomSection: { paddingHorizontal: 32, paddingBottom: 60 },
  button: { backgroundColor: '#2D5A3D', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 10 },
  googleIcon: { color: '#F5F0E8', fontSize: 18, fontWeight: '800' },
  buttonText: { color: '#F5F0E8', fontSize: 16, fontWeight: '600' },
});