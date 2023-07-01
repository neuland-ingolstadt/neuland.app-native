import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Provider } from "../provider";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <Provider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(user)/login"
          options={{
            title: "Login",
            presentation: "modal",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(food)/detail"
          options={{
            title: "Food Detail",
          }}
        />
        <Stack.Screen
          name="(user)/settings"
          options={{
            title: "Settings",
          }}
        />
        <Stack.Screen
          name="(user)/profile"
          options={{
            title: "Profile",
          }}
        />
        <Stack.Screen
          name="(user)/about"
          options={{
            title: "About",
          }}
        />
      </Stack>
    </Provider>
  );
}
