import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // Settings state
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
  });
  
  const [preferences, setPreferences] = useState({
    darkMode: false,
    autoLocation: true,
    savePaymentMethods: true,
  });

  const handleSaveProfile = async () => {
    try {
      if (updateUser) {
        await updateUser({
          ...user!,
          name: editedUser.name,
          email: editedUser.email,
          phone: editedUser.phone,
        });
      }
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear App Data',
      'This will clear all app data including bookings and orders. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'App data cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderProfileSection = () => (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[globalStyles.h3, styles.sectionTitle]}>Profile Information</Text>
        <TouchableOpacity
          onPress={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
          style={styles.editButton}
        >
          <Ionicons 
            name={isEditing ? 'close' : 'pencil'} 
            size={20} 
            color={theme.colors.primary[500]} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <View style={styles.profileImagePlaceholder}>
          <Ionicons name="person" size={48} color={theme.colors.text.secondary} />
        </View>
        <Text style={styles.profileImageText}>Profile Photo</Text>
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Full Name</Text>
        {isEditing ? (
          <Input
            value={editedUser.name}
            onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
            placeholder="Enter your full name"
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.name || 'Not provided'}</Text>
        )}
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Email</Text>
        {isEditing ? (
          <Input
            value={editedUser.email}
            onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
        )}
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Phone Number</Text>
        {isEditing ? (
          <Input
            value={editedUser.phone}
            onChangeText={(text) => setEditedUser({ ...editedUser, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.fieldValue}>{user?.phone || 'Not provided'}</Text>
        )}
      </View>

      {isEditing && (
        <View style={styles.actionButtons}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleCancelEdit}
            style={styles.cancelButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            style={styles.saveButton}
          />
        </View>
      )}
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card style={styles.section}>
      <Text style={[globalStyles.h3, styles.sectionTitle]}>Notification Settings</Text>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Text style={styles.settingDescription}>Receive push notifications on your device</Text>
        </View>
        <Switch
          value={notifications.pushNotifications}
          onValueChange={(value) => setNotifications({ ...notifications, pushNotifications: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={notifications.pushNotifications ? theme.colors.primary[500] : theme.colors.neutral[400]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <Text style={styles.settingDescription}>Receive important updates via email</Text>
        </View>
        <Switch
          value={notifications.emailNotifications}
          onValueChange={(value) => setNotifications({ ...notifications, emailNotifications: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={notifications.emailNotifications ? theme.colors.primary[500] : theme.colors.neutral[400]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Order Updates</Text>
          <Text style={styles.settingDescription}>Get notified about booking and order status</Text>
        </View>
        <Switch
          value={notifications.orderUpdates}
          onValueChange={(value) => setNotifications({ ...notifications, orderUpdates: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={notifications.orderUpdates ? theme.colors.primary[500] : theme.colors.neutral[400]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Promotions & Offers</Text>
          <Text style={styles.settingDescription}>Receive special offers and promotions</Text>
        </View>
        <Switch
          value={notifications.promotions}
          onValueChange={(value) => setNotifications({ ...notifications, promotions: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={notifications.promotions ? theme.colors.primary[500] : theme.colors.neutral[400]}
        />
      </View>
    </Card>
  );

  const renderAppPreferences = () => (
    <Card style={styles.section}>
      <Text style={[globalStyles.h3, styles.sectionTitle]}>App Preferences</Text>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Text style={styles.settingDescription}>Enable dark theme (Coming Soon)</Text>
        </View>
        <Switch
          value={preferences.darkMode}
          onValueChange={(value) => setPreferences({ ...preferences, darkMode: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={preferences.darkMode ? theme.colors.primary[500] : theme.colors.neutral[400]}
          disabled
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Auto-detect Location</Text>
          <Text style={styles.settingDescription}>Automatically detect your location for better recommendations</Text>
        </View>
        <Switch
          value={preferences.autoLocation}
          onValueChange={(value) => setPreferences({ ...preferences, autoLocation: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={preferences.autoLocation ? theme.colors.primary[500] : theme.colors.neutral[400]}
        />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Save Payment Methods</Text>
          <Text style={styles.settingDescription}>Securely save payment methods for faster checkout</Text>
        </View>
        <Switch
          value={preferences.savePaymentMethods}
          onValueChange={(value) => setPreferences({ ...preferences, savePaymentMethods: value })}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[500] + '40' }}
          thumbColor={preferences.savePaymentMethods ? theme.colors.primary[500] : theme.colors.neutral[400]}
        />
      </View>
    </Card>
  );

  const renderActionButtons = () => (
    <Card style={styles.section}>
      <Text style={[globalStyles.h3, styles.sectionTitle]}>Account Actions</Text>
      
      <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Payment methods management will be available soon!')}>
        <Ionicons name="card" size={24} color={theme.colors.text.secondary} />
        <View style={styles.actionInfo}>
          <Text style={styles.actionLabel}>Payment Methods</Text>
          <Text style={styles.actionDescription}>Manage your saved payment methods</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Address book will be available soon!')}>
        <Ionicons name="location" size={24} color={theme.colors.text.secondary} />
        <View style={styles.actionInfo}>
          <Text style={styles.actionLabel}>Saved Addresses</Text>
          <Text style={styles.actionDescription}>Manage your delivery addresses</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon!')}>
        <Ionicons name="help-circle" size={24} color={theme.colors.text.secondary} />
        <View style={styles.actionInfo}>
          <Text style={styles.actionLabel}>Help & Support</Text>
          <Text style={styles.actionDescription}>Get help or contact support</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}>
        <Ionicons name="shield-checkmark" size={24} color={theme.colors.text.secondary} />
        <View style={styles.actionInfo}>
          <Text style={styles.actionLabel}>Privacy & Security</Text>
          <Text style={styles.actionDescription}>Manage your privacy settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionRow, styles.dangerAction]} onPress={handleClearData}>
        <Ionicons name="trash" size={24} color={theme.colors.danger[500]} />
        <View style={styles.actionInfo}>
          <Text style={[styles.actionLabel, { color: theme.colors.danger[500] }]}>Clear App Data</Text>
          <Text style={styles.actionDescription}>Remove all bookings and orders</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.danger[500]} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionRow, styles.logoutAction]} onPress={handleLogout}>
        <Ionicons name="log-out" size={24} color={theme.colors.primary[500]} />
        <View style={styles.actionInfo}>
          <Text style={[styles.actionLabel, { color: theme.colors.primary[500] }]}>Logout</Text>
          <Text style={styles.actionDescription}>Sign out of your account</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary[500]} />
      </TouchableOpacity>
    </Card>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={64} color={theme.colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No User Found</Text>
          <Text style={styles.emptySubtitle}>Please log in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderProfileSection()}
        {renderNotificationSettings()}
        {renderAppPreferences()}
        {renderActionButtons()}
        
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon={<Ionicons name="log-out-outline" size={16} color={theme.colors.danger[500]} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  profileImageText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  formField: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  fieldValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  actionInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  actionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  dangerAction: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  
  logoutAction: {
    borderBottomWidth: 0,
  },
  logoutContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  logoutButton: {
    borderColor: theme.colors.danger[500],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default UserProfileScreen;