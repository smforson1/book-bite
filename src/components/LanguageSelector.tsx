import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../services/storageService';
import { theme } from '../styles/theme';

interface LanguageOption {
  code: string;
  name: string;
  localName: string;
}

const LanguageSelector: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [modalVisible, setModalVisible] = useState(false);

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', localName: 'English' },
    { code: 'tw', name: 'Twi', localName: 'Twi' },
    { code: 'ga', name: 'Ga', localName: 'Gã' },
    { code: 'ee', name: 'Ewe', localName: 'Eʋegbe' },
  ];

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const settings = await storageService.getAppSettings();
      setCurrentLanguage(settings.language);
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const selectLanguage = async (languageCode: string) => {
    try {
      const settings = await storageService.getAppSettings();
      settings.language = languageCode;
      await storageService.saveAppSettings(settings);
      setCurrentLanguage(languageCode);
      setModalVisible(false);
      
      // In a real app, you would trigger a language change event here
      // For now, we'll just show an alert
      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === currentLanguage);
    return lang ? lang.name : 'English';
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => selectLanguage(item.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item.name}</Text>
        <Text style={styles.languageLocalName}>{item.localName}</Text>
      </View>
      {currentLanguage === item.code && (
        <Ionicons name="checkmark" size={24} color={theme.colors.primary[500]} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="language" size={20} color={theme.colors.text.secondary} />
        <Text style={styles.selectorText}>{getCurrentLanguageName()}</Text>
        <Ionicons name="chevron-down" size={16} color={theme.colors.text.tertiary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
  },
  selectorText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold as '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  languageLocalName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default LanguageSelector;