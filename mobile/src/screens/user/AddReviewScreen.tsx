import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/ui/AppText';
import RatingStars from '../../components/ui/RatingStars';
import ImageUpload from '../../components/ui/ImageUpload';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api';

export default function AddReviewScreen({ route, navigation }: any) {
    const { colors, spacing } = useTheme();
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={[styles.content, { padding: spacing.l }]}>
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
                            outlineColor={colors.border}
                            activeOutlineColor={colors.primary}
                            style={[styles.textInput, { backgroundColor: colors.surface }]}
                            theme={{ colors: { primary: colors.primary, text: colors.text, placeholder: colors.textLight } }}
                        />
                    </View>

                    <View style={styles.section}>
                        <AppText variant="h3" bold style={styles.label}>
                            Add Photos (Optional)
                        </AppText>
                        <ImageUpload onImageUploaded={handleImageUpload} />

                        {images.length > 0 && (
                            <View style={[styles.imagePreview, { backgroundColor: colors.surface }]}>
                                <AppText variant="caption" color={colors.textLight}>
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
                        buttonColor={colors.primary}
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
    container: { flex: 1 },
    content: {},
    title: { marginBottom: 24 },
    section: { marginBottom: 24 },
    label: { marginBottom: 12 },
    textInput: {},
    imagePreview: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
    },
    submitButton: {
        marginTop: 20,
        paddingVertical: 8,
    },
});
