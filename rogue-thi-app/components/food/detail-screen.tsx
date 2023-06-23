import { useRoute, RouteProp } from "@react-navigation/native";
import { Container, Text } from "native-base";

export interface Meal {
  name:             Name;
  category:         string;
  prices:           Prices;
  allergens:        string[];
  flags:            string[];
  nutrition:        Nutrition;
  originalLanguage: string;
}

export interface Name {
  de: string;
  en: string;
}

export interface Nutrition {
  kj:           number;
  kcal:         number;
  fat:          number;
  fatSaturated: number;
  carbs:        number;
  sugar:        number;
  fiber:        number;
  protein:      number;
  salt:         number;
}

export interface Prices {
  student:  number | null;
  employee: number | null;
  guest:    number | null;
}


type RootStackParamList = {
  FoodDetail: { food: Meal };
};

export function FoodDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "FoodDetail">>();
  const { food } = route.params;
  
  return (
    <Container>
      <Text>{JSON.stringify(food, null, 2)}</Text>
    </Container>
  );
}
