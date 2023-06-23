import { useRoute } from "@react-navigation/native";
import { FoodDetailScreen } from "../../components/food/detail-screen";

export default function FoodDetail() {
  const route = useRoute();
  const { food } = route.params;
  return (
    <>
      <FoodDetailScreen food={food} />
    </>
  );
}
