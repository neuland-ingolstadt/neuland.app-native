import { useNavigation } from "expo-router";
import { SettingsScreen } from "../../components/user/settings";

export default function Modal() {
  const navigation = useNavigation();

  return <SettingsScreen />;
}
