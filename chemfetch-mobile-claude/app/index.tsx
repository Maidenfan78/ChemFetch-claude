import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import '../app/global.css';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-5xl font-bold text-light-100">Welcome!</Text>
      <Text className="mb-8 text-center text-base text-gray-600">
        Scan and manage your chemical products
      </Text>

      <Pressable
        className="mb-4 rounded-lg bg-primary px-6 py-3"
        onPress={() => router.push('/barcode')}
      >
        <Text className="text-base font-bold text-white">📷 Start Scanning</Text>
      </Pressable>

      <Pressable
        className="rounded-lg bg-accent px-6 py-3"
        onPress={() => router.push('/confirm?editOnly=1')}
      >
        <Text className="text-base font-bold text-white">✍️ Manual Entry</Text>
      </Pressable>

      <Pressable
        className="mt-4 rounded-lg bg-red-500 px-6 py-3"
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }}
      >
        <Text className="text-base font-bold text-white">🚪 Log Out</Text>
      </Pressable>
    </View>
  );
}
