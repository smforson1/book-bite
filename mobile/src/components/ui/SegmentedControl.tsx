import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import AppText from './AppText';

interface SegmentedControlProps {
    options: string[];
    selectedOption: string;
    onOptionPress: (option: string) => void;
}

export default function SegmentedControl({ options, selectedOption, onOptionPress }: SegmentedControlProps) {
    const { colors, spacing, sizes, shadows } = useTheme();
    const { width } = useWindowDimensions();
    // Assuming full width minus padding. Adjust 40 based on parent padding
    const containerWidth = width - (spacing.m * 2);
    const segmentWidth = (containerWidth - 8) / options.length; // 8 is padding

    const sliderPosition = useSharedValue(0);

    useEffect(() => {
        const index = options.indexOf(selectedOption);
        sliderPosition.value = withSpring(index * segmentWidth, {
            damping: 30, // Reduced bounce
            stiffness: 250, // Tighter response
            mass: 0.8,
        });
    }, [selectedOption, segmentWidth, options]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: sliderPosition.value }],
        width: segmentWidth,
    }));

    return (
        <View style={[
            styles.container,
            {
                width: containerWidth,
                backgroundColor: colors.surface,
                borderRadius: sizes.radius.l,
                marginVertical: spacing.m,
                ...shadows.light,
            }
        ]}>
            <Animated.View style={[
                styles.slider,
                {
                    backgroundColor: colors.primary + '15',
                    borderColor: colors.primary + '30',
                    borderRadius: sizes.radius.m,
                },
                animatedStyle
            ]} />
            {options.map((option) => {
                const isSelected = selectedOption === option;
                return (
                    <Pressable
                        key={option}
                        style={[styles.segment, { width: segmentWidth }]}
                        onPress={() => onOptionPress(option)}
                    >
                        <AppText
                            variant="label"
                            color={isSelected ? colors.primary : colors.textLight}
                            bold={isSelected}
                            style={styles.label}
                        >
                            {option}
                        </AppText>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 44,
        padding: 4,
    },
    slider: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        borderWidth: 1,
    },
    segment: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        zIndex: 1,
    },
    label: {
        textAlign: 'center',
    },
});
