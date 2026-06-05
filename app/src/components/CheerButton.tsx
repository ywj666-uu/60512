import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';

interface Props {
  color: string;
  onPress: () => void;
  disabled: boolean;
  cooldown: number; // seconds remaining
  remaining: number;
}

export default function CheerButton({ color, onPress, disabled, cooldown, remaining }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: disabled ? '#555' : color },
            disabled && styles.disabled,
          ]}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            {disabled ? `冷却中 ${cooldown}s` : '🎉 应援!'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.remainingText}>
        剩余次数: {remaining}/5
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 32 },
  button: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabled: { opacity: 0.6 },
  buttonText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  remainingText: { marginTop: 12, fontSize: 14, color: '#aaa' },
});
