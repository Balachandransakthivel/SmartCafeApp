import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useFeedback } from '@/hooks/useFeedback';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const { user } = useAuth();
  const { addFeedback, getFeedbackByOrder } = useFeedback();
  const { orders } = useOrders();
  const { showAlert } = useAlert();

  const orderId = params.orderId as string;
  const order = orders.find(o => o.id === orderId);
  const existingFeedback = getFeedbackByOrder(orderId);

  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  if (!order || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
          </Pressable>
          <Text style={styles.title}>Feedback</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={Colors.mediumGray} />
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      showAlert('Rating Required', 'Please select a star rating');
      return;
    }

    if (!comment.trim()) {
      showAlert('Comment Required', 'Please share your feedback');
      return;
    }

    setSubmitting(true);
    const feedback = await addFeedback(
      orderId,
      user.id,
      user.name,
      rating,
      comment.trim()
    );
    setSubmitting(false);

    showAlert(
      'Thank You!',
      `Your feedback has been submitted. Sentiment: ${feedback.sentiment.toUpperCase()}`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Rate Your Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Info */}
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.orderAmount}>₹{order.finalAmount}</Text>
        </View>

        {/* Star Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                style={({ pressed }) => [
                  styles.starButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setRating(star)}
              >
                <MaterialIcons
                  name={star <= rating ? 'star' : 'star-border'}
                  size={48}
                  color={star <= rating ? Colors.primary : Colors.mediumGray}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share your feedback</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.mediumGray}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={styles.aiInfo}>
            <MaterialIcons name="psychology" size={16} color={Colors.primary} />
            <Text style={styles.aiInfoText}>
              AI will analyze your feedback for sentiment and categories
            </Text>
          </View>
        </View>

        {/* Existing Feedback (if any) */}
        {existingFeedback && (
          <View style={styles.existingFeedback}>
            <View style={styles.sentimentBadge}>
              <MaterialIcons
                name={
                  existingFeedback.sentiment === 'positive'
                    ? 'sentiment-satisfied'
                    : existingFeedback.sentiment === 'negative'
                    ? 'sentiment-dissatisfied'
                    : 'sentiment-neutral'
                }
                size={20}
                color={
                  existingFeedback.sentiment === 'positive'
                    ? Colors.success
                    : existingFeedback.sentiment === 'negative'
                    ? Colors.error
                    : Colors.warning
                }
              />
              <Text style={styles.sentimentText}>
                {existingFeedback.sentiment.toUpperCase()}
              </Text>
            </View>
            <View style={styles.categories}>
              {existingFeedback.categories.map((cat, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            CommonStyles.primaryButton,
            pressed && { opacity: 0.8 },
            submitting && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={CommonStyles.buttonText}>
            {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  orderDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  orderAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  starButton: {
    padding: Spacing.sm,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.primary,
  },
  commentInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
    minHeight: 120,
    marginBottom: Spacing.sm,
  },
  aiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  aiInfoText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.mediumGray,
    fontStyle: 'italic',
  },
  existingFeedback: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sentimentText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryTagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.background,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.mediumGray,
    marginTop: Spacing.md,
  },
});
