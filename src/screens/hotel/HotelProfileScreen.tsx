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
import { Button, Card } from '../../components';
import ImageUpload from '../../components/ImageUpload';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import { useHotel } from '../../contexts/HotelContext';

const HotelProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { updateHotel } = useHotel();
  const [hotelImages, setHotelImages] = useState<string[]>([]);

  const handleLogout = async () => {
    await logout();
  };

  const handleImagesUploaded = async (imageUrls: string[]) => {
    setHotelImages(imageUrls);
    // In a real app, we would update the hotel with the new images
    // await updateHotel(user?.id || '', { images: imageUrls });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Ionicons name="business-outline" size={64} color={theme.colors.success[500]} />
          </View>
          <Text style={[globalStyles.h2, styles.title]}>Hotel Profile</Text>
          <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Manage your hotel information</Text>
        </View>

        {/* Hotel Images */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Hotel Images</Text>
          <ImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxImages={10}
            allowMultiple={true}
            title="Upload Hotel Photos"
            subtitle="Add photos of your hotel exterior, lobby, rooms, and amenities"
            existingImages={hotelImages}
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
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Hotel Information</Text>
          
          <Card style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="business" size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Hotel Name</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>{user?.name || 'Hotel Name'}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="mail" size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Email</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>{user?.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Phone</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Member Since</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Settings</Text>
          
          <Card style={styles.settingsCard}>
            <Text style={[globalStyles.body, styles.settingsText]}>Profile settings and hotel management options will be available here.</Text>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            icon={<Ionicons name="log-out-outline" size={16} color={theme.colors.error[500]} />}
            style={StyleSheet.flatten([styles.logoutButton, { borderColor: theme.colors.error[500] }])}
            textStyle={{ color: theme.colors.error[500] }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  content: {
    flex: 1,
  },
  
  // Header Section
  header: {
    alignItems: 'center',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.background.primary,
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
    ...theme.shadows.sm,
  },
  
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.success[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
    ...theme.shadows.md,
  },
  
  title: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  
  // Sections
  section: {
    paddingHorizontal: theme.spacing[6],
    marginBottom: theme.spacing[6],
    paddingTop: theme.spacing[6],
  },
  
  sectionTitle: {
    color: theme.colors.text.primary,
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
    borderBottomColor: theme.colors.border.light,
  },
  
  infoContent: {
    marginLeft: theme.spacing[3],
    flex: 1,
  },
  
  infoLabel: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  
  infoValue: {
    color: theme.colors.text.primary,
  },
  
  // Settings Card
  settingsCard: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  
  settingsText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  
  // Logout Section
  logoutSection: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
  },
  
  logoutButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default HotelProfileScreen;