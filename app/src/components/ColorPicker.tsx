import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = [
  '#FF4757', '#FF6B81', '#FFA502', '#FFDD59',
  '#2ED573', '#7BED9F', '#1E90FF', '#70A1FF',
  '#A855F7', '#D946EF', '#FF69B4', '#FFFFFF',
];

interface Props {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onSelectColor }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>选择应援色</Text>
      <View style={styles.grid}>
        {COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorItem,
              { backgroundColor: color },
              selectedColor === color && styles.selected,
            ]}
            onPress={() => onSelectColor(color)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
});
