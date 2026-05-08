import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, Pressable, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MENU_ITEMS } from '@/services/mockData';
import { useCart } from '@/hooks/useCart';
import { useAlert } from '@/template';
import { parseVoiceCommand, formatVoiceConfirmation } from '@/services/voiceOrdering';
import { MenuItemCard, CategoryPills, VoiceOrderButton } from '@/components';
import { Colors, Spacing, BorderRadius, Typography, GlowShadows } from '@/constants/theme';

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { addToCart, itemCount } = useCart();
  const { showAlert } = useAlert();

  const initialCategory = (params.category as string) || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceTextModal, setShowVoiceTextModal] = useState(false);
  const [voiceTextInput, setVoiceTextInput] = useState('');

  React.useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    }
  }, [params.category]);

  const categories = ['All', 'Coffee', 'Burger', 'Pizza', 'Drinks', 'Snacks', 'Dessert'];

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (item: (typeof MENU_ITEMS)[0]) => {
    addToCart(item, 1);
    showAlert('Added to Cart', `${item.name} has been added to your cart`);
  };

  const processVoiceOrder = useCallback((transcript: string) => {
    if (transcript === '__native_fallback__') {
      setShowVoiceTextModal(true);
      return;
    }
    const { items, confidence } = parseVoiceCommand(transcript, MENU_ITEMS);
    if (items.length > 0) {
      items.forEach(({ item, quantity }) => addToCart(item, quantity));
      showAlert('Voice Order Added!', `${formatVoiceConfirmation(items)}\n\nConfidence: ${Math.round(confidence * 100)}%`);
    } else {
      showAlert('Not Recognised', `Could not find items for: "${transcript}"\n\nTry saying item names like "2 coffees" or "1 burger".`);
    }
  }, [addToCart, showAlert]);

  const handleNativeVoiceSubmit = () => {
    if (!voiceTextInput.trim()) return;
    setShowVoiceTextModal(false);
    processVoiceOrder(voiceTextInput.trim());
    setVoiceTextInput('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
        {itemCount > 0 && (
          <Pressable
            style={({ pressed }) => [styles.cartBtn, GlowShadows.orangeSm, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <MaterialIcons name="shopping-cart" size={22} color="#fff" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color={Colors.textDim} style={{ marginRight: Spacing.sm }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search coffee, burger..."
          placeholderTextColor={Colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <MaterialIcons name="close" size={18} color={Colors.textDim} />
          </Pressable>
        )}
      </View>

      {/* Voice Order */}
      <VoiceOrderButton onVoiceCommand={processVoiceOrder} />

      {/* Categories */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onPress={() => router.push(`/item-details?id=${item.id}` as any)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={64} color={Colors.textDim} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        )}
      />

      {/* Native Voice Text Modal */}
      <Modal visible={showVoiceTextModal} transparent animationType="fade" onRequestClose={() => setShowVoiceTextModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalGlow} />
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <MaterialIcons name="mic" size={30} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Type Your Order</Text>
              <Text style={styles.modalSub}>Speech not available on this device. Type your order below:</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder={'"2 coffees and 1 burger"'}
              placeholderTextColor={Colors.textDim}
              value={voiceTextInput}
              onChangeText={setVoiceTextInput}
              autoFocus
              multiline
            />
            <View style={styles.modalBtns}>
              <Pressable
                style={({ pressed }) => [styles.modalCancel, pressed && { opacity: 0.7 }]}
                onPress={() => { setShowVoiceTextModal(false); setVoiceTextInput(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalConfirm, GlowShadows.orangeSm, pressed && { opacity: 0.85 }]}
                onPress={handleNativeVoiceSubmit}
              >
                <MaterialIcons name="add-shopping-cart" size={18} color="#fff" />
                <Text style={styles.modalConfirmText}>Add to Cart</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgBase },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  cartBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  clearBtn: { padding: Spacing.sm },

  list: { paddingHorizontal: Spacing.lg },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textDim,
    marginTop: Spacing.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 24,
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    opacity: 0.08,
  },
  modalHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: Colors.bgBase,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.md },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textDim,
    fontWeight: Typography.fontWeight.medium,
  },
  modalConfirm: {
    flex: 2,
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
});
