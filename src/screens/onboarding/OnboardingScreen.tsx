import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
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
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
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
        <Ionicons name={icon} size={90} color={theme.colors.text.inverse} />
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
    const { translationX, velocityX } = event.nativeEvent;
    
    // Only process if there's significant movement (not just a tap)
    if (Math.abs(translationX) < 30 && Math.abs(velocityX) < 300) {
      return; // Ignore small movements/taps
    }
    
    // Determine swipe direction and distance
    const swipeThreshold = SCREEN_WIDTH / 4;
    const velocityThreshold = 800; // Increased threshold for more intentional swipes
    
    // Check for significant swipe or fast swipe
    const isLeftSwipe = translationX < -swipeThreshold || (translationX < -50 && velocityX < -velocityThreshold);
    const isRightSwipe = translationX > swipeThreshold || (translationX > 50 && velocityX > velocityThreshold);
    
    console.log('Swipe detected:', {
      translationX,
      velocityX,
      isLeftSwipe,
      isRightSwipe,
      currentIndex
    });
    
    if (isLeftSwipe && currentIndex < onboardingData.length - 1) {
      console.log('Swiping to next screen');
      runOnJS(setCurrentIndex)(currentIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      console.log('Swiping to previous screen');
      runOnJS(setCurrentIndex)(currentIndex - 1);
    }
  };

  const handleNext = () => {
    console.log('=== HANDLE NEXT CALLED ===');
    console.log('Current index:', currentIndex);
    console.log('Total items:', onboardingData.length);
    
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      console.log('Moving to next index:', nextIndex);
      setCurrentIndex(nextIndex);
    } else {
      console.log('=== COMPLETING ONBOARDING ===');
      onComplete();
    }
  };

  const handleSkip = () => {
    console.log('=== SKIP BUTTON PRESSED ===');
    onComplete();
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
    <GestureHandlerRootView style={styles.container}>
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
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            {renderProgressBar()}
          </View>

          {/* Main Content with Swipe Gesture - Only the icon and text area */}
          <View style={styles.contentArea}>
            <PanGestureHandler onEnded={gestureHandler}>
              <Animated.View style={styles.swipeableContent}>
                {/* Animated Icon */}
                <View style={styles.iconSection}>
                  <View style={styles.iconWrapper}>
                    <AnimatedIcon
                      icon={currentItem.icon}
                      isActive={true}
                      gradientColors={currentItem.gradientColors}
                    />
                  </View>
                </View>

                {/* Animated Text Content */}
                <View style={styles.textSection}>
                  <View style={styles.textContent}>
                    <Animated.Text style={[styles.title, titleAnimatedStyle]}>
                      {currentItem.title}
                    </Animated.Text>
                    
                    <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
                      {currentItem.subtitle}
                    </Animated.Text>
                    
                    <View style={styles.descriptionContainer}>
                      <Animated.Text style={[styles.description, descriptionAnimatedStyle]}>
                        {currentItem.description}
                      </Animated.Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </PanGestureHandler>
          </View>

          {/* Navigation & Dots */}
          <View style={styles.navigationSection}>
            <View style={styles.dotsContainer}>
              {renderDots()}
              <Text style={styles.progressHint}>
                {currentIndex + 1} of {onboardingData.length}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {/* Swipe Instructions */}
            <View style={styles.swipeInstructions}>
              <View style={styles.swipeIndicator}>
                <Text style={styles.swipeText}>
                  Swipe to explore • Tap to continue
                </Text>
              </View>
            </View>
            
            {/* Button Container */}
            <View style={styles.buttonContainer}>
              {/* Main Action Button */}
              <TouchableOpacity 
                style={styles.mainActionButton}
                activeOpacity={0.8}
                onPress={() => {
                  console.log('Main action button pressed!');
                  handleNext();
                }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.mainButtonText}>
                    {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
                  </Text>
                  <Text style={styles.buttonIcon}>→</Text>
                </View>
              </TouchableOpacity>
              
              {/* Skip Button */}
              <TouchableOpacity 
                style={styles.skipButton}
                activeOpacity={0.7}
                onPress={() => {
                  console.log('Skip button pressed!');
                  handleSkip();
                }}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  
  safeArea: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  
  // Progress Section
  progressSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    zIndex: 15,
  },
  
  // Floating Particles
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    pointerEvents: 'none',
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
  
  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    zIndex: 15,
  },
  
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    marginRight: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  progressBar: {
    height: 6,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  progressText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    opacity: 0.9,
    letterSpacing: 0.5,
    minWidth: 45,
    textAlign: 'center',
  },
  
  // Content
  contentArea: {
    flex: 1,
    zIndex: 5,
    paddingHorizontal: theme.spacing.md,
  },
  
  swipeableContent: {
    flex: 1,
    zIndex: 5,
  },
  
  iconSection: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  iconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 25,
  },
  
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.4,
    shadowRadius: 35,
    elevation: 30,
  },
  
  iconGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textSection: {
    flex: 0.45,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  
  textContent: {
    alignItems: 'center',
    maxWidth: '100%',
  },
  
  descriptionContainer: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  
  subtitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    opacity: 0.95,
    letterSpacing: 0.3,
  },
  
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.xl,
    opacity: 0.85,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.2,
  },
  
  // Navigation Section
  navigationSection: {
    paddingVertical: theme.spacing.lg,
    zIndex: 15,
  },
  
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  
  dotsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    zIndex: 15,
  },
  
  progressHint: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.md,
    opacity: 0.8,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Footer
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  
  // Swipe Instructions
  swipeInstructions: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  swipeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  swipeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.3,
  },
  
  // Button Container
  buttonContainer: {
    gap: theme.spacing.md,
  },
  
  // Main Action Button
  mainActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 25,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  
  mainButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  
  buttonIcon: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  // Skip Button
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 25,
  },
  
  skipButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.md,
    opacity: 0.9,
    fontWeight: theme.typography.fontWeight.medium,
    letterSpacing: 0.3,
  },
});