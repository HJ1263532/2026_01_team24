import React, { useEffect, useState } from 'react';
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
    dueDate: string | null;
    remindAt: string | null;
};

const API_BASE_URL = 'http://127.0.0.1:5000';

export default function TodoListScreen() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [openTodoId, setOpenTodoId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [remindAt, setRemindAt] = useState('');

    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [editRemindAt, setEditRemindAt] = useState('');

    const handleCardPress = (todoId: string) => {
        setOpenTodoId((prev) => (prev === todoId ? null : todoId));
    };

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/todos`);
            const data = await response.json();

            if (!response.ok) {
                Alert.alert('목록 조회 실패', data.error || 'todo 목록을 불러오지 못했습니다.');
                return;
            }

            setTodos(data);
        } catch (error) {
            console.error(error);
            Alert.alert('네트워크 오류', '서버에서 todo 목록을 가져오지 못했습니다.');
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

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
            const response = await fetch(`${API_BASE_URL}/api/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    dueDate,
                    remindAt: remindAt.trim() ? remindAt : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('추가 실패', data.error || 'todo 추가 중 오류가 발생했습니다.');
                return;
            }

            await fetchTodos();

            setTitle('');
            setDueDate('');
            setRemindAt('');
            setShowForm(false);

            Alert.alert('성공', 'todo가 추가되었습니다.');
        } catch (error) {
            console.error(error);
            Alert.alert('네트워크 오류', '서버 연결에 실패했습니다.');
        }
    };

    const handleDeleteTodo = async (todoId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/todos/${todoId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('삭제 실패', data.error || '삭제 중 오류가 발생했습니다.');
                return;
            }

            await fetchTodos();

            if (openTodoId === todoId) {
                setOpenTodoId(null);
            }

            if (editingTodoId === todoId) {
                setEditingTodoId(null);
            }

            Alert.alert('성공', 'todo가 삭제되었습니다.');
        } catch (error) {
            console.error(error);
            Alert.alert('네트워크 오류', '서버 연결에 실패했습니다.');
        }
    };

    const startEditTodo = (todo: Todo) => {
        setEditingTodoId(todo.id);
        setEditTitle(todo.title ?? '');
        setEditDueDate(todo.dueDate ?? '');
        setEditRemindAt(todo.remindAt ?? '');
    };

    const cancelEditTodo = () => {
        setEditingTodoId(null);
        setEditTitle('');
        setEditDueDate('');
        setEditRemindAt('');
    };

    const handleUpdateTodo = async (todoId: string) => {
        if (!editTitle.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/todos/update/${todoId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editTitle,
                    dueDate: editDueDate.trim() ? editDueDate : null,
                    remindAt: editRemindAt.trim() ? editRemindAt : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('수정 실패', data.message || data.error || '수정 중 오류가 발생했습니다.');
                return;
            }

            await fetchTodos();
            cancelEditTodo();

            Alert.alert('성공', 'todo가 수정되었습니다.');
        } catch (error) {
            console.error(error);
            Alert.alert('네트워크 오류', '서버 연결에 실패했습니다.');
        }
    };

    return (
        <Pressable
            style={{ flex: 1 }}
            onPress={() => {
                setOpenTodoId(null);
                cancelEditTodo();
                setShowForm(false);
            }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.pageTitle}>Todo List</Text>
                <Text style={styles.pageDescription}>해야 할 일을 확인하고 관리하는 페이지</Text>

                <Pressable
                    style={styles.addButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        setShowForm((prev) => !prev);
                    }}
                >
                    <Text style={styles.addButtonText}>+ 할 일 추가</Text>
                </Pressable>

                {showForm && (
                    <Pressable style={styles.formBox} onPress={(e) => e.stopPropagation()}>
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
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleAddTodo();
                                }}
                            >
                                <Text>저장</Text>
                            </Pressable>

                            <Pressable
                                style={styles.actionButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowForm(false);
                                    setTitle('');
                                    setDueDate('');
                                    setRemindAt('');
                                }}
                            >
                                <Text>취소</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                )}

                <View style={styles.listContainer}>
                    {todos.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text>아직 등록된 할 일이 없어요.</Text>
                        </View>
                    ) : (
                        todos.map((todo) => {
                            const isOpen = openTodoId === todo.id;
                            const isEditing = editingTodoId === todo.id;

                            return (
                                <Pressable
                                    key={todo.id}
                                    style={styles.card}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleCardPress(todo.id);
                                    }}
                                >
                                    <Text style={styles.cardTitle}>{todo.title}</Text>
                                    <Text>완료 여부: {todo.isCompleted ? '완료' : '미완료'}</Text>
                                    <Text>마감일: {todo.dueDate ?? '없음'}</Text>

                                    {isOpen && (
                                        <Pressable style={styles.detailBox} onPress={(e) => e.stopPropagation()}>
                                            {!isEditing ? (
                                                <>
                                                    <Text>알림시간: {todo.remindAt ?? '없음'}</Text>

                                                    <View style={styles.buttonRow}>
                                                        <Pressable
                                                            style={styles.actionButton}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                startEditTodo(todo);
                                                            }}
                                                        >
                                                            <Text>수정</Text>
                                                        </Pressable>

                                                        <Pressable
                                                            style={styles.actionButton}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTodo(todo.id);
                                                            }}
                                                        >
                                                            <Text>삭제</Text>
                                                        </Pressable>
                                                    </View>
                                                </>
                                            ) : (
                                                <>
                                                    <Text>제목</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={editTitle}
                                                        onChangeText={setEditTitle}
                                                        placeholder="제목을 입력하세요"
                                                    />

                                                    <Text>마감일</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={editDueDate}
                                                        onChangeText={setEditDueDate}
                                                        placeholder="예: 2026-03-27T18:00:00"
                                                    />

                                                    <Text>알림시간</Text>
                                                    <TextInput
                                                        style={styles.input}
                                                        value={editRemindAt}
                                                        onChangeText={setEditRemindAt}
                                                        placeholder="예: 2026-03-27T17:00:00"
                                                    />

                                                    <View style={styles.buttonRow}>
                                                        <Pressable
                                                            style={styles.actionButton}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateTodo(todo.id);
                                                            }}
                                                        >
                                                            <Text>저장</Text>
                                                        </Pressable>

                                                        <Pressable
                                                            style={styles.actionButton}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                cancelEditTodo();
                                                            }}
                                                        >
                                                            <Text>취소</Text>
                                                        </Pressable>
                                                    </View>
                                                </>
                                            )}
                                        </Pressable>
                                    )}
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </Pressable>
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
    emptyBox: {
        borderWidth: 1,
        padding: 16,
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