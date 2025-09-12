import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
  backgroundColor?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  interactive = false,
  onRatingChange,
  color = theme.colors.warning[500],
  backgroundColor = theme.colors.neutral[300],
}) => {
  const handleStarPress = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const renderStar = (index: number) => {
    const isFilled = index < Math.floor(rating);
    const isHalfFilled = index === Math.floor(rating) && rating % 1 >= 0.5;
    
    let iconName: keyof typeof Ionicons.glyphMap;
    let iconColor: string;
    
    if (isFilled) {
      iconName = 'star';
      iconColor = color;
    } else if (isHalfFilled) {
      iconName = 'star-half';
      iconColor = color;
    } else {
      iconName = 'star-outline';
      iconColor = backgroundColor;
    }

    const StarComponent = interactive ? TouchableOpacity : View;
    
    return (
      <StarComponent
        key={index}
        style={styles.star}
        onPress={() => handleStarPress(index)}
        disabled={!interactive}
      >
        <Ionicons name={iconName} size={size} color={iconColor} />
      </StarComponent>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }, (_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 1,
  },
});

export default StarRating;