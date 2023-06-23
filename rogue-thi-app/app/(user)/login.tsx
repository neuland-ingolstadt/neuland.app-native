import { useNavigation } from "expo-router";
import { LoginScreen } from "../../components/user/login";

export default function Modal() {
  const navigation = useNavigation();
  const isPresented = navigation.canGoBack();

  return <LoginScreen />;
}
