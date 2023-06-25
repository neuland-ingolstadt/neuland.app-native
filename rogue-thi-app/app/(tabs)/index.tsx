import { HomeScreen } from "../../components/home/screen";
import { Button } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
const Stack2 = createNativeStackNavigator();
import { useColorScheme } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Screen() {
  const scheme = useColorScheme();
  const navigation = useNavigation();
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackButtonMenuEnabled: false,
        }}
      />
      <Stack2.Navigator>
        <Stack2.Screen
          name="Home"
          options={{
            title: "Neuland App",
            headerShown: true,
            headerLargeTitle: true,
            headerRight: () => (
              <Button
                onPress={() => {
                  navigation.navigate("(user)/settings");
                }}
                variant="ghost-sharp"
              >
                <Ionicons name="cog-outline" size={24} color={scheme === "dark" ? "white" : "black"} />
              </Button>
            ),
          }}
          component={HomeScreen}
        />
      </Stack2.Navigator>
    </>
  );
}
