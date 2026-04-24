import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMenuManagement } from '@/hooks/useMenuManagement';
import { useAlert } from '@/template';
import { MenuItem } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

type Category = 'Coffee' | 'Burger' | 'Pizza' | 'Drinks' | 'Snacks' | 'Dessert';

export default function MenuManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenuManagement();
  const { showAlert } = useAlert();

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Coffee');
  const [formImage, setFormImage] = useState('');
  const [formVeg, setFormVeg] = useState(true);
  const [formBestseller, setFormBestseller] = useState(false);
  const [formPrepTime, setFormPrepTime] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormImage(item.image);
    setFormVeg(item.veg);
    setFormBestseller(item.bestseller);
    setFormPrepTime(item.preparationTime.toString());
    setShowModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormCategory('Coffee');
    setFormImage('');
    setFormVeg(true);
    setFormBestseller(false);
    setFormPrepTime('');
  };

  const handleSave = async () => {
    if (!formName || !formPrice) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    const itemData = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      veg: formVeg,
      bestseller: formBestseller,
      available: true,
      preparationTime: parseInt(formPrepTime) || 10,
    };

    if (editingItem) {
      await updateMenuItem(editingItem.id, itemData);
      showAlert('Success', 'Menu item updated successfully');
    } else {
      await addMenuItem(itemData);
      showAlert('Success', 'Menu item added successfully');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = (item: MenuItem) => {
    showAlert('Delete Item', `Are you sure you want to delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMenuItem(item.id);
          showAlert('Deleted', 'Menu item removed');
        },
      },
    ]);
  };

  const categories: Category[] = ['Coffee', 'Burger', 'Pizza', 'Drinks', 'Snacks', 'Dessert'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.darkText} />
        </Pressable>
        <Text style={styles.title}>Menu Management</Text>
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
          onPress={openAddModal}
        >
          <MaterialIcons name="add" size={24} color={Colors.background} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.mediumGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu items..."
          placeholderTextColor={Colors.mediumGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.menuCard}>
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Switch
                  value={item.available}
                  onValueChange={() => toggleAvailability(item.id)}
                  trackColor={{ false: Colors.mediumGray, true: Colors.success }}
                  thumbColor={Colors.background}
                />
              </View>
              <Text style={styles.itemCategory}>{item.category}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
              <View style={styles.badges}>
                {item.veg && (
                  <View style={[styles.badge, { backgroundColor: Colors.success }]}>
                    <Text style={styles.badgeText}>VEG</Text>
                  </View>
                )}
                {item.bestseller && (
                  <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.badgeText}>BESTSELLER</Text>
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
                  onPress={() => openEditModal(item)}
                >
                  <MaterialIcons name="edit" size={20} color={Colors.primary} />
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
                  onPress={() => handleDelete(item)}
                >
                  <MaterialIcons name="delete" size={20} color={Colors.error} />
                  <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowModal(false)}>
              <MaterialIcons name="close" size={24} color={Colors.darkText} />
            </Pressable>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.formContent,
              { paddingBottom: Math.max(insets.bottom + 80, Spacing.xl) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Preview */}
            {formImage ? (
              <Image
                source={{ uri: formImage }}
                style={styles.previewImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[styles.previewImage, styles.placeholderImage]}>
                <MaterialIcons name="image" size={48} color={Colors.mediumGray} />
              </View>
            )}

            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Latte Coffee"
              placeholderTextColor={Colors.mediumGray}
              value={formName}
              onChangeText={setFormName}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the item..."
              placeholderTextColor={Colors.mediumGray}
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Price (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 120"
              placeholderTextColor={Colors.mediumGray}
              value={formPrice}
              onChangeText={setFormPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    formCategory === cat && styles.categoryChipActive,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setFormCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formCategory === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={Colors.mediumGray}
              value={formImage}
              onChangeText={setFormImage}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Preparation Time (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10"
              placeholderTextColor={Colors.mediumGray}
              value={formPrepTime}
              onChangeText={setFormPrepTime}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Vegetarian</Text>
              <Switch
                value={formVeg}
                onValueChange={setFormVeg}
                trackColor={{ false: Colors.mediumGray, true: Colors.success }}
                thumbColor={Colors.background}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Bestseller</Text>
              <Switch
                value={formBestseller}
                onValueChange={setFormBestseller}
                trackColor={{ false: Colors.mediumGray, true: Colors.primary }}
                thumbColor={Colors.background}
              />
            </View>
          </ScrollView>

          {/* Save Button */}
          <View
            style={[
              styles.modalFooter,
              { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
            ]}
          >
            <Pressable
              style={({ pressed }) => [CommonStyles.primaryButton, pressed && { opacity: 0.8 }]}
              onPress={handleSave}
            >
              <Text style={CommonStyles.buttonText}>
                {editingItem ? 'Update Item' : 'Add Item'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 120,
    height: 150,
  },
  itemInfo: {
    flex: 1,
    padding: Spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
  },
  itemCategory: {
    fontSize: Typography.fontSize.sm,
    color: Colors.mediumGray,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkText,
  },
  formContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  placeholderImage: {
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.darkText,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGray,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  categoryChipTextActive: {
    color: Colors.background,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  switchLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.darkText,
  },
  modalFooter: {
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
});
