import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useFeedback } from '@/hooks/useFeedback';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export default function FeedbackAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { feedbacks, getFeedbackStats } = useFeedback();

  const stats = getFeedbackStats();

  const getSentimentIcon = (sentiment: string): keyof typeof MaterialIcons.glyphMap => {
    switch (sentiment) {
      case 'positive':
        return 'sentiment-satisfied';
      case 'negative':
        return 'sentiment-dissatisfied';
      default:
        return 'sentiment-neutral';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return Colors.success;
      case 'negative':
        return Colors.error;
      default:
        return Colors.warning;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Feedback Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
          <MaterialIcons name="sentiment-satisfied" size={32} color={Colors.background} />
          <Text style={styles.statValue}>{stats.positive}</Text>
          <Text style={styles.statLabel}>Positive</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.warning }]}>
          <MaterialIcons name="sentiment-neutral" size={32} color={Colors.background} />
          <Text style={styles.statValue}>{stats.neutral}</Text>
          <Text style={styles.statLabel}>Neutral</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.error }]}>
          <MaterialIcons name="sentiment-dissatisfied" size={32} color={Colors.background} />
          <Text style={styles.statValue}>{stats.negative}</Text>
          <Text style={styles.statLabel}>Negative</Text>
        </View>
      </View>

      {/* Average Rating */}
      <View style={styles.avgRatingCard}>
        <Text style={styles.avgRatingLabel}>Average Rating</Text>
        <View style={styles.avgRatingRow}>
          <Text style={styles.avgRatingValue}>{stats.avgRating.toFixed(1)}</Text>
          <MaterialIcons name="star" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.avgRatingTotal}>Based on {stats.total} reviews</Text>
      </View>

      {/* Feedback List */}
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="feedback" size={64} color={Colors.mediumGray} />
            <Text style={styles.emptyText}>No feedback yet</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.feedbackDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.sentimentBadge,
                  { backgroundColor: getSentimentColor(item.sentiment) },
                ]}
              >
                <MaterialIcons
                  name={getSentimentIcon(item.sentiment)}
                  size={20}
                  color={Colors.background}
                />
                <Text style={styles.sentimentText}>{item.sentiment.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name={star <= item.rating ? 'star' : 'star-border'}
                  size={16}
                  color={Colors.primary}
                />
              ))}
              <Text style={styles.ratingText}>({item.rating}/5)</Text>
            </View>

            <Text style={styles.comment}>{item.comment}</Text>

            <View style={styles.categories}>
              {item.categories.map((cat, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.background,
    marginTop: 2,
  },
  avgRatingCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avgRatingLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
  },
  avgRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  avgRatingValue: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  avgRatingTotal: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  feedbackCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  feedbackDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  sentimentText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: Spacing.md,
  },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginLeft: Spacing.sm,
  },
  comment: {
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryTag: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryTagText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.mediumGray,
    marginTop: Spacing.md,
  },
});
