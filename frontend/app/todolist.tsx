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
import { Picker } from '@react-native-picker/picker';

type Todo = {
    id: string;
    title: string;
    isCompleted: boolean;
    dueDate: string | null;
    remindAt: string | null;
};

type DateTimeParts = {
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
};

type DateTimePickerGroupProps = {
    label: string;
    value: DateTimeParts;
    onChange: (field: keyof DateTimeParts, nextValue: string) => void;
};

const API_BASE_URL = 'http://127.0.0.1:5000';

const DEFAULT_DUE_DATE: DateTimeParts = {
    year: '2026',
    month: '03',
    day: '27',
    hour: '18',
    minute: '00',
};

const DEFAULT_REMIND_DATE: DateTimeParts = {
    year: '2026',
    month: '03',
    day: '27',
    hour: '17',
    minute: '00',
};

const YEARS = Array.from({ length: 10 }, (_, i) => String(2026 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '10', '20', '30', '40', '50'];

const formatDate = (dateString: string | null) => {
    if (!dateString) return '없음';
    return dateString.replace('T', ' ').slice(0, 16);
};

const makeIsoString = ({ year, month, day, hour, minute }: DateTimeParts) => {
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
};

const parseDateToParts = (
    dateString: string | null,
    fallback: DateTimeParts = DEFAULT_DUE_DATE
): DateTimeParts => {
    if (!dateString) return { ...fallback };

    const [datePart, timePart = '00:00:00'] = dateString.split('T');
    const [year = fallback.year, month = fallback.month, day = fallback.day] = datePart.split('-');
    const [hour = fallback.hour, minute = fallback.minute] = timePart.split(':');

    return { year, month, day, hour, minute };
};

function DateTimePickerGroup({ label, value, onChange }: DateTimePickerGroupProps) {
    return (
        <View style={styles.dateSection}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.pickerRow}>
                <PickerField
                    title="연도"
                    selectedValue={value.year}
                    items={YEARS}
                    onValueChange={(next) => onChange('year', next)}
                />
                <PickerField
                    title="월"
                    selectedValue={value.month}
                    items={MONTHS}
                    onValueChange={(next) => onChange('month', next)}
                />
                <PickerField
                    title="일"
                    selectedValue={value.day}
                    items={DAYS}
                    onValueChange={(next) => onChange('day', next)}
                />
            </View>

            <View style={styles.pickerRow}>
                <PickerField
                    title="시"
                    selectedValue={value.hour}
                    items={HOURS}
                    onValueChange={(next) => onChange('hour', next)}
                />
                <PickerField
                    title="분"
                    selectedValue={value.minute}
                    items={MINUTES}
                    onValueChange={(next) => onChange('minute', next)}
                />
            </View>

            <Text style={styles.previewText}>선택값: {makeIsoString(value)}</Text>
        </View>
    );
}

type PickerFieldProps = {
    title: string;
    selectedValue: string;
    items: string[];
    onValueChange: (value: string) => void;
};

function PickerField({ title, selectedValue, items, onValueChange }: PickerFieldProps) {
    return (
        <View style={styles.pickerBox}>
            <Text>{title}</Text>
            <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
                {items.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                ))}
            </Picker>
        </View>
    );
}

