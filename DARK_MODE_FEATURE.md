# Dark Mode Feature Implementation

## Overview
This document explains how the dark mode feature has been implemented in the BookBite application. The feature allows users to switch between light and dark themes for better visibility in different lighting conditions and to reduce eye strain.

## Implementation Details

### 1. Theme Context
The dark mode feature is implemented using React Context API with a `ThemeContext` that manages the current theme state.

#### Key Components:
- `ThemeProvider`: Wraps the entire application to provide theme context
- `useTheme`: Custom hook to access theme state and toggle function
- `lightTheme` and `darkTheme`: Theme objects with color definitions

### 2. Theme Definitions
Two theme objects are defined in `src/styles/theme.ts`:
- `lightTheme`: Default light color scheme
- `darkTheme`: Dark color scheme with inverted colors

### 3. Theme Persistence
The selected theme is persisted using AsyncStorage so that user preferences are maintained between app sessions.

### 4. Dynamic Styling
Components use the `useTheme` hook to access the current theme and dynamically adjust their styles.

## How to Use

### For Users
1. Navigate to any dashboard screen (Hotel or Restaurant)
2. Look for the theme toggle button in the top right corner
3. Tap the button to switch between light and dark modes
4. The preference is automatically saved for future sessions

### For Developers
To make components theme-aware:

1. Import the theme context:
```typescript
import { useTheme } from '../contexts/ThemeContext';
```

2. Access the current theme in your component:
```typescript
const { theme: currentTheme } = useTheme();
```

3. Apply theme colors to your styles:
```typescript
<Text style={{ color: currentTheme.colors.text.primary }}>
  Themed Text
</Text>
```

4. For components that need to update when theme changes, wrap them with the ThemeProvider in App.tsx.

## Adding Theme Support to New Components

1. Import the `useTheme` hook
2. Access the current theme colors
3. Apply colors dynamically in your styles
4. Test both light and dark modes

Example:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MyComponent: React.FC = () => {
  const { theme: currentTheme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background.primary }]}>
      <Text style={[styles.text, { color: currentTheme.colors.text.primary }]}>
        This text adapts to the theme
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  text: {
    fontSize: 16,
  },
});

export default MyComponent;
```

## Theme Structure

The theme object contains the following properties:
- `colors`: Color palette with primary, secondary, success, error, warning, neutral, and semantic colors
- `typography`: Font sizes, line heights, and font weights
- `spacing`: Spacing scale for consistent margins and paddings
- `borderRadius`: Border radius values
- `shadows`: Shadow definitions
- `animation`: Animation duration values

## Customization

To customize the themes:
1. Modify the `lightTheme` and `darkTheme` objects in `src/styles/theme.ts`
2. Add new color properties as needed
3. Ensure both themes have consistent property names

## Future Improvements

1. System preference detection to automatically set theme based on device settings
2. Scheduled theme switching (e.g., dark mode at night)
3. Additional themes (high contrast, sepia, etc.)