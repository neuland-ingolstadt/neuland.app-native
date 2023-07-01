import { useNavigation } from "expo-router";
import { AboutScreen } from "../../screens/user/about";

export default function Modal() {
  const navigation = useNavigation();

  return <AboutScreen />;
}
