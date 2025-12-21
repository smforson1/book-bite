import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card } from 'react-native-paper';
import AppText from './AppText';
import RatingStars from './RatingStars';
import ImageCarousel from './ImageCarousel';
import { COLORS, SPACING, SIZES } from '../../theme';

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
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <AppText variant="h3" bold>{review.user.name}</AppText>
                        <AppText variant="caption" color={COLORS.textLight}>
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
                                width={SIZES.width - 80}
                                borderRadius={SIZES.radius.m}
                            />
                        )}
                    </View>
                )}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.m,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.s,
    },
    userInfo: {
        flex: 1,
    },
    comment: {
        marginTop: SPACING.s,
        lineHeight: 20,
    },
    imagesContainer: {
        marginTop: SPACING.m,
    },
    singleImage: {
        width: '100%',
        height: 200,
        borderRadius: SIZES.radius.m,
    },
});
