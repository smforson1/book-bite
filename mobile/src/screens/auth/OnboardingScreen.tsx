import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';
import OnboardingItem from '../../components/onboarding/OnboardingItem';
import Paginator from '../../components/onboarding/Paginator';
import AppButton from '../../components/ui/AppButton';
import { COLORS, SPACING } from '../../theme';

const slides = [
    {
        id: '1',
        title: 'Welcome to Book Bite',
        description: 'Join our community to discover the best food and stays around you.',
        image: require('../../../assets/images/onboarding_welcome.png'),
    },
    {
        id: '2',
        title: 'Savor the Flavor',
        description: 'Browse menus, order your favorite meals, and enjoy seamless delivery.',
        image: require('../../../assets/images/onboarding_eat.png'),
    },
    {
        id: '3',
        title: 'Stay in Comfort',
        description: 'Book the perfect room for your getaway with just a few taps.',
        image: require('../../../assets/images/onboarding_sleep.png'),
    },
];

export default function OnboardingScreen({ navigation }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const slidesRef = useRef<Animated.FlatList<any>>(null);
    const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            completeOnboarding();
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ flex: 3 }}>
                <Animated.FlatList
                    data={slides}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={scrollHandler}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <Paginator data={slides} scrollX={scrollX} />

            <View style={styles.footer}>
                <AppButton
                    title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                    onPress={scrollTo}
                    style={{ width: '100%' }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    footer: {
        flex: 0.5, // Bottom section
        width: '100%',
        paddingHorizontal: SPACING.l,
        justifyContent: 'center',
    }
});
