import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { loadFoodEntries } from "../../lib/backend-utils/food-utils";
import { formatNearDate } from "../../lib/date-utils";

import { SectionList, Text } from "native-base";
import { StyleSheet, TouchableOpacity, View } from "react-native";



export const FoodScreen = () => {
  const [days, setDays] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    async function load() {
      try {
        const loadedDays = (await loadFoodEntries(["mensa"]))
          .filter(
            (day) => day.timestamp >= new Date().toISOString().slice(0, 10)
          )
          .map((day) => ({
            timestamp: formatNearDate(day.timestamp),
            data: day.meals,
          }));
        setDays(loadedDays);
      } catch (e) {
        console.error(e);
        alert(e);
      }
    }

    load();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View>
        <TouchableOpacity
          key={item.id}
          onPress={() => navigation.navigate("(food)/detail", { food: item })}
        >
          <Text style={styles.taskItem}> {item.name.en}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { timestamp } }) => {
    return <Text style={styles.taskTitle}>{timestamp}</Text>;
  };

  return (
    <SectionList
      sections={days}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  taskItem: {
    padding: 10,
    marginVertical: 15,
    fontSize: 16,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
    elevation: 4,
    margin: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
});
