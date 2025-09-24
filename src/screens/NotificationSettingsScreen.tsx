import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, Button } from '../components';
import { theme } from '../styles/theme';
import { notificationService } from '../services/notificationService';

interface NotificationSettings {
  pushNotificationsEnabled: boolean;
  orderUpdates: boolean;
  bookingUpdates: boolean;
  paymentUpdates: boolean;
  promotions: boolean;
  emailNotifications: boolean;
}

const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotificationsEnabled: false,
    orderUpdates: true,
    bookingUpdates: true,
    paymentUpdates: true,
    promotions: true,
    emailNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPushNotificationStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const notificationSettings = await notificationService.getNotificationSettings();
      if (notificationSettings) {
        setSettings(notificationSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPushNotificationStatus = async () => {
    const enabled = await notificationService.areNotificationsEnabled();
    setSettings(prev => ({ ...prev, pushNotificationsEnabled: enabled }));
  };

  const handleTogglePushNotifications = async (enabled: boolean) => {
    if (enabled) {
      // Initialize push notifications
      const success = await notificationService.initialize();
      if (success) {
        setSettings(prev => ({ ...prev, pushNotificationsEnabled: true }));
        Alert.alert('Success', 'Push notifications have been enabled');
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive push notifications.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => notificationService.openNotificationSettings()
            }
          ]
        );
      }
    } else {
      // Disable push notifications
      await notificationService.unregisterPushToken();
      setSettings(prev => ({ ...prev, pushNotificationsEnabled: false }));
      Alert.alert('Disabled', 'Push notifications have been disabled');
    }
  };

  const handleToggleSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const success = await notificationService.updateNotificationSettings({
        orderUpdates: settings.orderUpdates,
        bookingUpdates: settings.bookingUpdates,
        paymentUpdates: settings.paymentUpdates,
        promotions: settings.promotions,
        emailNotifications: settings.emailNotifications,
      });

      if (success) {
        Alert.alert('Success', 'Notification settings have been updated');
      } else {
        Alert.alert('Error', 'Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    if (!settings.pushNotificationsEnabled) {
      Alert.alert('Error', 'Please enable push notifications first');
      return;
    }

    try {
      await notificationService.sendTestNotification();
      Alert.alert('Test Sent', 'A test notification has been sent to your device');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const renderSettingItem = (
    title: string,
    description: string,
    key: keyof NotificationSettings,
    icon: string,
    disabled: boolean = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.disabledSetting]}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, disabled && styles.disabledIcon]}>
          <Ionicons
            name={icon as any}
            size={20}
            color={disabled ? theme.colors.text.tertiary : theme.colors.primary[500]}
          />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => {
          if (key === 'pushNotificationsEnabled') {
            handleTogglePushNotifications(value);
          } else {
            handleToggleSetting(key, value);
          }
        }}
        disabled={disabled}
        trackColor={{
          false: theme.colors.neutral[300],
          true: theme.colors.primary[200]
        }}
        thumbColor={settings[key] ? theme.colors.primary[500] : theme.colors.neutral[500]}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Push Notifications */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          {renderSettingItem(
            'Push Notifications',
            'Receive notifications on your device',
            'pushNotificationsEnabled',
            'notifications'
          )}
        </Card>

        {/* Notification Types */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          {renderSettingItem(
            'Order Updates',
            'Get notified about your order status',
            'orderUpdates',
            'restaurant',
            !settings.pushNotificationsEnabled
          )}
          {renderSettingItem(
            'Booking Updates',
            'Get notified about your hotel bookings',
            'bookingUpdates',
            'bed',
            !settings.pushNotificationsEnabled
          )}
          {renderSettingItem(
            'Payment Updates',
            'Get notified about payment confirmations',
            'paymentUpdates',
            'card',
            !settings.pushNotificationsEnabled
          )}
          {renderSettingItem(
            'Promotions & Offers',
            'Receive special offers and promotions',
            'promotions',
            'pricetag',
            !settings.pushNotificationsEnabled
          )}
        </Card>

        {/* Email Notifications */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          {renderSettingItem(
            'Email Notifications',
            'Receive important updates via email',
            'emailNotifications',
            'mail'
          )}
        </Card>

        {/* Test Notification */}
        {settings.pushNotificationsEnabled && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Test Notifications</Text>
            <TouchableOpacity
              style={styles.testButton}
              onPress={sendTestNotification}
            >
              <Ionicons name="send" size={20} color={theme.colors.primary[500]} />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color={theme.colors.info[500]} />
            <Text style={styles.infoTitle}>About Notifications</Text>
          </View>
          <Text style={styles.infoText}>
            Push notifications help you stay updated with your orders, bookings, and important updates. 
            You can customize which types of notifications you want to receive.
          </Text>
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title={saving ? 'Saving...' : 'Save Settings'}
          onPress={saveSettings}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  disabledSetting: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  disabledIcon: {
    backgroundColor: theme.colors.neutral[100],
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  testButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.primary[600],
    marginLeft: theme.spacing.sm,
  },
  infoCard: {
    backgroundColor: theme.colors.info[50],
    borderColor: theme.colors.info[200],
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.info[700],
    marginLeft: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.info[600],
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
  },
});

export default NotificationSettingsScreen;