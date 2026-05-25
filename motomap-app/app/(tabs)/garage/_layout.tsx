import { Stack } from 'expo-router';

export default function GarageLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#f97316',
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Garage' }} />
      <Stack.Screen name="guides" options={{ title: 'DIY Guides' }} />
      <Stack.Screen name="guide" options={{ title: 'Guide' }} />
    </Stack>
  );
}
