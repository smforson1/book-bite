import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ErrorFeedback } from '../../components';
import BasicImageUpload from '../../components/BasicImageUpload';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { quickLogin } from '../../utils/authHelper';
import { useErrorHandling } from '../../hooks/useErrorHandling';
// ThemeContext import removed as part of dark mode revert

const HotelProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  // Theme hook removed as part of dark mode revert
  const currentTheme = theme;
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const { error, clearError, withErrorHandling, showUserFeedback } = useErrorHandling();

  const handleLogout = withErrorHandling(
    async () => {
      await logout();
      showUserFeedback('Logged out successfully', 'success');
    },
    {
      errorMessage: 'Failed to logout. Please try again.',
      successMessage: 'Logged out successfully',
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  const handleImagesUploaded = withErrorHandling(
    async (imageUrls: string[]) => {
      setHotelImages(imageUrls);
      // In a real app, we would update the hotel with the new images
      console.log('Hotel images updated:', imageUrls);
      showUserFeedback('Images uploaded successfully!', 'success');
    },
    {
      errorMessage: 'Failed to upload images. Please try again.',
      successMessage: 'Images uploaded successfully!',
      showSuccessToast: true,
      showErrorToast: true
    }
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background.secondary }]}>
      {/* Error Feedback */}
      {error && (
        <ErrorFeedback
          message={error.message}
          type={error.type}
          onDismiss={clearError}
        />
      )}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: currentTheme.colors.background.primary }]}>
          <View style={[styles.profileIcon, { backgroundColor: currentTheme.colors.success[50] }]}>
            <Ionicons name="business-outline" size={64} color={currentTheme.colors.success[500]} />
          </View>
          <Text style={[globalStyles.h2, styles.title, { color: currentTheme.colors.text.primary }]}>Hotel Profile</Text>
          <Text style={[globalStyles.bodyLarge, styles.subtitle, { color: currentTheme.colors.text.secondary }]}>Manage your hotel information</Text>
        </View>

        {/* Hotel Images */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Hotel Images</Text>
          <BasicImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxImages={10}
            title="Upload Hotel Photos"
            subtitle="Add photos of your hotel exterior, lobby, rooms, and amenities"
          />

          {/* Image Preview */}
          {hotelImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
              {hotelImages.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.hotelImagePreview}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Hotel Information */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle, { color: currentTheme.colors.text.primary }]}>Hotel Information</Text>

          <Card style={styles.infoCard}>
            <View style={[styles.infoItem, { borderBottomColor: currentTheme.colors.border.light }]}>
              <Ionicons name="business" size={20} color={currentTheme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel, { color: currentTheme.colors.text.secondary }]}>Hotel Name</Text>
                <Text style={[globalStyles.body, styles.infoValue, { color: currentTheme.colors.text.primary }]}>{user?.name || 'Hotel Name'}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: currentTheme.colors.border.light }]}>
              <Ionicons name="mail" size={20} color={currentTheme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel, { color: currentTheme.colors.text.secondary }]}>Email</Text>
                <Text style={[globalStyles.body, styles.infoValue, { color: currentTheme.colors.text.primary }]}>{user?.email}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: currentTheme.colors.border.light }]}>
              <Ionicons name="call" size={20} color={currentTheme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel, { color: currentTheme.colors.text.secondary }]}>Phone</Text>
                <Text style={[globalStyles.body, styles.infoValue, { color: currentTheme.colors.text.primary }]}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>

            <View style={[styles.infoItem, { borderBottomColor: currentTheme.colors.border.light }]}>
              <Ionicons name="calendar" size={20} color={currentTheme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel, { color: currentTheme.colors.text.secondary }]}>Member Since</Text>
                <Text style={[globalStyles.body, styles.infoValue, { color: currentTheme.colors.text.primary }]}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle, { color: currentTheme.colors.text.primary }]}>Settings</Text>

          <Card style={styles.settingsCard}>
            <Text style={[globalStyles.body, styles.settingsText, { color: currentTheme.colors.text.secondary }]}>Profile settings and hotel management options will be available here.</Text>
          </Card>
        </View>

        {/* Auth Buttons */}
        <View style={styles.logoutSection}>
          {!user && (
            <Button
              title="Quick Login (Hotel Owner)"
              variant="primary"
              onPress={async () => {
                const success = await quickLogin();
                if (success) {
                  showUserFeedback('Login successful!', 'success');
                } else {
                  showUserFeedback('Login failed. Please try again.', 'error');
                }
              }}
              icon={<Ionicons name="log-in-outline" size={16} color={currentTheme.colors.text.inverse} />}
              style={styles.loginButton}
            />
          )}

          {user && (
            <Button
              title="Logout"
              variant="outline"
              onPress={handleLogout}
              icon={<Ionicons name="log-out-outline" size={16} color={currentTheme.colors.error[500]} />}
              style={StyleSheet.flatten([styles.logoutButton, { borderColor: currentTheme.colors.error[500] }])}
              textStyle={{ color: currentTheme.colors.error[500] }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },

  // Header Section
  header: {
    alignItems: 'center',
    padding: theme.spacing[6],
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.sm,
  },

  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
    ...theme.shadows.md,
  },

  title: {
    marginBottom: theme.spacing[1],
  },

  subtitle: {
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
    paddingTop: theme.spacing[6],
  },

  sectionTitle: {
    marginBottom: theme.spacing[4],
  },

  imagePreviewContainer: {
    flexDirection: 'row',
    marginVertical: theme.spacing.md,
  },

  hotelImagePreview: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },

  // Info Card
  infoCard: {
    padding: theme.spacing[4],
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
  },

  infoContent: {
    marginLeft: theme.spacing[3],
    flex: 1,
  },

  infoLabel: {
    marginBottom: theme.spacing[1],
  },

  infoValue: {
  },

  // Settings Card
  settingsCard: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },

  settingsText: {
    textAlign: 'center',
  },

  // Logout Section
  logoutSection: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },

  loginButton: {
    marginBottom: 8,
  },

  logoutButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default HotelProfileScreen;