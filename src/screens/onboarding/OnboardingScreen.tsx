import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  withSequence,
  withDelay,
  interpolateColor,
  withRepeat,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string, ...string[]];
  particleColor: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Welcome to BookBite',
    subtitle: 'Your Journey Begins Here',
    description: 'Experience the perfect blend of luxury travel and culinary excellence. Your all-in-one platform for unforgettable experiences.',
    icon: 'sparkles',
    gradientColors: [theme.colors.primary[400], theme.colors.primary[600], theme.colors.primary[800]],
    particleColor: theme.colors.primary[300],
  },
  {
    id: '2',
    title: 'Luxury Hotels',
    subtitle: 'Rest in Comfort',
    description: 'Discover handpicked accommodations worldwide. From boutique hotels to luxury resorts, find your perfect home away from home.',
    icon: 'bed',
    gradientColors: [theme.colors.success[400], theme.colors.success[600], theme.colors.success[800]],
    particleColor: theme.colors.success[300],
  },
  {
    id: '3',
    title: 'Gourmet Dining',
    subtitle: 'Savor Every Moment',
    description: 'Indulge in culinary masterpieces from award-winning restaurants. Fresh ingredients, expert chefs, delivered to your door.',
    icon: 'restaurant',
    gradientColors: [theme.colors.secondary[400], theme.colors.secondary[600], theme.colors.secondary[800]],
    particleColor: theme.colors.secondary[300],
  },
  {
    id: '4',
    title: 'Begin Your Adventure',
    subtitle: 'Excellence Awaits',
    description: 'Join our community of discerning travelers and food enthusiasts. Your extraordinary journey starts with a single tap.',
    icon: 'rocket',
    gradientColors: [theme.colors.warning[400], theme.colors.warning[600], theme.colors.warning[800]],
    particleColor: theme.colors.warning[300],
  },
];

// Floating Particle Component
const FloatingParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      translateY.value = withRepeat(
        withSequence(
          withDelay(delay, withTiming(-100, { duration: 3000 })),
          withTiming(0, { duration: 3000 })
        ),
        -1,
        true
      );
      
      opacity.value = withRepeat(
        withSequence(
          withDelay(delay, withTiming(0.7, { duration: 1500 })),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
      
      scale.value = withRepeat(
        withSequence(
          withDelay(delay, withTiming(1, { duration: 1500 })),
          withTiming(0.5, { duration: 1500 })
        ),
        -1,
        true
      );
    };
    
    animate();
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle, { backgroundColor: color }]} />
  );
};

// Animated Icon Component
const AnimatedIcon: React.FC<{ 
  icon: keyof typeof Ionicons.glyphMap; 
  isActive: boolean;
  gradientColors: [string, string, ...string[]];
}> = ({ icon, isActive, gradientColors }) => {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      rotate.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(0, { duration: 300 });
      pulse.value = 1;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulse.value },
        { rotateZ: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={80} color={theme.colors.text.inverse} />
      </LinearGradient>
    </Animated.View>
  );
};

