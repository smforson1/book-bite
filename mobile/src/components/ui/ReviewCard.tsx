import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import AppText from './AppText';
import RatingStars from './RatingStars';
import ImageCarousel from './ImageCarousel';

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        comment?: string;
        images?: string[];
        createdAt: string;
        user: {
            name: string;
        };
    };
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const { colors } = useTheme();
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    };

    return (
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <AppText variant="h3" bold>{review.user.name}</AppText>
                        <AppText variant="caption" color={colors.textLight}>
                            {formatDate(review.createdAt)}
                        </AppText>
                    </View>
                    <RatingStars rating={review.rating} readonly size={16} />
                </View>

                {review.comment && (
                    <AppText variant="body" style={styles.comment}>
                        {review.comment}
                    </AppText>
                )}

                {review.images && review.images.length > 0 && (
                    <View style={styles.imagesContainer}>
                        {review.images.length === 1 ? (
                            <Image
                                source={{ uri: review.images[0] }}
                                style={styles.singleImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <ImageCarousel
                                images={review.images}
                                height={200}
                                width={SCREEN_WIDTH - 80}
                                borderRadius={8}
                            />
                        )}
                    </View>
                )}
            </Card.Content>
        </Card>
    );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    userInfo: {
        flex: 1,
    },
    comment: {
        marginTop: 8,
        lineHeight: 20,
    },
    imagesContainer: {
        marginTop: 16,
    },
    singleImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
});
