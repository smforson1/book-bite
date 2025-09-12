import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, Card, Input, StarRating } from '../../components';
import { theme } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';

// Types for navigation
type WriteReviewRouteParams = {
  WriteReview: {
    targetId: string;
    targetType: 'hotel' | 'restaurant';
    targetName: string;
  };
}

type WriteReviewScreenRouteProp = RouteProp<WriteReviewRouteParams, 'WriteReview'>;
type WriteReviewScreenNavigationProp = StackNavigationProp<WriteReviewRouteParams, 'WriteReview'>;

const WriteReviewScreen: React.FC = () => {
  const navigation = useNavigation<WriteReviewScreenNavigationProp>();
  const route = useRoute<WriteReviewScreenRouteProp>();
  const { targetId, targetType, targetName } = route.params;
  
  const { user } = useAuth();
  const { createReview } = useReview();
  
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to write a review.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (title.trim().length === 0) {
      Alert.alert('Title Required', 'Please provide a title for your review.');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Comment Too Short', 'Please write at least 10 characters in your review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        userId: user.id,
        targetId,
        targetType,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        isVerified: true, // Will be verified by checking user's booking/order history
      });

      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. Your review has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.targetInfo}>
          <Text style={styles.targetType}>
            {targetType === 'hotel' ? 'Hotel' : 'Restaurant'}
          </Text>
          <Text style={styles.targetName}>{targetName}</Text>
        </Card>

        <Card style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          <Text style={styles.sectionSubtitle}>
            How would you rate your experience?
          </Text>
          
          <View style={styles.ratingContainer}>
            <StarRating
              rating={rating}
              size={40}
              interactive={true}
              onRatingChange={setRating}
            />
            <Text style={styles.ratingDescription}>
              {getRatingDescription(rating)}
            </Text>
          </View>
        </Card>

        <Card style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Write Your Review</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Review Title *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your review a title"
              placeholderTextColor={theme.colors.text.tertiary}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{title.length}/100</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Review Comment *</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Share details about your experience"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{comment.length}/1000</Text>
          </View>
        </Card>

        <Card style={styles.guidelinesSection}>
          <View style={styles.guidelinesHeader}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          </View>
          <Text style={styles.guidelinesText}>
            • Be honest and helpful in your review{'\n'}
            • Focus on your personal experience{'\n'}
            • Avoid inappropriate language{'\n'}
            • Don't include personal information{'\n'}
            • Reviews are public and can be seen by everyone
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.submitContainer}>
        <Button
          title={isSubmitting ? "Submitting..." : "Submit Review"}
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0 || title.trim().length === 0 || comment.trim().length < 10}
          style={styles.submitButton}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  targetInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  targetType: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  targetName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingDescription: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  reviewSection: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    minHeight: 120,
  },
  characterCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  guidelinesSection: {
    marginBottom: theme.spacing.lg,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  guidelinesTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  guidelinesText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  submitContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  submitButton: {
    width: '100%',
  },
});

export default WriteReviewScreen;