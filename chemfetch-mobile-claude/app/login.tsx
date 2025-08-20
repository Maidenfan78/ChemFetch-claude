// app/login.tsx
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    const { data, error } = isRegistering
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    console.log(isRegistering ? '📝 Register result:' : '📥 Login result:', { data, error });

    if (error) {
      Alert.alert(isRegistering ? 'Registration failed' : 'Login failed', error.message);
      return;
    }

    router.replace('/');
  };

  return (
    <View className="flex-1 justify-center bg-white p-6">
      <Text className="mb-4 text-center text-2xl font-bold">
        {isRegistering ? 'Create Account' : 'Login'}
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        className="mb-4 rounded-md border bg-light-100 px-4 py-3"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        className="mb-6 rounded-md border bg-light-100 px-4 py-3"
      />

      <Button title={isRegistering ? 'Sign Up' : 'Login'} onPress={handleAuth} />

      <Pressable onPress={() => setIsRegistering(!isRegistering)} className="mt-4">
        <Text className="text-center font-medium text-blue-600">
          {isRegistering ? 'Already have an account? Login' : 'No account? Register'}
        </Text>
      </Pressable>
    </View>
  );
}
