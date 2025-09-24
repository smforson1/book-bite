import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Components
import { Button, Input, Card } from '../../components';

// Services
import { useAuth } from '../../contexts/AuthContext';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(''); // Not part of User model, but keeping for UI

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    // Simple phone validation for Ghanaian numbers
    const phoneRegex = /^(\+233|0)[\d]{9}$/;
    if (phone && !phoneRegex.test(phone)) {
      Alert.alert('Validation Error', 'Please enter a valid Ghanaian phone number.');
      return;
    }

    setLoading(true);
    
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      
      Alert.alert(
        'Success', 
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#666" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={styles.editAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              style={styles.input}
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="0XX XXX XXXX"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Input
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
              style={{...styles.input, ...styles.textArea}}
            />
          </View>
        </Card>

        <Card style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="lock-closed" size={20} color="#666" />
            <Text style={styles.privacyTitle}>Privacy Settings</Text>
          </View>
          <Text style={styles.privacyText}>
            Your personal information is securely stored and never shared with third parties without your consent.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={loading ? "Saving..." : "Save Changes"}
          onPress={handleSaveProfile}
          disabled={loading}
          loading={loading}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  editAvatarButton: {
    padding: 8,
  },
  editAvatarText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  form: {
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  privacyCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
});

export default EditProfileScreen;