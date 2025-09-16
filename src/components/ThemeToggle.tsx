import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/globalStyles';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <Ionicons 
        name={isDarkMode ? 'sunny' : 'moon'} 
        size={24} 
        color={isDarkMode ? theme.colors.warning[500] : theme.colors.neutral[700]} 
      />
      <Text style={[globalStyles.bodySmall, styles.label]}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.lg,
  },
  label: {
    marginLeft: theme.spacing[2],
  },
});

export default ThemeToggle;