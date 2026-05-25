import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Part } from '../types';

export async function cacheParts(bikeId: string, parts: Part[]): Promise<void> {
  await AsyncStorage.setItem(`anatomy:${bikeId}`, JSON.stringify(parts));
}

export async function loadCachedParts(bikeId: string): Promise<Part[] | null> {
  const raw = await AsyncStorage.getItem(`anatomy:${bikeId}`);
  return raw ? (JSON.parse(raw) as Part[]) : null;
}
