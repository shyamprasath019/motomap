import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { diagnose, fetchBikes, loginUser, registerUser } from '../../../lib/api';
import { loadToken, saveAuth } from '../../../lib/auth';
import { setDiagnosisBike, setDiagnosisResult } from '../../../lib/diagnosisStore';
import type { Bike } from '../../../types';

type Screen = 'setup' | 'camera' | 'loading';

export default function DiagnoseIndex() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [screen, setScreen] = useState<Screen>('setup');
  const [token, setToken] = useState<string | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [cameraFacing] = useState<CameraType>('back');

  useEffect(() => {
    async function init() {
      const [existingToken, bikeList] = await Promise.all([
        loadToken(),
        fetchBikes().catch(() => [] as Bike[]),
      ]);
      setToken(existingToken);
      setBikes(bikeList);
      setLoadingSetup(false);
    }
    init();
  }, []);

  async function handleAuth() {
    setAuthError('');
    setAuthLoading(true);
    try {
      const result =
        authMode === 'login'
          ? await loginUser(email, password)
          : await registerUser(email, password, displayName || email.split('@')[0]);
      await saveAuth(result.access_token, result.user);
      setToken(result.access_token);
      setShowAuthModal(false);
    } catch {
      setAuthError('Invalid credentials. Try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function captureAndDiagnose() {
    if (!selectedBike || !token) return;
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        if (!photo) return;
        setScreen('loading');
        const result = await diagnose(selectedBike.id, photo.uri, token);
        setDiagnosisResult(result);
        setDiagnosisBike(selectedBike.id);
        router.push('/diagnose/result');
      }
    } catch {
      setScreen('camera');
      Alert.alert('Diagnosis failed', 'Could not process the image. Try again.');
    }
  }

  async function pickFromGallery() {
    if (!selectedBike || !token) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    setScreen('loading');
    try {
      const diagnosis = await diagnose(selectedBike.id, result.assets[0].uri, token);
      setDiagnosisResult(diagnosis);
      setDiagnosisBike(selectedBike.id);
      router.push('/diagnose/result');
    } catch {
      setScreen('setup');
      Alert.alert('Diagnosis failed', 'Could not process the image. Try again.');
    }
  }

  if (loadingSetup) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (screen === 'loading') {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingTitle}>Diagnosing…</Text>
        <Text style={styles.loadingSubtitle}>Claude AI is analysing your photo</Text>
      </SafeAreaView>
    );
  }

  if (screen === 'camera') {
    if (!permission?.granted) {
      return (
        <SafeAreaView style={styles.center}>
          <Text style={styles.errorTitle}>Camera permission needed</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Grant Permission</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing}>
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraHint}>
              Point at a motorcycle part to diagnose
            </Text>
            <TouchableOpacity style={styles.captureBtn} onPress={captureAndDiagnose}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
              <Text style={styles.galleryText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setScreen('setup')}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // Setup screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.setupContent}>
        <Text style={styles.title}>Snap & Diagnose</Text>
        <Text style={styles.subtitle}>
          Take a photo of any part — AI will identify issues.
        </Text>

        {/* Bike selector */}
        <Text style={styles.label}>Select Bike</Text>
        <FlatList
          data={bikes}
          horizontal
          keyExtractor={(b) => b.id}
          showsHorizontalScrollIndicator={false}
          style={styles.bikeList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.bikePill,
                selectedBike?.id === item.id && styles.bikePillActive,
              ]}
              onPress={() => setSelectedBike(item)}
            >
              <Text
                style={[
                  styles.bikePillText,
                  selectedBike?.id === item.id && styles.bikePillTextActive,
                ]}
              >
                {item.make} {item.model}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No bikes in database.</Text>
          }
        />

        {/* Auth status */}
        {token ? (
          <View style={styles.authBadge}>
            <Text style={styles.authBadgeText}>✓ Logged in</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.authBtn}
            onPress={() => setShowAuthModal(true)}
          >
            <Text style={styles.authBtnText}>Login to enable diagnose</Text>
          </TouchableOpacity>
        )}

        {/* Launch camera */}
        <TouchableOpacity
          style={[
            styles.diagnoseBtn,
            (!selectedBike || !token) && styles.diagnoseBtnDisabled,
          ]}
          onPress={() => {
            if (!token) {
              setShowAuthModal(true);
              return;
            }
            if (!selectedBike) {
              Alert.alert('Select a bike first');
              return;
            }
            setScreen('camera');
          }}
        >
          <Text style={styles.diagnoseBtnText}>📷  Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.galleryDiagnoseBtn,
            (!selectedBike || !token) && styles.diagnoseBtnDisabled,
          ]}
          onPress={pickFromGallery}
        >
          <Text style={styles.galleryDiagnoseBtnText}>🖼  From Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <Modal visible={showAuthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {authMode === 'login' ? 'Login' : 'Register'}
            </Text>

            {authMode === 'register' ? (
              <TextInput
                style={styles.input}
                placeholder="Display name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {authError ? <Text style={styles.authError}>{authError}</Text> : null}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleAuth}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>
                  {authMode === 'login' ? 'Login' : 'Register'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setAuthMode(authMode === 'login' ? 'register' : 'login')
              }
            >
              <Text style={styles.switchAuth}>
                {authMode === 'login'
                  ? "Don't have an account? Register"
                  : 'Already have an account? Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowAuthModal(false)}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  setupContent: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 4 },
  bikeList: { flexGrow: 0 },
  bikePill: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  bikePillActive: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  bikePillText: { fontSize: 13, color: '#6b7280' },
  bikePillTextActive: { color: '#f97316', fontWeight: '700' },
  emptyText: { color: '#9ca3af', fontSize: 13 },
  authBadge: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  authBadgeText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
  authBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f97316',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  authBtnText: { color: '#f97316', fontWeight: '700' },
  diagnoseBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  diagnoseBtnDisabled: { opacity: 0.4 },
  diagnoseBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  galleryDiagnoseBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f97316',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  galleryDiagnoseBtnText: { color: '#f97316', fontWeight: '700', fontSize: 15 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 48,
    gap: 16,
  },
  cameraHint: {
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 13,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  galleryBtn: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  galleryText: { color: '#fff', fontWeight: '600' },
  cancelBtn: {
    position: 'absolute',
    top: 48,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cancelText: { color: '#fff', fontWeight: '600' },
  loadingTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  loadingSubtitle: { fontSize: 13, color: '#6b7280' },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b' },
  btn: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
  },
  authError: { color: '#dc2626', fontSize: 13 },
  switchAuth: { color: '#f97316', textAlign: 'center', fontSize: 13 },
  cancelLink: { color: '#9ca3af', textAlign: 'center', fontSize: 13 },
});
