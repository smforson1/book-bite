import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  badge?: string | number;
  badgeColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  imageStyle?: ImageStyle;
  variant?: 'default' | 'card' | 'minimal' | 'prominent';
  showDivider?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  image,
  leftIcon,
  rightIcon = 'chevron-forward',
  badge,
  badgeColor,
  onPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  imageStyle,
  variant = 'default',
  showDivider = false,
  disabled = false,
  loading = false,
  children,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'card':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.sm,
          ...theme.shadows.sm,
        };
      case 'minimal':
        return {
          ...baseStyle,
          paddingVertical: theme.spacing.sm,
        };
      case 'prominent':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.light,
        };
      default:
        return {
          ...baseStyle,
          borderBottomWidth: showDivider ? 1 : 0,
          borderBottomColor: theme.colors.border.light,
        };
    }
  };

  const renderLeftContent = () => {
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={[styles.image, imageStyle]}
          defaultSource={require('../assets/placeholder.png')}
        />
      );
    }

    if (leftIcon) {
      return (
        <View style={styles.iconContainer}>
          <Ionicons
            name={leftIcon}
            size={24}
            color={theme.colors.text.secondary}
          />
        </View>
      );
    }

    return null;
  };

  const renderRightContent = () => {
    return (
      <View style={styles.rightContent}>
        {badge !== undefined && (
          <View style={[styles.badge, badgeColor && { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {rightIcon && onPress && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={theme.colors.text.tertiary}
            style={styles.rightIcon}
          />
        )}
      </View>
    );
  };

  const content = (
    <View style={[styles.container, getContainerStyle(), style]}>
      <View style={[styles.content, contentStyle]}>
        {renderLeftContent()}
        
        <View style={styles.textContent}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
          
          {children}
        </View>
        
        {renderRightContent()}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={loading}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    minHeight: 64,
  },
  
  image: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  title: {
    ...globalStyles.bodyLarge,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    ...globalStyles.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  
  description: {
    ...globalStyles.bodySmall,
    color: theme.colors.text.tertiary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  badge: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  
  badgeText: {
    ...globalStyles.caption,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
});

export default ListItem;