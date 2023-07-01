import { useRoute } from "@react-navigation/native";
import { FoodDetailScreen } from "../../screens/food/detail-screen";

export default function FoodDetail() {
  const route = useRoute();
  const { food } = route.params;
  return (
    <>
      <FoodDetailScreen food={food} />
    </>
  );
}
