import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';
import { COLORS } from '../../theme';

interface RatingStarsProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
}

export default function RatingStars({
    rating,
    onRatingChange,
    size = 20,
    readonly = false
}: RatingStarsProps) {
    const stars = [1, 2, 3, 4, 5];

    const handlePress = (value: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    return (
        <View style={styles.container}>
            {stars.map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => handlePress(star)}
                    disabled={readonly}
                    activeOpacity={readonly ? 1 : 0.7}
                >
                    <IconButton
                        icon={star <= rating ? 'star' : 'star-outline'}
                        iconColor={star <= rating ? '#FFD700' : COLORS.border}
                        size={size}
                        style={{ margin: 0 }}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
