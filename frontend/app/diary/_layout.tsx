import { Stack } from 'expo-router';

export default function DiaryLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#F5F0E8' },
                headerTintColor: '#2D5A3D',
                headerTitleStyle: { fontWeight: '700' },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="create" options={{ title: '새 일기' }} />
            <Stack.Screen name="[id]" options={{ title: '일기' }} />
            {/* <Stack.Screen name="api/diary" /> */}
        </Stack>
    );
}