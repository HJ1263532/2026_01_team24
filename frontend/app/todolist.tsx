import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';

type Todo = {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string;
    remindAt: string;
};

export default function TodoListScreen() {
    const [todos, setTodos] = useState<Todo[]>([
        {
            id: '1',
            title: '팀플 회의 준비',
            isCompleted: false,
            dueDate: '2026-03-27T18:00:00',
            remindAt: '2026-03-27T17:00:00',
        },
    ]);

    const [openTodoId, setOpenTodoId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [remindAt, setRemindAt] = useState('');

    const handleCardPress = (todoId: string) => {
        setOpenTodoId((prev) => (prev === todoId ? null : todoId));
    };

    const handleAddTodo = async () => {
        if (!title.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }

        if (!dueDate.trim()) {
            Alert.alert('오류', '마감일을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    dueDate,
                    remindAt: remindAt || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('추가 실패', data.error || 'todo 추가 중 오류가 발생했습니다.');
                return;
            }

            const newTodo: Todo = {
                id: data.id,
                title: data.title,
                isCompleted: data.isCompleted,
                dueDate: data.dueDate,
                remindAt: data.remindAt,
            };

            setTodos((prev) => [...prev, newTodo]);

            setTitle('');
            setDueDate('');
            setRemindAt('');
            setShowForm(false);

            Alert.alert('성공', 'todo가 추가되었습니다.');
        } catch (error) {
            Alert.alert('네트워크 오류', '서버 연결에 실패했습니다.');
            console.error(error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.pageTitle}>Todo List</Text>
            <Text style={styles.pageDescription}>해야 할 일을 확인하고 관리하는 페이지</Text>

            <Pressable style={styles.addButton} onPress={() => setShowForm((prev) => !prev)}>
                <Text style={styles.addButtonText}>+ 할 일 추가</Text>
            </Pressable>

            {showForm && (
                <View style={styles.formBox}>
                    <Text>제목</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="예: 팀플 회의 준비"
                    />

                    <Text>마감일</Text>
                    <TextInput
                        style={styles.input}
                        value={dueDate}
                        onChangeText={setDueDate}
                        placeholder="예: 2026-03-27T18:00:00"
                    />

                    <Text>알림시간</Text>
                    <TextInput
                        style={styles.input}
                        value={remindAt}
                        onChangeText={setRemindAt}
                        placeholder="예: 2026-03-27T17:00:00"
                    />

                    <View style={styles.buttonRow}>
                        <Pressable
                            style={styles.actionButton}
                            onPress={() => {
                                console.log('저장 버튼 눌림');
                                handleAddTodo();
                            }}
                        >
                            <Text>저장</Text>
                        </Pressable>
                        <Pressable
                            style={styles.actionButton}
                            onPress={() => {
                                setShowForm(false);
                                setTitle('');
                                setDueDate('');
                                setRemindAt('');
                            }}
                        >
                            <Text>취소</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            <View style={styles.listContainer}>
                {todos.map((todo) => {
                    const isOpen = openTodoId === todo.id;

                    return (
                        <View key={todo.id} style={styles.card}>
                            <Pressable onPress={() => handleCardPress(todo.id)}>
                                <Text style={styles.cardTitle}>{todo.title}</Text>
                                <Text>완료 여부: {todo.isCompleted ? '완료' : '미완료'}</Text>
                                <Text>마감일: {todo.dueDate}</Text>
                            </Pressable>

                            {isOpen && (
                                <View style={styles.detailBox}>
                                    <Text>알림시간: {todo.remindAt}</Text>
                                    <Text>완료 여부 UI 자리</Text>

                                    <View style={styles.buttonRow}>
                                        <Pressable style={styles.actionButton}>
                                            <Text>수정</Text>
                                        </Pressable>

                                        <Pressable style={styles.actionButton}>
                                            <Text>삭제</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    pageDescription: {
        fontSize: 16,
        marginBottom: 20,
    },
    addButton: {
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    formBox: {
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginTop: 8,
        marginBottom: 12,
    },
    listContainer: {
        gap: 12,
    },
    card: {
        borderWidth: 1,
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    detailBox: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
});