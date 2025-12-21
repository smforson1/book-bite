import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageCarouselProps {
    images: string[];
    height?: number;
    width?: number;
    borderRadius?: number;
}

export default function ImageCarousel({
    images,
    height = 200,
    width = SCREEN_WIDTH,
    borderRadius = 0
}: ImageCarouselProps) {
    const { colors } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Fallback image if list is empty
    const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'];

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / width);
        setActiveIndex(index);
    };

    const renderItem = ({ item }: { item: string }) => (
        <Image
            source={{ uri: item }}
            style={{ width, height, borderRadius }}
            resizeMode="cover"
        />
    );

    return (
        <View style={[styles.container, { width, height }]}>
            <FlatList
                ref={flatListRef}
                data={displayImages}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item, index) => index.toString()}
            />

            {displayImages.length > 1 && (
                <View style={styles.dotContainer}>
                    {displayImages.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === activeIndex ? colors.primary : 'rgba(255,255,255,0.5)' }
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
    dotContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
});
