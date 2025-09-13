import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'rectangle' | 'circle' | 'card';
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
  variant = 'rectangle',
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const getVariantStyle = () => {
    switch (variant) {
      case 'text':
        return {
          height: 16,
          borderRadius: theme.borderRadius.sm,
        };
      case 'circle':
        return {
          width: height,
          height,
          borderRadius: height / 2,
        };
      case 'card':
        return {
          height: 120,
          borderRadius: theme.borderRadius.lg,
        };
      default:
        return {};
    }
  };

  const skeletonStyle: any = [
    styles.skeleton,
    {
      width,
      height,
      borderRadius,
    },
    getVariantStyle(),
    style,
  ];

  return (
    <Animated.View style={[skeletonStyle, { opacity }]}>
      <LinearGradient
        colors={[theme.colors.neutral[200], theme.colors.neutral[100], theme.colors.neutral[200]]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </Animated.View>
  );
};

// Skeleton components for common layouts
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.skeletonCard, style]}>
    <Skeleton variant="rectangle" height={120} style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <Skeleton variant="text" height={20} width="80%" />
      <Skeleton variant="text" height={16} width="60%" style={styles.skeletonMargin} />
      <Skeleton variant="text" height={14} width="40%" style={styles.skeletonMargin} />
    </View>
  </View>
);

export const SkeletonList: React.FC<{ 
  count?: number; 
  style?: ViewStyle;
  itemStyle?: ViewStyle;
}> = ({ count = 5, style, itemStyle }) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} style={StyleSheet.flatten([styles.skeletonListItem, itemStyle])} />
    ))}
  </View>
);

export const SkeletonProfile: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.skeletonProfile, style]}>
    <Skeleton variant="circle" height={60} />
    <View style={styles.skeletonProfileInfo}>
      <Skeleton variant="text" height={20} width="50%" />
      <Skeleton variant="text" height={16} width="35%" style={styles.skeletonMargin} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.neutral[200],
    overflow: 'hidden',
  },
  skeletonCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  skeletonImage: {
    marginBottom: theme.spacing.md,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonMargin: {
    marginTop: theme.spacing.sm,
  },
  skeletonListItem: {
    marginBottom: theme.spacing.md,
  },
  skeletonProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  skeletonProfileInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});

export default Skeleton;