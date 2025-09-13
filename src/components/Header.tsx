import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'search' | 'profile' | 'gradient';
  showBack?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  searchQuery?: string;
  searchPlaceholder?: string;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onSearchChange?: (text: string) => void;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  rightActions?: React.ReactNode;
  backgroundColor?: string;
  notificationCount?: number;
  userAvatar?: string;
  userName?: string;
  style?: any;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
  showBack = false,
  showProfile = false,
  showNotifications = false,
  showSearch = false,
  searchQuery = '',
  searchPlaceholder = 'Search...',
  onBackPress,
  onProfilePress,
  onNotificationPress,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  rightActions,
  backgroundColor,
  notificationCount = 0,
  userAvatar,
  userName,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const renderHeaderContent = () => {
    switch (variant) {
      case 'search':
        return (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchQuery}
                onChangeText={onSearchChange}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange?.('')}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'profile':
        return (
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileGreeting}>Hello, {userName}! 👋</Text>
              {subtitle && <Text style={styles.profileSubtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity style={styles.profileAvatar} onPress={onProfilePress}>
              {userAvatar ? (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{userName?.charAt(0)?.toUpperCase()}</Text>
                </View>
              ) : (
                <Ionicons name="person-circle" size={48} color={theme.colors.primary[500]} />
              )}
            </TouchableOpacity>
          </View>
        );

      case 'gradient':
        return (
          <LinearGradient
            colors={[theme.colors.primary[500], theme.colors.primary[700]]}
            style={styles.gradientHeader}
          >
            <View style={styles.defaultHeader}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, styles.gradientTitle]}>{title}</Text>
                {subtitle && <Text style={[styles.subtitle, styles.gradientSubtitle]}>{subtitle}</Text>}
              </View>
            </View>
          </LinearGradient>
        );

      default:
        return (
          <View style={styles.defaultHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
        );
    }
  };

  const containerStyle = [
    styles.container,
    { paddingTop: insets.top },
    backgroundColor && { backgroundColor },
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={variant === 'gradient' ? theme.colors.text.inverse : theme.colors.text.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {renderHeaderContent()}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {showNotifications && (
            <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
              <Ionicons 
                name="notifications-outline" 
                size={24} 
                color={variant === 'gradient' ? theme.colors.text.inverse : theme.colors.text.primary}
              />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {rightActions}
        </View>
      </View>

      {/* Search Section for non-search variants */}
      {showSearch && variant !== 'search' && (
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={onSearchChange}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange?.('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 60,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  notificationText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  // Default Header
  defaultHeader: {
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },

  // Gradient Header
  gradientHeader: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
  },
  gradientTitle: {
    color: theme.colors.text.inverse,
  },
  gradientSubtitle: {
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  profileSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  profileAvatar: {
    marginLeft: theme.spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },

  // Search
  searchContainer: {
    width: '100%',
  },
  searchSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
});

export default Header;