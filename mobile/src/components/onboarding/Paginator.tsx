import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { COLORS, SIZES, SPACING } from '../../theme';

interface PaginatorProps {
    data: any[];
    scrollX: SharedValue<number>;
}

export default function Paginator({ data, scrollX }: PaginatorProps) {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.container}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                const animatedStyle = useAnimatedStyle(() => {
                    const dotWidth = interpolate(
                        scrollX.value,
                        inputRange,
                        [10, 20, 10],
                        Extrapolation.CLAMP
                    );
                    const opacity = interpolate(
                        scrollX.value,
                        inputRange,
                        [0.3, 1, 0.3],
                        Extrapolation.CLAMP
                    );
                    return {
                        width: dotWidth,
                        opacity,
                    };
                });

                return (
                    <Animated.View
                        style={[styles.dot, animatedStyle]}
                        key={i.toString()}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginHorizontal: 8,
    },
});
