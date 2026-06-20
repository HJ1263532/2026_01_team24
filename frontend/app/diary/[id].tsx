import { useEffect, useLayoutEffect, useState } from 'react';
import {
    View, Text, TextInput, ScrollView, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

type Mood = 'happy' | 'sad' | 'angry' | 'tired' | 'calm';

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

async function apiFetch<T>(path: string, options: RequestInit = {}, token: string): Promise<T> {
    const headers: HeadersInit = {
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
    };
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? '알 수 없는 오류가 발생했습니다');
    return data as T;
}

const getDiary = (token: string, id: string) =>
    apiFetch<Diary>(`/api/diary/${id}`, { method: 'GET' }, token);

const updateDiary = (token: string, id: string, fields: Partial<Pick<Diary, 'title' | 'content' | 'mood'>>) =>
    apiFetch<Diary>(`/api/diary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
    }, token);

const deleteDiary = (token: string, id: string) =>
    apiFetch<{ message: string }>(`/api/diary/${id}`, { method: 'DELETE' }, token);

const MOODS: { value: Mood; label: string }[] = [
    { value: 'happy', label: '😊 행복' },
    { value: 'sad', label: '😢 슬픔' },
    { value: 'angry', label: '😠 화남' },
    { value: 'tired', label: '😴 피곤' },
    { value: 'calm', label: '😌 평온' },
];

export default function DiaryDetailScreen() {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const navigation = useNavigation();

    const [diary, setDiary] = useState<Diary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<Mood>('calm');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                !isEditing ? (
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text style={styles.navBtn}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete}>
                            <Text style={[styles.navBtn, { color: '#ff4d4d' }]}>삭제</Text>
                        </TouchableOpacity>
                    </View>
                ) : null,
        });
    }, [isEditing, id]);

    useEffect(() => {
        const load = async () => {
            if (!id || id === 'undefined') {
                console.log('잘못된 diary id:', id);
                setLoading(false);
                router.replace('/diary/create');
                return;
            }

            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                setLoading(false);
                return router.replace('/(auth)/login');
            }

            try {
                const data = await getDiary(token, id);
                setDiary(data);
                setTitle(data.title);
                setContent(data.content);
                setMood(data.mood);
            } catch (e) {
                Alert.alert('오류', (e as Error).message);
                router.back();
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        if (!id || id === 'undefined') {
            return Alert.alert('오류', '일기 ID가 없습니다.');
        }

        if (!title.trim()) return Alert.alert('입력 오류', '제목을 입력해주세요');
        if (!content.trim()) return Alert.alert('입력 오류', '내용을 입력해주세요');

        const fields: Partial<Pick<Diary, 'title' | 'content' | 'mood'>> = {};
        if (title.trim() !== diary?.title) fields.title = title.trim();
        if (content.trim() !== diary?.content) fields.content = content.trim();
        if (mood !== diary?.mood) fields.mood = mood;
        if (Object.keys(fields).length === 0) return setIsEditing(false);

        const token = await SecureStore.getItemAsync('token');
        if (!token) return router.replace('/(auth)/login');

        setSaving(true);
        try {
            const updated = await updateDiary(token, id, fields);
            setDiary(updated);
            setIsEditing(false);
        } catch (e) {
            Alert.alert('오류', (e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('삭제 확인', '이 일기를 삭제할까요?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제', style: 'destructive',
                onPress: async () => {
                    if (!id || id === 'undefined') {
                        return Alert.alert('오류', '일기 ID가 없습니다.');
                    }

                    const token = await SecureStore.getItemAsync('token');
                    if (!token) return router.replace('/(auth)/login');
                    try {
                        await deleteDiary(token, id);
                        router.back();
                    } catch (e) {
                        Alert.alert('오류', (e as Error).message);
                    }
                },
            },
        ]);
    };

    if (loading) return <ActivityIndicator size="large" color="#2D5A3D" style={styles.loader} />;
    if (!diary) return null;

    if (isEditing) {
        return (
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>제목</Text>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={100} placeholderTextColor="#aaa" />

                <Text style={styles.label}>내용</Text>
                <TextInput
                    style={[styles.input, styles.textarea]}
                    value={content} onChangeText={setContent}
                    multiline textAlignVertical="top" placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>기분</Text>
                <View style={styles.moodRow}>
                    {MOODS.map((m) => (
                        <TouchableOpacity
                            key={m.value}
                            style={[styles.moodBtn, mood === m.value && styles.moodBtnActive]}
                            onPress={() => setMood(m.value)}
                        >
                            <Text style={[styles.moodText, mood === m.value && styles.moodTextActive]}>{m.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.editActions}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => {
                            setTitle(diary.title);
                            setContent(diary.content);
                            setMood(diary.mood);
                            setIsEditing(false);
                        }}
                    >
                        <Text style={styles.cancelBtnText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator color="#F5F0E8" /> : <Text style={styles.saveBtnText}>저장</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.metaRow}>
                <Text style={styles.moodEmoji}>{MOODS.find((m) => m.value === diary.mood)?.label}</Text>
                <Text style={styles.date}>
                    {new Date(diary.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
            </View>
            <Text style={styles.title}>{diary.title}</Text>
            <Text style={styles.content}>{diary.content}</Text>
            {diary.imageUrls.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20 }}>
                    {diary.imageUrls.map((url) => (
                        <Image key={url} source={{ uri: `${BASE_URL}${url}` }} style={styles.thumbnail} />
                    ))}
                </ScrollView>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F0E8', padding: 20 },
    loader: { flex: 1 },
    navBtn: { fontSize: 15, color: '#2D5A3D', fontWeight: '600' },
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
    editActions: { flexDirection: 'row', gap: 12, marginTop: 32, marginBottom: 48 },
    cancelBtn: {
        flex: 1, padding: 16, borderRadius: 14,
        borderWidth: 1, borderColor: '#C8DBC9', backgroundColor: '#fff', alignItems: 'center',
    },
    cancelBtnText: { fontSize: 15, color: '#6B8F71', fontWeight: '600' },
    saveBtn: { flex: 2, padding: 16, borderRadius: 14, backgroundColor: '#2D5A3D', alignItems: 'center' },
    saveBtnText: { color: '#F5F0E8', fontSize: 15, fontWeight: '700' },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    moodEmoji: { fontSize: 22 },
    date: { fontSize: 13, color: '#6B8F71' },
    title: { fontSize: 24, fontWeight: '800', color: '#2D5A3D', marginBottom: 16 },
    content: { fontSize: 16, color: '#444', lineHeight: 26 },
    thumbnail: { width: 160, height: 160, borderRadius: 14, marginRight: 12 },
});