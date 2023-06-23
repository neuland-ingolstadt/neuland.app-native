import { Stack } from "expo-router";
import { HomeScreen } from "../../components/home/screen";

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <HomeScreen />
    </>
  );
}
