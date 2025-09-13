import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  variant?: 'default' | 'gradient' | 'card' | 'padded';
  scrollable?: boolean;
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement<any>;
  safeArea?: boolean;
  backgroundColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
  padding?: keyof typeof theme.spacing;
  paddingHorizontal?: keyof typeof theme.spacing;
  paddingVertical?: keyof typeof theme.spacing;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  contentStyle,
  variant = 'default',
  scrollable = false,
  showsVerticalScrollIndicator = false,
  refreshControl,
  safeArea = true,
  backgroundColor,
  gradientColors,
  padding,
  paddingHorizontal = 'lg',
  paddingVertical,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };

    switch (variant) {
      case 'gradient':
        return baseStyle;
      case 'card':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.primary,
          margin: theme.spacing.md,
          borderRadius: theme.borderRadius.xl,
          ...theme.shadows.md,
        };
      case 'padded':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || theme.colors.background.secondary,
          paddingHorizontal: theme.spacing[paddingHorizontal],
          paddingVertical: paddingVertical ? theme.spacing[paddingVertical] : 0,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || theme.colors.background.secondary,
        };
    }
  };

  const getContentStyle = (): ViewStyle => {
    const baseContentStyle: ViewStyle = {
      flexGrow: 1,
    };

    if (variant === 'padded') {
      return baseContentStyle;
    }

    return {
      ...baseContentStyle,
      paddingHorizontal: theme.spacing[paddingHorizontal],
      paddingVertical: paddingVertical ? theme.spacing[paddingVertical] : 0,
    };
  };

  const renderContent = () => {
    const content = scrollable ? (
      <ScrollView
        style={[getContentStyle(), contentStyle]}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[getContentStyle(), contentStyle]}>
        {children}
      </View>
    );

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={gradientColors || [theme.colors.primary[500], theme.colors.primary[700]]}
          style={StyleSheet.absoluteFillObject}
        >
          {content}
        </LinearGradient>
      );
    }

    return content;
  };

  const containerStyle = [getContainerStyle(), style];

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle}>
        {renderContent()}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle}>
      {renderContent()}
    </View>
  );
};

export default Container;