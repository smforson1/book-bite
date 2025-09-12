import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  backgroundColor: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Welcome to BookBite',
    description: 'Your all-in-one platform for booking hotels and ordering delicious food from your favorite restaurants.',
    icon: 'hand-right',
    color: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  {
    id: '2',
    title: 'Book Amazing Hotels',
    description: 'Discover and book comfortable accommodations worldwide with the best rates and instant confirmation.',
    icon: 'bed',
    color: theme.colors.success[500],
    backgroundColor: theme.colors.success[50],
  },
  {
    id: '3',
    title: 'Order Delicious Food',
    description: 'Get your favorite meals delivered from top-rated restaurants in your area, fast and fresh.',
    icon: 'restaurant',
    color: theme.colors.secondary[500],
    backgroundColor: theme.colors.secondary[50],
  },
  {
    id: '4',
    title: 'Ready to Get Started?',
    description: 'Join thousands of satisfied customers who trust BookBite for their travel and dining needs.',
    icon: 'rocket',
    color: theme.colors.warning[600],
    backgroundColor: theme.colors.warning[50],
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={64} color={theme.colors.neutral[0]} />
        </View>
        
        <Text style={[globalStyles.h2, styles.title]}>{item.title}</Text>
        <Text style={[globalStyles.bodyLarge, styles.description]}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: onboardingData[currentIndex].color,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Skip"
          variant="ghost"
          size="small"
          onPress={handleSkip}
          style={styles.skipButton}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
      />

      {renderDots()}

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <Button
              title="Previous"
              variant="outline"
              size="medium"
              onPress={handlePrevious}
              style={styles.previousButton}
            />
          )}
          
          <Button
            title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            variant="primary"
            size="medium"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[4],
  },
  
  skipButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
  },
  
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[8],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing[4],
    color: theme.colors.text.primary,
  },
  
  description: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight['2xl'],
  },
  
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing[6],
  },
  
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  
  footer: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[6],
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  previousButton: {
    flex: 0.4,
    marginRight: theme.spacing[4],
  },
  
  nextButton: {
    flex: 0.6,
  },
});