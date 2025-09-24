import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string, ...string[]];
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Welcome to BookBite',
    subtitle: 'Your Journey Begins Here',
    description: 'Experience the perfect blend of luxury travel and culinary excellence. Your all-in-one platform for unforgettable experiences.',
    icon: 'sparkles',
    gradientColors: [theme.colors.primary[500], theme.colors.primary[700]],
  },
  {
    id: '2',
    title: 'Luxury Hotels',
    subtitle: 'Rest in Comfort',
    description: 'Discover handpicked accommodations worldwide. From boutique hotels to luxury resorts, find your perfect home away from home.',
    icon: 'bed',
    gradientColors: [theme.colors.success[500], theme.colors.success[700]],
  },
  {
    id: '3',
    title: 'Gourmet Dining',
    subtitle: 'Savor Every Moment',
    description: 'Indulge in culinary masterpieces from award-winning restaurants. Fresh ingredients, expert chefs, delivered to your door.',
    icon: 'restaurant',
    gradientColors: [theme.colors.secondary[500], theme.colors.secondary[700]],
  },
  {
    id: '4',
    title: 'Begin Your Adventure',
    subtitle: 'Excellence Awaits',
    description: 'Join our community of discerning travelers and food enthusiasts. Your extraordinary journey starts with a single tap.',
    icon: 'rocket',
    gradientColors: [theme.colors.error[500], theme.colors.error[700]],
  },
];

interface SimpleOnboardingScreenProps {
  onComplete: () => void;
}

export const SimpleOnboardingScreen: React.FC<SimpleOnboardingScreenProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = onboardingData[currentIndex];

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
  };

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDotPress(index)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex 
                    ? currentItem.gradientColors[0] 
                    : 'rgba(255, 255, 255, 0.4)',
                }
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={currentItem.gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={currentItem.gradientColors}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={currentItem.icon} size={80} color={theme.colors.text.inverse} />
            </LinearGradient>
          </View>

          {/* Text Content */}
          <View style={styles.textSection}>
            <Text style={styles.title}>{currentItem.title}</Text>
            <Text style={styles.subtitle}>{currentItem.subtitle}</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{currentItem.description}</Text>
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationSection}>
          {renderDots()}
          <Text style={styles.progressHint}>
            {currentIndex + 1} of {onboardingData.length}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.mainActionButton}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={styles.mainButtonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton}
              activeOpacity={0.7}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
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
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    marginBottom: theme.spacing.xl,
  },
  
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  textSection: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
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
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    opacity: 0.9,
  },
  
  descriptionContainer: {
    marginTop: theme.spacing.md,
  },
  
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.xl,
    opacity: 0.85,
    maxWidth: 300,
  },
  
  navigationSection: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  
  progressHint: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.md,
    opacity: 0.8,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: theme.spacing.sm,
  },
  
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    alignItems: 'center',
  },
  
  buttonContainer: {
    gap: 20,
    alignItems: 'center',
    width: '100%',
  },
  
  mainActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  mainButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  
  skipButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.md,
    opacity: 0.9,
    fontWeight: theme.typography.fontWeight.medium,
  },
});