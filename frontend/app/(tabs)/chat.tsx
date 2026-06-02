import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type Message = {
    id: string;
    role: 'user' | 'bot';
    text: string;
};

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadTokenAndHistory();
        }, [])
    );

    const loadTokenAndHistory = async () => {
        try {
            // 여기 'token'은 네 로그인 코드에서 저장한 이름과 같아야 해
            const savedToken = await SecureStore.getItemAsync('token');

            if (!savedToken) {
                setMessages([
                    {
                        id: 'no-token',
                        role: 'bot',
                        text: '로그인 정보가 없어 대화를 불러올 수 없어요.',
                    },
                ]);
                return;
            }

            setToken(savedToken);

            const response = await fetch(`${BASE_URL}/api/chat/history`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${savedToken}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '대화 기록 조회 실패');
            }

            const formattedMessages: Message[] = [];

            data.forEach((item: any) => {
                formattedMessages.push({
                    id: `${item._id}-user`,
                    role: 'user',
                    text: item.userMessage,
                });

                formattedMessages.push({
                    id: `${item._id}-bot`,
                    role: 'bot',
                    text: item.botReply,
                });
            });

            setMessages(formattedMessages);
        } catch (error) {
            setMessages([
                {
                    id: 'history-error',
                    role: 'bot',
                    text: '이전 대화 기록을 불러오지 못했어요.',
                },
            ]);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        if (!token) {
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-no-token`,
                    role: 'bot',
                    text: '로그인이 필요해요. 다시 로그인한 뒤 이용해 주세요.',
                },
            ]);
            return;
        }

        const userText = input.trim();

        const userMessage: Message = {
            id: `${Date.now()}-user`,
            role: 'user',
            text: userText,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log('BASE_URL:', BASE_URL);
            console.log('TOKEN:', token);

            const response = await fetch(`${BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userText,
                }),
            });

            const data = await response.json();

            console.log('CHAT STATUS:', response.status);
            console.log('CHAT DATA:', data);

            if (!response.ok) {
                throw new Error(data.error || `AI 답변 요청 실패: ${response.status}`);
            }

            const botMessage: Message = {
                id: `${data._id}-bot`,
                role: 'bot',
                text: data.botReply,
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error: any) {
            console.log('CHAT ERROR:', error);

            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-error`,
                    role: 'bot',
                    text: `AI 답변 요청 실패: ${error.message}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isHistoryLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>대화 기록을 불러오고 있어요.</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <Text style={styles.title}>AI 기억 도우미</Text>
                <Text style={styles.subtitle}>오늘의 일상과 기억을 함께 이야기해요.</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.messageBubble,
                            item.role === 'user'
                                ? styles.userBubble
                                : styles.botBubble,
                        ]}
                    >
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />

            {isLoading && (
                <View style={styles.loadingBox}>
                    <ActivityIndicator />
                    <Text style={styles.loadingText}>AI가 답변을 작성하고 있어요.</Text>
                </View>
            )}

            <View style={styles.inputBox}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="메시지를 입력하세요"
                    multiline
                />

                <Pressable
                    style={[styles.sendButton, isLoading && styles.disabledButton]}
                    onPress={handleSend}
                    disabled={isLoading}
                >
                    <Text style={styles.sendButtonText}>전송</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        gap: 12,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 14,
        backgroundColor: '#EEF2FF',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
    },
    messageList: {
        padding: 16,
        gap: 10,
    },
    messageBubble: {
        maxWidth: '82%',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 18,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#DBEAFE',
    },
    botBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#1E293B',
    },
    loadingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748B',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        gap: 8,
    },
    input: {
        flex: 1,
        minHeight: 48,
        maxHeight: 110,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 18,
        backgroundColor: '#F1F5F9',
        fontSize: 16,
        color: '#1E293B',
    },
    sendButton: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
    sendButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});