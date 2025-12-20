import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, SIZES, SHADOWS, FONTS, SPACING } from '../../theme';
import AppText from './AppText';

interface SegmentedControlProps {
    options: string[];
    selectedOption: string;
    onOptionPress: (option: string) => void;
}

export default function SegmentedControl({ options, selectedOption, onOptionPress }: SegmentedControlProps) {
    const { width } = useWindowDimensions();
    // Assuming full width minus padding. Adjust 40 based on parent padding
    const containerWidth = width - (SPACING.m * 2);
    const segmentWidth = (containerWidth - 8) / options.length; // 8 is padding

    const sliderPosition = useSharedValue(0);

    useEffect(() => {
        const index = options.indexOf(selectedOption);
        sliderPosition.value = withSpring(index * segmentWidth, {
            damping: 15,
            stiffness: 150,
        });
    }, [selectedOption, segmentWidth, options]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: sliderPosition.value }],
        width: segmentWidth,
    }));

    return (
        <View style={[styles.container, { width: containerWidth }]}>
            <Animated.View style={[styles.slider, animatedStyle]} />
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
                            color={isSelected ? COLORS.primary : COLORS.textLight}
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
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius.l,
        padding: 4,
        marginVertical: SPACING.m,
        ...SHADOWS.light,
    },
    slider: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        backgroundColor: COLORS.primary + '15', // Light primary tint
        borderRadius: SIZES.radius.m,
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
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
