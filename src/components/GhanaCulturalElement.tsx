import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface GhanaCulturalElementProps {
  type: 'kente-border' | 'adinkra-symbol' | 'cultural-header' | 'ghana-flag';
  text?: string;
  symbol?: string;
  style?: any;
}

const GhanaCulturalElement: React.FC<GhanaCulturalElementProps> = ({ 
  type, 
  text, 
  symbol, 
  style 
}) => {
  const renderKenteBorder = () => (
    <View style={[styles.kenteBorderContainer, style]}>
      <View style={styles.kenteBorderTop} />
      <View style={styles.kenteBorderRight} />
      <View style={styles.kenteBorderBottom} />
      <View style={styles.kenteBorderLeft} />
    </View>
  );

  const renderAdinkraSymbol = () => (
    <View style={[styles.adinkraContainer, style]}>
      <Text style={styles.adinkraSymbol}>{symbol || '⭐'}</Text>
    </View>
  );

  const renderCulturalHeader = () => (
    <View style={[styles.culturalHeaderContainer, style]}>
      <View style={styles.culturalHeaderPattern} />
      <Text style={styles.culturalHeaderText}>{text || 'Ghana'}</Text>
      <View style={styles.culturalHeaderPattern} />
    </View>
  );

  const renderGhanaFlag = () => (
    <View style={[styles.flagContainer, style]}>
      <View style={styles.redStripe} />
      <View style={styles.yellowStripe} />
      <View style={styles.greenStripe} />
      <View style={styles.blackStarContainer}>
        <Text style={styles.blackStar}>★</Text>
      </View>
    </View>
  );

  switch (type) {
    case 'kente-border':
      return renderKenteBorder();
    case 'adinkra-symbol':
      return renderAdinkraSymbol();
    case 'cultural-header':
      return renderCulturalHeader();
    case 'ghana-flag':
      return renderGhanaFlag();
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  // Kente border styles
  kenteBorderContainer: {
    position: 'relative',
    width: '100%',
    height: 8,
  },
  kenteBorderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.error[500], // Using error color as red
  },
  kenteBorderRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.warning[500], // Using warning color as yellow
  },
  kenteBorderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.success[500], // Using success color as green
  },
  kenteBorderLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.colors.error[500], // Using error color as red
  },
  
  // Adinkra symbol styles
  adinkraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adinkraSymbol: {
    fontSize: 24,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  
  // Cultural header styles
  culturalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  culturalHeaderPattern: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.warning[500],
  },
  culturalHeaderText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as '700',
    color: theme.colors.text.primary,
    marginHorizontal: theme.spacing.md,
    textTransform: 'uppercase',
  },
  
  // Ghana flag styles
  flagContainer: {
    width: 120,
    height: 80,
    position: 'relative',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.sm,
  },
  redStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '33.33%',
    backgroundColor: theme.colors.error[500],
  },
  yellowStripe: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: '33.33%',
    backgroundColor: theme.colors.warning[500],
  },
  greenStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '33.33%',
    backgroundColor: theme.colors.success[500],
  },
  blackStarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackStar: {
    fontSize: 32,
    color: theme.colors.text.primary,
  },
});

export default GhanaCulturalElement;