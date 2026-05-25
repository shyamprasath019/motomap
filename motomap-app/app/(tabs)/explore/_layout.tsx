import { Stack } from 'expo-router';

export default function ExploreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#f97316',
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Select Bike' }} />
      <Stack.Screen name="anatomy" options={{ title: 'Anatomy Map' }} />
      <Stack.Screen name="part" options={{ title: 'Part Detail' }} />
    </Stack>
  );
}