export default function TodoListScreen() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [openTodoId, setOpenTodoId] = useState<string | null>(null);
    const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState('');
    const [dueDateParts, setDueDateParts] = useState<DateTimeParts>(DEFAULT_DUE_DATE);
    const [remindAtParts, setRemindAtParts] = useState<DateTimeParts>(DEFAULT_REMIND_DATE);

    const [editTitle, setEditTitle] = useState('');
    const [editDueDateParts, setEditDueDateParts] = useState<DateTimeParts>(DEFAULT_DUE_DATE);
    const [editRemindAtParts, setEditRemindAtParts] = useState<DateTimeParts>(DEFAULT_REMIND_DATE);

    useEffect(() => {
        fetchTodos();
    }, []);

    const updateDateParts =
        (setter: React.Dispatch<React.SetStateAction<DateTimeParts>>) =>
            (field: keyof DateTimeParts, nextValue: string) => {
                setter((prev) => ({ ...prev, [field]: nextValue }));
            };

    const updateAddDueDate = updateDateParts(setDueDateParts);
    const updateAddRemindAt = updateDateParts(setRemindAtParts);
    const updateEditDueDate = updateDateParts(setEditDueDateParts);
    const updateEditRemindAt = updateDateParts(setEditRemindAtParts);

    const closeAllPanels = () => {
        setOpenTodoId(null);
        setEditingTodoId(null);
        setShowForm(false);
        resetEditForm();
    };

    const resetAddForm = () => {
        setTitle('');
        setDueDateParts(DEFAULT_DUE_DATE);
        setRemindAtParts(DEFAULT_REMIND_DATE);
    };

    const resetEditForm = () => {
        setEditTitle('');
        setEditDueDateParts(DEFAULT_DUE_DATE);
        setEditRemindAtParts(DEFAULT_REMIND_DATE);
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

    const handleCardPress = (todoId: string) => {
        setOpenTodoId((prev) => (prev === todoId ? null : todoId));
        if (editingTodoId && editingTodoId !== todoId) {
            resetEditForm();
            setEditingTodoId(null);
        }
    };

    const handleAddTodo = async () => {
        if (!title.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    dueDate: makeIsoString(dueDateParts),
                    remindAt: makeIsoString(remindAtParts),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert('추가 실패', data.error || 'todo 추가 중 오류가 발생했습니다.');
                return;
            }

            await fetchTodos();
            resetAddForm();
            setShowForm(false);
            Alert.alert('성공', 'todo가 추가되었습니다.');
        } catch (error) {
            console.error(error);
            Alert.alert('네트워크 오류', '서버 연결에 실패했습니다.');
        }
    };

    const handleDeleteTodo = (todoId: string) => {
        Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
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

                        if (openTodoId === todoId) setOpenTodoId(null);
                        if (editingTodoId === todoId) {
                            setEditingTodoId(null);
                            resetEditForm();
                        }

                        Alert.alert('성공', 'todo가 삭제되었습니다.');
                    } catch (error) {
                        console.error(error);
                        Alert.alert('네트워크 오류', '서버 연결에 실패했습니다.');
                    }
                },
            },
        ]);
    };

    const startEditTodo = (todo: Todo) => {
        setEditingTodoId(todo.id);
        setEditTitle(todo.title ?? '');
        setEditDueDateParts(parseDateToParts(todo.dueDate, DEFAULT_DUE_DATE));
        setEditRemindAtParts(parseDateToParts(todo.remindAt, DEFAULT_REMIND_DATE));
    };

    const cancelEditTodo = () => {
        setEditingTodoId(null);
        resetEditForm();
    };

    const handleUpdateTodo = async (todoId: string) => {
        if (!editTitle.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/todos/update/${todoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    dueDate: makeIsoString(editDueDateParts),
                    remindAt: makeIsoString(editRemindAtParts),
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

    const renderTodoDetail = (todo: Todo) => {
        const isEditing = editingTodoId === todo.id;

        if (!isEditing) {
            return (
                <>
                    <Text>알림시간: {formatDate(todo.remindAt)}</Text>

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
            );
        }

        return (
            <>
                <Text style={styles.label}>제목</Text>
                <TextInput
                    style={styles.input}
                    value={editTitle}
                    onChangeText={setEditTitle}
                    placeholder="제목을 입력하세요"
                />

                <DateTimePickerGroup
                    label="마감일"
                    value={editDueDateParts}
                    onChange={updateEditDueDate}
                />

                <DateTimePickerGroup
                    label="알림시간"
                    value={editRemindAtParts}
                    onChange={updateEditRemindAt}
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
        );
    };

    return (
        <Pressable style={styles.screen} onPress={closeAllPanels}>
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
                        <Text style={styles.label}>제목</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="예: 팀플 회의 준비"
                        />

                        <DateTimePickerGroup
                            label="마감일"
                            value={dueDateParts}
                            onChange={updateAddDueDate}
                        />

                        <DateTimePickerGroup
                            label="알림시간"
                            value={remindAtParts}
                            onChange={updateAddRemindAt}
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
                                    resetAddForm();
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
                                    <Text>마감일: {formatDate(todo.dueDate)}</Text>

                                    {isOpen && (
                                        <Pressable style={styles.detailBox} onPress={(e) => e.stopPropagation()}>
                                            {renderTodoDetail(todo)}
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
    screen: {
        flex: 1,
    },
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
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '600',
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
    dateSection: {
        marginBottom: 20,
    },
    pickerRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    pickerBox: {
        minWidth: 120,
        flex: 1,
        borderWidth: 1,
    },
    previewText: {
        marginTop: 4,
    },
});