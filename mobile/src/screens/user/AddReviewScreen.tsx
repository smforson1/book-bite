import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/ui/AppText';
import RatingStars from '../../components/ui/RatingStars';
import ImageUpload from '../../components/ui/ImageUpload';
import { COLORS, SPACING } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function AddReviewScreen({ route, navigation }: any) {
    const { businessId, businessName } = route.params;
    const token = useAuthStore((state) => state.token);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (url: string) => {
        setImages([...images, url]);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                `${API_URL}/reviews`,
                {
                    businessId,
                    rating,
                    comment,
                    images,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert('Review submitted successfully!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Failed to submit review', error);
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <AppText variant="h2" style={styles.title}>
                        Review {businessName}
                    </AppText>

                    <View style={styles.section}>
                        <AppText variant="h3" bold style={styles.label}>
                            Your Rating
                        </AppText>
                        <RatingStars
                            rating={rating}
                            onRatingChange={setRating}
                            size={32}
                        />
                    </View>

                    <View style={styles.section}>
                        <AppText variant="h3" bold style={styles.label}>
                            Your Review (Optional)
                        </AppText>
                        <TextInput
                            mode="outlined"
                            placeholder="Share your experience..."
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={5}
                            outlineColor={COLORS.border}
                            activeOutlineColor={COLORS.primary}
                            style={styles.textInput}
                        />
                    </View>

                    <View style={styles.section}>
                        <AppText variant="h3" bold style={styles.label}>
                            Add Photos (Optional)
                        </AppText>
                        <ImageUpload onImageUploaded={handleImageUpload} />

                        {images.length > 0 && (
                            <View style={styles.imagePreview}>
                                <AppText variant="caption" color={COLORS.textLight}>
                                    {images.length} photo(s) uploaded
                                </AppText>
                            </View>
                        )}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || rating === 0}
                        buttonColor={COLORS.primary}
                        style={styles.submitButton}
                    >
                        Submit Review
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        padding: SPACING.l,
    },
    title: {
        marginBottom: SPACING.xl,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    label: {
        marginBottom: SPACING.m,
    },
    textInput: {
        backgroundColor: COLORS.white,
    },
    imagePreview: {
        marginTop: SPACING.m,
        padding: SPACING.m,
        backgroundColor: COLORS.background,
        borderRadius: 8,
    },
    submitButton: {
        marginTop: SPACING.l,
        paddingVertical: SPACING.s,
    },
});
