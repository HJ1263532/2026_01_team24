import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

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
            dueDate: '2026-03-27 18:00',
            remindAt: '2026-03-27 17:00',
        },
        {
            id: '2',
            title: '과제 제출',
            isCompleted: true,
            dueDate: '2026-03-28 23:59',
            remindAt: '2026-03-28 21:00',
        },
        {
            id: '3',
            title: '장보기',
            isCompleted: false,
            dueDate: '2026-03-29 19:00',
            remindAt: '2026-03-29 18:00',
        },
    ]);

    const [openTodoId, setOpenTodoId] = useState<string | null>(null);

    const handleCardPress = (todoId: string) => {
        setOpenTodoId((prev) => (prev === todoId ? null : todoId));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.pageTitle}>Todo List</Text>
            <Text style={styles.pageDescription}>해야 할 일을 확인하고 관리하는 페이지</Text>

            <Pressable style={styles.addButton}>
                <Text style={styles.addButtonText}>+ 할 일 추가</Text>
            </Pressable>

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