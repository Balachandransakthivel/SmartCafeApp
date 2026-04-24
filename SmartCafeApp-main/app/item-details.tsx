import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { MENU_ITEMS } from '@/services/mockData';
import { useCart } from '@/hooks/useCart';
import { useAlert } from '@/template';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export default function ItemDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();

  const item = MENU_ITEMS.find((i) => i.id === params.id);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color={Colors.error} />
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addToCart(item, quantity, specialInstructions);
    showAlert('Added to Cart', `${quantity}x ${item.name} added to cart`);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 100, Spacing.xl) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Item Image */}
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {item.bestseller && (
              <View style={styles.bestsellerBadge}>
                <MaterialIcons name="star" size={16} color={Colors.background} />
                <Text style={styles.badgeText}>Bestseller</Text>
              </View>
            )}
            <View style={styles.vegBadge}>
              <View
                style={[
                  styles.vegDot,
                  item.veg ? styles.vegDotGreen : styles.vegDotRed,
                ]}
              />
              <Text style={styles.badgeText}>{item.veg ? 'Veg' : 'Non-Veg'}</Text>
            </View>
          </View>

          {/* Item Details */}
          <View style={styles.content}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.rating}>
                <MaterialIcons name="star" size={20} color={Colors.primary} />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
              </View>
              <View style={styles.prepTime}>
                <MaterialIcons name="access-time" size={18} color={Colors.mediumGray} />
                <Text style={styles.prepTimeText}>{item.preparationTime} mins</Text>
              </View>
            </View>

            <Text style={styles.price}>₹{item.price}</Text>

            {/* Quantity Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControl}>
                <Pressable
                  style={({ pressed }) => [
                    styles.quantityButton,
                    pressed && { opacity: 0.7 },
                    quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                >
                  <MaterialIcons name="remove" size={24} color={Colors.darkText} />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.quantityButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <MaterialIcons name="add" size={24} color={Colors.darkText} />
                </Pressable>
              </View>
            </View>

            {/* Special Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Extra spicy, no onions..."
                placeholderTextColor={Colors.mediumGray}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        {/* Add to Cart Footer */}
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
          ]}
        >
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₹{item.price * quantity}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              CommonStyles.primaryButton,
              pressed && { opacity: 0.8 },
              !item.available && { opacity: 0.5 },
            ]}
            onPress={handleAddToCart}
            disabled={!item.available}
          >
            <MaterialIcons name="shopping-cart" size={20} color={Colors.background} />
            <Text style={[CommonStyles.buttonText, { marginLeft: Spacing.sm }]}>
              {item.available ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  bestsellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vegDotGreen: {
    backgroundColor: Colors.success,
  },
  vegDotRed: {
    backgroundColor: Colors.error,
  },
  badgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  name: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.base,
    color: Colors.mediumGray,
    lineHeight: Typography.fontSize.base * 1.5,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  reviewsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prepTimeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
  },
  price: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xl,
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
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
    marginHorizontal: Spacing.lg,
    minWidth: 32,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
    height: 80,
    textAlignVertical: 'top',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  totalAmount: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.error,
    marginTop: Spacing.md,
  },
});
