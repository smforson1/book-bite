import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReviewCard, ReviewSummary } from '../../components';
import { theme } from '../../styles/theme';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContext';
import { Review } from '../../types';

// Types for navigation
type ReviewsListRouteParams = {
  ReviewsList: {
    targetId: string;
    targetType: 'hotel' | 'restaurant';
    targetName: string;
  };
}

type ReviewsListScreenRouteProp = RouteProp<ReviewsListRouteParams, 'ReviewsList'>;
type ReviewsListScreenNavigationProp = StackNavigationProp<ReviewsListRouteParams, 'ReviewsList'>;

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

const ReviewsListScreen: React.FC = () => {
  const navigation = useNavigation<ReviewsListScreenNavigationProp>();
  const route = useRoute<ReviewsListScreenRouteProp>();
  const { targetId, targetType, targetName } = route.params;
  
  const { user } = useAuth();
  const { 
    getReviewsByTarget, 
    getReviewSummary, 
    markReviewHelpful, 
    canUserReview 
  } = useReview();
  
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const summary = getReviewSummary(targetId, targetType);
  const canWrite = user ? canUserReview(user.id, targetId, targetType) : false;

  useEffect(() => {
    loadAndSortReviews();
  }, [targetId, targetType, sortBy, filterRating]);

  const loadAndSortReviews = () => {
    let allReviews = getReviewsByTarget(targetId, targetType);
    
    // Apply rating filter
    if (filterRating !== null) {
      allReviews = allReviews.filter(review => review.rating === filterRating);
    }
    
    // Apply sorting
    const sortedReviews = [...allReviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });
    
    setReviews(sortedReviews);
  };

  const handleHelpfulPress = async (reviewId: string) => {
    try {
      await markReviewHelpful(reviewId);
      loadAndSortReviews(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to mark review as helpful');
    }
  };

  const handleWriteReview = () => {
    // @ts-ignore - Navigation params will be properly typed in actual navigation setup
    navigation.navigate('WriteReview', {
      targetId,
      targetType,
      targetName,
    });
  };

  const renderSortButton = (option: SortOption, label: string) => (
    <TouchableOpacity
      key={option}
      style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
      onPress={() => setSortBy(option)}
    >
      <Text style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterButton = (rating: number | null, label: string) => (
    <TouchableOpacity
      key={rating || 'all'}
      style={[styles.filterButton, filterRating === rating && styles.filterButtonActive]}
      onPress={() => setFilterRating(rating)}
    >
      <Text style={[styles.filterButtonText, filterRating === rating && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <ReviewCard
      review={item}
      userName={`User ${item.userId}`} // In real app, fetch actual user name
      onHelpfulPress={() => handleHelpfulPress(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="star-outline" size={64} color={theme.colors.text.tertiary} />
      <Text style={styles.emptyTitle}>No Reviews Found</Text>
      <Text style={styles.emptySubtitle}>
        {filterRating 
          ? `No ${filterRating}-star reviews found. Try adjusting your filter.`
          : 'No reviews match your current filter settings.'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <ReviewSummary
              summary={summary}
              canWriteReview={canWrite}
              onWriteReviewPress={handleWriteReview}
            />
            
            {/* Sort Options */}
            <View style={styles.controlsContainer}>
              <Text style={styles.controlsTitle}>Sort by</Text>
              <View style={styles.sortContainer}>
                {renderSortButton('newest', 'Newest')}
                {renderSortButton('oldest', 'Oldest')}
                {renderSortButton('highest', 'Highest Rated')}
                {renderSortButton('lowest', 'Lowest Rated')}
                {renderSortButton('helpful', 'Most Helpful')}
              </View>
            </View>

            {/* Filter Options */}
            <View style={styles.controlsContainer}>
              <Text style={styles.controlsTitle}>Filter by Rating</Text>
              <View style={styles.filterContainer}>
                {renderFilterButton(null, 'All')}
                {renderFilterButton(5, '5 Stars')}
                {renderFilterButton(4, '4 Stars')}
                {renderFilterButton(3, '3 Stars')}
                {renderFilterButton(2, '2 Stars')}
                {renderFilterButton(1, '1 Star')}
              </View>
            </View>

            {reviews.length > 0 && (
              <Text style={styles.reviewsCount}>
                Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
      />
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
  listContainer: {
    padding: theme.spacing.md,
  },
  controlsContainer: {
    marginBottom: theme.spacing.lg,
  },
  controlsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sortButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  sortButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  sortButtonTextActive: {
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.warning[500],
    borderColor: theme.colors.warning[500],
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  filterButtonTextActive: {
    color: theme.colors.neutral[0],
    fontWeight: theme.typography.fontWeight.medium,
  },
  reviewsCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});

export default ReviewsListScreen;