// Animated Background Component
const AnimatedBackground: React.FC<{ gradientColors: [string, string, ...string[]]; isActive: boolean }> = ({ 
  gradientColors, 
  isActive 
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0, { duration: 800 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useSharedValue(0);
  
  // Animation values for text
  const titleOpacity = useSharedValue(1);
  const titleTranslateY = useSharedValue(0);
  const subtitleOpacity = useSharedValue(1);
  const subtitleTranslateY = useSharedValue(0);
  const descriptionOpacity = useSharedValue(1);
  const descriptionTranslateY = useSharedValue(0);
  
  // Button animations
  const buttonScale = useSharedValue(1);
  const skipButtonOpacity = useSharedValue(1);

  useEffect(() => {
    progress.value = currentIndex / (onboardingData.length - 1);
    animateSlideTransition();
  }, [currentIndex]);

  const animateSlideTransition = () => {
    // Animate text elements with staggered timing
    titleOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withDelay(300, withTiming(1, { duration: 400 }))
    );
    
    titleTranslateY.value = withSequence(
      withTiming(30, { duration: 200 }),
      withDelay(300, withSpring(0, { damping: 15 }))
    );
    
    subtitleOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withDelay(400, withTiming(1, { duration: 400 }))
    );
    
    subtitleTranslateY.value = withSequence(
      withTiming(30, { duration: 200 }),
      withDelay(400, withSpring(0, { damping: 15 }))
    );
    
    descriptionOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withDelay(500, withTiming(1, { duration: 400 }))
    );
    
    descriptionTranslateY.value = withSequence(
      withTiming(30, { duration: 200 }),
      withDelay(500, withSpring(0, { damping: 15 }))
    );
  };

  const gestureHandler = (event: any) => {
    'worklet';
    const { translationX } = event.nativeEvent;
    const shouldGoNext = translationX < -SCREEN_WIDTH / 3 && currentIndex < onboardingData.length - 1;
    const shouldGoPrev = translationX > SCREEN_WIDTH / 3 && currentIndex > 0;
    
    if (shouldGoNext) {
      runOnJS(setCurrentIndex)(currentIndex + 1);
    } else if (shouldGoPrev) {
      runOnJS(setCurrentIndex)(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      buttonScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      setCurrentIndex(currentIndex + 1);
    } else {
      buttonScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );
      setTimeout(() => onComplete(), 600);
    }
  };

  const handleSkip = () => {
    skipButtonOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => onComplete(), 300);
  };

  const currentItem = onboardingData[currentIndex];

  // Animated Progress Bar
  const renderProgressBar = () => {
    const animatedProgressStyle = useAnimatedStyle(() => {
      const progressWidth = interpolate(
        progress.value,
        [0, 1],
        [20, SCREEN_WIDTH - 40],
        Extrapolate.CLAMP
      );
      
      return {
        width: withSpring(progressWidth, { damping: 15 }),
        backgroundColor: interpolateColor(
          progress.value,
          [0, 0.33, 0.66, 1],
          [
            currentItem.gradientColors[0],
            onboardingData[1].gradientColors[0],
            onboardingData[2].gradientColors[0],
            onboardingData[3].gradientColors[0],
          ]
        ),
      };
    });

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {onboardingData.length}
        </Text>
      </View>
    );
  };

  // Animated Dots Indicator
  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const isActive = index === currentIndex;
            const scale = isActive ? withSpring(1.5) : withSpring(1);
            const opacity = isActive ? withTiming(1) : withTiming(0.4);
            
            return {
              transform: [{ scale }],
              opacity,
              backgroundColor: currentItem.gradientColors[0],
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, animatedDotStyle]}
            />
          );
        })}
      </View>
    );
  };

  // Animated text styles
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: subtitleOpacity.value,
      transform: [{ translateY: subtitleTranslateY.value }],
    };
  });

  const descriptionAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: descriptionOpacity.value,
      transform: [{ translateY: descriptionTranslateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const skipAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: skipButtonOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      {onboardingData.map((item, index) => (
        <AnimatedBackground
          key={item.id}
          gradientColors={item.gradientColors}
          isActive={index === currentIndex}
        />
      ))}

      {/* Floating Particles */}
      <View style={styles.particlesContainer}>
        {Array.from({ length: 15 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.particleWrapper,
              {
                left: Math.random() * SCREEN_WIDTH,
                top: Math.random() * SCREEN_HEIGHT,
              },
            ]}
          >
            <FloatingParticle
              delay={index * 200}
              color={currentItem.particleColor}
            />
          </View>
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Skip Button */}
        <View style={styles.header}>
          <Animated.View style={skipAnimatedStyle}>
            <Button
              title="Skip"
              variant="ghost"
              size="small"
              onPress={handleSkip}
              style={styles.skipButton}
            />
          </Animated.View>
        </View>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Main Content */}
        <Animated.View style={styles.contentContainer}>
            {/* Animated Icon */}
            <View style={styles.iconSection}>
              <AnimatedIcon
                icon={currentItem.icon}
                isActive={true}
                gradientColors={currentItem.gradientColors}
              />
            </View>

            {/* Animated Text Content */}
            <View style={styles.textSection}>
              <Animated.Text style={[styles.title, titleAnimatedStyle]}>
                {currentItem.title}
              </Animated.Text>
              
              <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
                {currentItem.subtitle}
              </Animated.Text>
              
              <Animated.Text style={[styles.description, descriptionAnimatedStyle]}>
                {currentItem.description}
              </Animated.Text>
            </View>
          </Animated.View>

        {/* Animated Dots */}
        {renderDots()}

        {/* Action Buttons */}
        <View style={styles.footer}>
          <View style={styles.navigationContainer}>
            {/* Previous Button */}
            {currentIndex > 0 && (
              <Animated.View style={[styles.navButton, buttonAnimatedStyle]}>
                <Button
                  title=""
                  variant="ghost"
                  size="medium"
                  onPress={() => setCurrentIndex(currentIndex - 1)}
                  style={styles.prevButton}
                  icon={<Ionicons name="chevron-back" size={24} color={theme.colors.text.inverse} />}
                />
              </Animated.View>
            )}
            
            {/* Main Action Button */}
            <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
              <LinearGradient
                colors={currentItem.gradientColors}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Button
                  title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
                  variant="primary"
                  size="large"
                  onPress={handleNext}
                  style={styles.nextButton}
                  textStyle={styles.buttonText}
                />
              </LinearGradient>
            </Animated.View>
            
            {/* Next Preview Button */}
            {currentIndex < onboardingData.length - 1 && (
              <Animated.View style={[styles.navButton, buttonAnimatedStyle]}>
                <Button
                  title=""
                  variant="ghost"
                  size="medium"
                  onPress={handleNext}
                  style={styles.nextPreviewButton}
                  icon={<Ionicons name="chevron-forward" size={24} color={theme.colors.text.inverse} />}
                />
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  
  safeArea: {
    flex: 1,
  },
  
  // Floating Particles
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  particleWrapper: {
    position: 'absolute',
  },
  
  particle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    zIndex: 10,
  },
  
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  
  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    zIndex: 10,
  },
  
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginRight: theme.spacing.md,
  },
  
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  
  progressText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    opacity: 0.8,
  },
  
  // Content
  contentContainer: {
    flex: 1,
    zIndex: 10,
  },
  
  iconSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
  },
  
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textSection: {
    flex: 0.4,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    opacity: 0.9,
  },
  
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.lg,
    opacity: 0.8,
    paddingHorizontal: theme.spacing.md,
  },
  
  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    zIndex: 10,
  },
  
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: theme.spacing.xs,
  },
  
  // Footer
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    zIndex: 10,
  },
  
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  
  prevButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  nextPreviewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonWrapper: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  buttonGradient: {
    borderRadius: theme.borderRadius.xl,
  },
  
  nextButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
  },
  
  buttonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
});