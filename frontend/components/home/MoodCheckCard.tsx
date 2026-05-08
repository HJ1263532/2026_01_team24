import { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import HomeCard from '@/components/common/HomeCard';

export default function MoodCheckCard() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    return (
        <HomeCard emoji="🌿" title="오늘의 기분" backgroundColor="#F0FDF4">
            <Text style={styles.cardText}>오늘 기분은 어떠세요?</Text>

            <View style={styles.moodContainer}>
                {['좋아요', '보통이에요', '불안해요'].map((mood) => (
                    <Pressable
                        key={mood}
                        style={[
                            styles.moodButton,
                            selectedMood === mood && styles.selectedMoodButton,
                        ]}
                        onPress={() => setSelectedMood(mood)}
                    >
                        <Text
                            style={[
                                styles.moodButtonText,
                                selectedMood === mood && styles.selectedMoodButtonText,
                            ]}
                        >
                            {mood}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </HomeCard>
    );
}

const styles = StyleSheet.create({
    cardText: {
        fontSize: 18,
        color: '#334155',
        marginBottom: 8,
        lineHeight: 28,
    },
    moodContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    moodButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    selectedMoodButton: {
        backgroundColor: '#DCFCE7',
        borderColor: '#22C55E',
    },
    moodButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
    },
    selectedMoodButtonText: {
        color: '#15803D',
        fontWeight: '800',
    },
});