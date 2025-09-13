import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  variant?: 'default' | 'card' | 'minimal' | 'prominent';
  showDivider?: boolean;
  actionText?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
  spacing?: keyof typeof theme.spacing;
  paddingHorizontal?: keyof typeof theme.spacing;
  paddingVertical?: keyof typeof theme.spacing;
}

const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  style,
  headerStyle,
  contentStyle,
  titleStyle,
  subtitleStyle,
  variant = 'default',
  showDivider = false,
  actionText,
  actionIcon,
  onActionPress,
  spacing = 'lg',
  paddingHorizontal = 'lg',
  paddingVertical = 'md',
}) => {
  const getSectionStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: theme.spacing[spacing],
    };

    switch (variant) {
      case 'card':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.sm,
        };
      case 'minimal':
        return {
          ...baseStyle,
          paddingHorizontal: 0,
        };
      case 'prominent':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.primary,
          marginHorizontal: -theme.spacing[paddingHorizontal],
          paddingHorizontal: theme.spacing[paddingHorizontal],
          paddingVertical: theme.spacing[paddingVertical],
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.colors.border.light,
        };
      default:
        return {
          ...baseStyle,
          paddingHorizontal: theme.spacing[paddingHorizontal],
        };
    }
  };

  const renderHeader = () => {
    if (!title && !actionText) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          {title && (
            <Text style={[styles.title, titleStyle]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
        </View>

        {(actionText || actionIcon) && onActionPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onActionPress}
            activeOpacity={0.7}
          >
            {actionText && (
              <Text style={styles.actionText}>{actionText}</Text>
            )}
            {actionIcon && (
              <Ionicons
                name={actionIcon}
                size={16}
                color={theme.colors.primary[500]}
                style={actionText && styles.actionIconWithText}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderDivider = () => {
    if (!showDivider) return null;
    return <View style={styles.divider} />;
  };

  return (
    <View style={[getSectionStyle(), style]}>
      {renderHeader()}
      {renderDivider()}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  title: {
    ...globalStyles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    ...globalStyles.body,
    color: theme.colors.text.secondary,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  
  actionText: {
    ...globalStyles.bodySmall,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  actionIconWithText: {
    marginLeft: theme.spacing.xs,
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginBottom: theme.spacing.md,
  },
  
  content: {
    flex: 1,
  },
});

export default Section;