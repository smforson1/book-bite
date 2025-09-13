import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Ionicons name="shield-checkmark-outline" size={64} color={theme.colors.error[500]} />
          </View>
          <Text style={[globalStyles.h2, styles.title]}>Admin Profile</Text>
          <Text style={[globalStyles.bodyLarge, styles.subtitle]}>Manage your admin account</Text>
        </View>

        {/* Admin Information */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Admin Information</Text>
          
          <Card style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Administrator Name</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>{user?.name || 'Admin User'}</Text>
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
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Admin Since</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="key" size={20} color={theme.colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={[globalStyles.bodySmall, styles.infoLabel]}>Role</Text>
                <Text style={[globalStyles.body, styles.infoValue]}>Platform Administrator</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Admin Settings */}
        <View style={styles.section}>
          <Text style={[globalStyles.h4, styles.sectionTitle]}>Admin Settings</Text>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Ionicons name="settings" size={24} color={theme.colors.text.secondary} />
              <View style={styles.settingContent}>
                <Text style={[globalStyles.body, styles.settingTitle]}>Platform Configuration</Text>
                <Text style={[globalStyles.bodySmall, styles.settingDescription]}>Manage system settings and configurations</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
            
            <View style={styles.settingItem}>
              <Ionicons name="notifications" size={24} color={theme.colors.text.secondary} />
              <View style={styles.settingContent}>
                <Text style={[globalStyles.body, styles.settingTitle]}>Notification Center</Text>
                <Text style={[globalStyles.bodySmall, styles.settingDescription]}>Manage admin notifications and alerts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
            
            <View style={styles.settingItem}>
              <Ionicons name="shield-outline" size={24} color={theme.colors.text.secondary} />
              <View style={styles.settingContent}>
                <Text style={[globalStyles.body, styles.settingTitle]}>Security Settings</Text>
                <Text style={[globalStyles.bodySmall, styles.settingDescription]}>Manage security policies and access controls</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
            
            <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
              <Ionicons name="analytics" size={24} color={theme.colors.text.secondary} />
              <View style={styles.settingContent}>
                <Text style={[globalStyles.body, styles.settingTitle]}>System Reports</Text>
                <Text style={[globalStyles.bodySmall, styles.settingDescription]}>View detailed system analytics and reports</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
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
    backgroundColor: theme.colors.error[50],
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
    padding: theme.spacing[4],
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  
  settingContent: {
    flex: 1,
    marginLeft: theme.spacing[3],
    marginRight: theme.spacing[2],
  },
  
  settingTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  settingDescription: {
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

export default AdminProfileScreen;