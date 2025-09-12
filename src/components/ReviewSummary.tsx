import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { StarRating } from './StarRating';
import { theme } from '../styles/theme';
import { ReviewSummary as ReviewSummaryType } from '../types';

interface ReviewSummaryProps {
  summary: ReviewSummaryType;
  onSeeAllReviewsPress?: () => void;
  onWriteReviewPress?: () => void;
  canWriteReview?: boolean;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  summary,
  onSeeAllReviewsPress,
  onWriteReviewPress,
  canWriteReview = false,
}) => {
  const renderRatingBar = (rating: number, count: number) => {
    const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
    
    return (
      <View key={rating} style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarLabel}>{rating}</Text>
        <Ionicons name="star" size={12} color={theme.colors.warning[500]} />
        <View style={styles.ratingBarTrack}>
          <View 
            style={[
              styles.ratingBarFill, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  if (summary.totalReviews === 0) {
    return (
      <Card style={styles.container}>
        <View style={styles.noReviewsContainer}>
          <Ionicons name="star-outline" size={48} color={theme.colors.text.tertiary} />
          <Text style={styles.noReviewsTitle}>No reviews yet</Text>
          <Text style={styles.noReviewsSubtitle}>
            Be the first to share your experience
          </Text>
          {canWriteReview && (
            <TouchableOpacity style={styles.writeReviewButton} onPress={onWriteReviewPress}>
              <Text style={styles.writeReviewButtonText}>Write a Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.overallRating}>
          <Text style={styles.averageRating}>{summary.averageRating.toFixed(1)}</Text>
          <StarRating rating={summary.averageRating} size={20} />
          <Text style={styles.totalReviews}>
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </Text>
        </View>
        
        {canWriteReview && (
          <TouchableOpacity style={styles.writeReviewButton} onPress={onWriteReviewPress}>
            <Ionicons name="create-outline" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.writeReviewButtonText}>Write Review</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.ratingBreakdown}>
        <Text style={styles.breakdownTitle}>Rating Breakdown</Text>
        {[5, 4, 3, 2, 1].map(rating => 
          renderRatingBar(rating, summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown])
        )}
      </View>

      {summary.recentReviews.length > 0 && (
        <View style={styles.recentReviews}>
          <View style={styles.recentReviewsHeader}>
            <Text style={styles.recentReviewsTitle}>Recent Reviews</Text>
            {summary.totalReviews > summary.recentReviews.length && (
              <TouchableOpacity onPress={onSeeAllReviewsPress}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {summary.recentReviews.slice(0, 2).map(review => (
            <View key={review.id} style={styles.recentReviewItem}>
              <View style={styles.recentReviewHeader}>
                <StarRating rating={review.rating} size={14} />
                <Text style={styles.recentReviewTitle}>{review.title}</Text>
              </View>
              <Text style={styles.recentReviewComment} numberOfLines={2}>
                {review.comment}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  overallRating: {
    flex: 1,
  },
  averageRating: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  totalReviews: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  writeReviewButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  ratingBreakdown: {
    marginBottom: theme.spacing.lg,
  },
  breakdownTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ratingBarLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    width: 10,
    textAlign: 'right',
    marginRight: theme.spacing.xs,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: theme.colors.warning[500],
  },
  ratingBarCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    width: 20,
    textAlign: 'right',
  },
  recentReviews: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.md,
  },
  recentReviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  recentReviewsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  recentReviewItem: {
    marginBottom: theme.spacing.md,
  },
  recentReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  recentReviewTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  recentReviewComment: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  noReviewsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  noReviewsSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
});

export default ReviewSummary;