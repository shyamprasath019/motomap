import { Stack } from 'expo-router';

export default function DiagnoseLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#f97316',
        headerTitleStyle: { fontWeight: '700', color: '#111827' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Snap & Diagnose' }} />
      <Stack.Screen name="result" options={{ title: 'Diagnosis Result' }} />
    </Stack>
  );
}
