import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ColorPicker from '../components/ColorPicker';
import CheerButton from '../components/CheerButton';
import { getSocket } from '../services/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

interface Props {
  route: any;
}

async function getUserId(): Promise<string> {
  let userId = await AsyncStorage.getItem('userId');
  if (!userId) {
    userId = uuid.v4() as string;
    await AsyncStorage.setItem('userId', userId);
  }
  return userId;
}

export default function CheerScreen({ route }: Props) {
  const { performer } = route.params;
  const [selectedColor, setSelectedColor] = useState('#FF4757');
  const [remaining, setRemaining] = useState(5);
  const [cooldown, setCooldown] = useState(0);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [userId, setUserId] = useState('');
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getUserId().then(setUserId);

    const socket = getSocket();

    socket.on('cheer-success', (data: { remaining: number }) => {
      setRemaining(data.remaining);
      setRateLimitMsg('');
    });

    socket.on('rate-limited', (data: { retryAfter: number; message: string }) => {
      setRemaining(0);
      setCooldown(data.retryAfter);
      setRateLimitMsg(data.message);
      startCooldownTimer(data.retryAfter);
    });

    return () => {
      socket.off('cheer-success');
      socket.off('rate-limited');
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  function startCooldownTimer(seconds: number) {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    let remaining = seconds;
    cooldownTimer.current = setInterval(() => {
      remaining -= 1;
      setCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(cooldownTimer.current!);
        cooldownTimer.current = null;
        setRemaining(5);
        setRateLimitMsg('');
      }
    }, 1000);
  }

  function handleCheer() {
    if (!userId || cooldown > 0) return;
    const socket = getSocket();
    socket.emit('cheer', {
      userId,
      performerId: performer._id,
      color: selectedColor,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.performerName}>{performer.name}</Text>
      <Text style={styles.subtitle}>为 TA 应援!</Text>
      <ColorPicker selectedColor={selectedColor} onSelectColor={setSelectedColor} />
      <CheerButton
        color={selectedColor}
        onPress={handleCheer}
        disabled={cooldown > 0}
        cooldown={cooldown}
        remaining={remaining}
      />
      {rateLimitMsg ? (
        <Text style={styles.rateLimitMsg}>{rateLimitMsg}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 16, alignItems: 'center' },
  performerName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#aaa', marginTop: 8, marginBottom: 20 },
  rateLimitMsg: { marginTop: 16, fontSize: 14, color: '#FF6B81', textAlign: 'center', paddingHorizontal: 20 },
});
