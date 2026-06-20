import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, Image, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

type Mood = 'happy' | 'sad' | 'angry' | 'tired' | 'calm';

interface ImageAsset {
    uri: string;
    name?: string;
    type?: string;
}

interface Diary {
    _id: string;
    userId: string;
    title: string;
    content: string;
    mood: Mood;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

async function apiFetch<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
    };

    console.log('API 요청 URL:', `${BASE_URL}${path}`);
    console.log('Authorization 있음?:', !!token);

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    const text = await res.text();
    let data: any = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    console.log('API 상태:', res.status);
    console.log('API 응답:', data);

    if (!res.ok) {
        throw new Error(
            data?.error ??
            data?.message ??
            `요청 실패: ${res.status}`
        );
    }

    return data as T;
}

const createDiary = (
    token: string,
    params: { title: string; content: string; mood: Mood; images?: ImageAsset[] }
) => {
    const form = new FormData();
    form.append('title', params.title);
    form.append('content', params.content);
    form.append('mood', params.mood);
    params.images?.forEach((img) =>
        form.append('images', { uri: img.uri, name: img.name ?? 'photo.jpg', type: img.type ?? 'image/jpeg' } as unknown as Blob)
    );
    return apiFetch<Diary>('/api/diary', token, { method: 'POST', body: form });
};

const MOODS: { value: Mood; label: string }[] = [
    { value: 'happy', label: '😊 행복' },
    { value: 'sad', label: '😢 슬픔' },
    { value: 'angry', label: '😠 화남' },
    { value: 'tired', label: '😴 피곤' },
    { value: 'calm', label: '😌 평온' },
];

export default function DiaryCreateScreen() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<Mood | null>(null);
    const [images, setImages] = useState<ImageAsset[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다');

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const selected: ImageAsset[] = result.assets.map((a) => ({
                uri: a.uri,
                name: a.fileName ?? `photo_${Date.now()}.jpg`,
                type: a.mimeType ?? 'image/jpeg',
            }));
            setImages((prev) => [...prev, ...selected].slice(0, 5));
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) return Alert.alert('입력 오류', '제목을 입력해주세요');
        if (!content.trim()) return Alert.alert('입력 오류', '내용을 입력해주세요');
        if (!mood) return Alert.alert('입력 오류', '기분을 선택해주세요');

        const token = await SecureStore.getItemAsync('token');

        console.log('저장 요청 BASE_URL:', BASE_URL);
        console.log('저장 요청 token 있음?:', !!token);
        console.log('token 앞부분:', token ? token.slice(0, 20) : null);

        if (!token) {
            Alert.alert('로그인 오류', '저장된 로그인 토큰이 없습니다. 다시 로그인해주세요.');
            return router.replace('/(auth)/login');
        }
        setLoading(true);
        try {
            await createDiary(token, { title: title.trim(), content: content.trim(), mood, images });
            router.back();
        } catch (e) {
            Alert.alert('오류', (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>제목</Text>
            <TextInput
                style={styles.input}
                placeholder="제목을 입력하세요"
                placeholderTextColor="#aaa"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
            />

            <Text style={styles.label}>내용</Text>
            <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="오늘 하루를 기록해보세요"
                placeholderTextColor="#aaa"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
            />

            <Text style={styles.label}>기분</Text>
            <View style={styles.moodRow}>
                {MOODS.map((m) => (
                    <TouchableOpacity
                        key={m.value}
                        style={[styles.moodBtn, mood === m.value && styles.moodBtnActive]}
                        onPress={() => setMood(m.value)}
                    >
                        <Text style={[styles.moodText, mood === m.value && styles.moodTextActive]}>
                            {m.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>이미지 (최대 5장)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img) => (
                    <View key={img.uri} style={styles.imageWrapper}>
                        <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => setImages((prev) => prev.filter((i) => i.uri !== img.uri))}
                        >
                            <Text style={styles.removeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {images.length < 5 && (
                    <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                        <Text style={styles.addImageText}>+ 추가</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#F5F0E8" />
                    : <Text style={styles.submitBtnText}>저장하기</Text>
                }
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F0E8', padding: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#2D5A3D', marginTop: 20, marginBottom: 8 },
    input: {
        borderWidth: 1, borderColor: '#C8DBC9', borderRadius: 12,
        padding: 14, fontSize: 15, color: '#2D5A3D', backgroundColor: '#fff',
    },
    textarea: { height: 160 },
    moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    moodBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#C8DBC9', backgroundColor: '#fff',
    },
    moodBtnActive: { borderColor: '#2D5A3D', backgroundColor: '#2D5A3D' },
    moodText: { fontSize: 14, color: '#6B8F71' },
    moodTextActive: { color: '#F5F0E8', fontWeight: '600' },
    imageWrapper: { position: 'relative', marginRight: 10 },
    thumbnail: { width: 80, height: 80, borderRadius: 12 },
    removeBtn: {
        position: 'absolute', top: -6, right: -6,
        backgroundColor: '#ff4d4d', borderRadius: 10,
        width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
    },
    removeBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    addImageBtn: {
        width: 80, height: 80, borderRadius: 12,
        borderWidth: 1.5, borderColor: '#C8DBC9', borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
    },
    addImageText: { fontSize: 13, color: '#6B8F71' },
    submitBtn: {
        marginTop: 32, marginBottom: 48, backgroundColor: '#2D5A3D',
        padding: 16, borderRadius: 14, alignItems: 'center',
    },
    submitBtnText: { color: '#F5F0E8', fontSize: 16, fontWeight: '700' },
});