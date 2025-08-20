import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';

export default function OcrInfoScreen() {
  const router = useRouter();
  const {
    code = '',
    name = '',
    size = '',
  } = useLocalSearchParams<{
    code: string;
    name: string;
    size: string;
  }>();

  return (
    <View className="flex-1 justify-center bg-white p-6">
      <Text className="mb-4 text-center text-lg">
        Position the product name within the frame and align it with the horizontal line on the next
        screen. Make sure the text is clear and readable.
      </Text>
      <Pressable
        className="self-center rounded-lg bg-primary px-6 py-3"
        onPress={() =>
          router.replace({
            pathname: '/confirm',
            params: { code, name, size },
          })
        }
      >
        <Text className="text-base font-bold text-white">Next</Text>
      </Pressable>
    </View>
  );
}
