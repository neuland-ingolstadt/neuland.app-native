import { useRoute } from "@react-navigation/native";
import { ProfileScreen } from "../../components/user/profile";

export default function FoodDetail() {
  const route = useRoute();
  return (
    <>
      <ProfileScreen />
    </>
  );
}
