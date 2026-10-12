import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';

const COURSES = ['Starter', 'Main', 'Dessert'];
const COLORS = {
  bg: '#FFF8F0', card: '#FFFFFF', primary: '#B5451B', dark: '#2B1B12',
  muted: '#7A6A5F', border: '#E6D8CB', error: '#C0392B', success: '#2E7D32',
};

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'add'
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const timer = useRef(null);

  const showMessage = (text) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), 3000);
  };

  const addItem = (item) => {
    // Newest item is shown at the top; the list re-renders automatically.
    setItems((prev) => [{ id: Date.now().toString(), ...item }, ...prev]);
    setScreen('home');
    showMessage(`"${item.name}" was added to the menu.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Chef's Menu Manager</Text>
        <Text style={styles.subtitle}>
          {screen === 'home' ? 'Your menu' : 'Add a menu item'}
        </Text>
      </View>
      {screen === 'home' ? (
        <HomeScreen
          items={items}
          message={message}
          onAdd={() => setScreen('add')}
        />
      ) : (
        <AddScreen onSave={addItem} onCancel={() => setScreen('home')} />
      )}
    </SafeAreaView>
  );
}

function HomeScreen({ items, message, onAdd }) {
  return (
    <View style={styles.body}>
      {!!message && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {message}</Text>
        </View>
      )}
      <Text style={styles.count}>
        {items.length} {items.length === 1 ? 'item' : 'items'} on the menu
      </Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={items.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No menu items yet</Text>
            <Text style={styles.emptyText}>
              Tap "Add Menu Item" below to create your first dish.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.price}>R {item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.course}</Text>
            </View>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={onAdd}>
        <Text style={styles.primaryBtnText}>+ Add Menu Item</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddScreen({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Please enter the dish name.';
    if (!description.trim()) e.description = 'Please enter a description.';
    if (!course) e.course = 'Please select a course.';
    const p = parseFloat(price.replace(',', '.'));
    if (!price.trim()) e.price = 'Please enter a price.';
    else if (isNaN(p) || !/^\d+([.,]\d{1,2})?$/.test(price.trim()))
      e.price = 'Price must be a valid number, e.g. 85 or 85.50.';
    else if (p <= 0) e.price = 'Price must be greater than 0.';
    return e;
  };

  const save = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (Platform.OS !== 'web') Alert.alert('Missing information', 'Please fix the highlighted fields.');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      course,
      price: parseFloat(price.replace(',', '.')),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.body}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Dish Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="e.g. Grilled Lamb Chops"
          placeholderTextColor={COLORS.muted}
          value={name}
          onChangeText={setName}
        />
        {!!errors.name && <Text style={styles.error}>{errors.name}</Text>}

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline, errors.description && styles.inputError]}
          placeholder="Describe the dish, ingredients, etc."
          placeholderTextColor={COLORS.muted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {!!errors.description && <Text style={styles.error}>{errors.description}</Text>}

        <Text style={styles.label}>Course</Text>
        <View style={[styles.pickerWrap, errors.course && styles.inputError]}>
          <Picker
            selectedValue={course}
            onValueChange={setCourse}
            style={styles.picker}
            dropdownIconColor={COLORS.dark}
          >
            <Picker.Item label="Select a course..." value="" color={COLORS.muted} />
            {COURSES.map((c) => (
              <Picker.Item key={c} label={c} value={c} color={COLORS.dark} />
            ))}
          </Picker>
        </View>
        {!!errors.course && <Text style={styles.error}>{errors.course}</Text>}

        <Text style={styles.label}>Price (R)</Text>
        <TextInput
          style={[styles.input, errors.price && styles.inputError]}
          placeholder="e.g. 120.00"
          placeholderTextColor={COLORS.muted}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
        {!!errors.price && <Text style={styles.error}>{errors.price}</Text>}

        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={save}>
          <Text style={styles.primaryBtnText}>Save Menu Item</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onCancel}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 15, color: '#FBE3D6', marginTop: 2 },
  body: { flex: 1, padding: 20 },
  count: { fontSize: 14, color: COLORS.muted, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dishName: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.dark, marginRight: 8 },
  price: { fontSize: 17, fontWeight: '700', color: COLORS.primary },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#FBE3D6', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, marginVertical: 8,
  },
  badgeText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  desc: { fontSize: 15, color: COLORS.muted, lineHeight: 21 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  emptyBox: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.dark, marginBottom: 6 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  successBox: {
    backgroundColor: '#E8F5E9', borderColor: COLORS.success, borderWidth: 1,
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  successText: { color: COLORS.success, fontWeight: '600', fontSize: 15 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.dark,
  },
  multiline: { minHeight: 100 },
  inputError: { borderColor: COLORS.error },
  pickerWrap: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, overflow: 'hidden',
  },
  picker: { color: COLORS.dark },
  error: { color: COLORS.error, fontSize: 13, marginTop: 4 },
  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 20 },
  secondaryBtnText: { color: COLORS.muted, fontSize: 16, fontWeight: '600' },
});
