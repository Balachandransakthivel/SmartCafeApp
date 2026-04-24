import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
  onAddToCart: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onPress, onAddToCart }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}
      onPress={onPress}
    >
      {/* Image */}
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: item.image }}
          style={styles.img}
          contentFit="cover"
          transition={200}
        />
        {item.bestseller && (
          <View style={styles.hotBadge}>
            <MaterialIcons name="local-fire-department" size={10} color="#fff" />
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
        {!item.available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={13} color={Colors.warning} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              !item.available && styles.addBtnDisabled,
              pressed && item.available && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
            onPress={onAddToCart}
            disabled={!item.available}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    height: 112,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 7,
  },
  imgWrap: {
    width: 112,
    height: 112,
    position: 'relative',
    flexShrink: 0,
  },
  img: { width: 112, height: 112 },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  hotText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableText: {
    fontSize: Typography.fontSize.xs,
    color: '#fff',
    fontWeight: Typography.fontWeight.semiBold,
  },
  info: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  rating: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  desc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDim,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  addBtnDisabled: {
    backgroundColor: Colors.bgBase,
    opacity: 0.5,
  },
});
