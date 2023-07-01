import { useNavigation } from "expo-router";
import { LoginScreen } from "../../screens/user/login";

export default function Modal() {
  const navigation = useNavigation();
  const isPresented = navigation.canGoBack();

  return <LoginScreen />;
}
