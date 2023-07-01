import { useNavigation } from "@react-navigation/native";
import { Button, Container, Text } from "native-base";
import React, { useEffect, useState } from "react";
import API from "../../lib/backend/authenticated-api";
import {
  createGuestSession,
  forgetSession,
} from "../../lib/backend/thi-session-handler";

export function ProfileScreen() {
  const [userData, setUserData] = useState(false);
  const [fullName, setFullName] = useState("false");
  const [isLoaded, setIsLoaded] = useState(false);
  const navigation = useNavigation();

  const logout = () => {
    forgetSession();
    createGuestSession();
    navigation.navigate("(tabs)");
  };

  useEffect(() => {
    async function load() {
      try {
        const response = await API.getPersonalData();
        const data = response.persdata;
        data.pcounter = response.pcounter;
        setIsLoaded(true);
        setUserData(data);
        setFullName(data.vname + " " + data.name);
      } catch (e) {
        console.log(e);
      }
    }

    load();
  }, []);

  return (
    <Container>
      <Text>{JSON.stringify(userData, null, 2)}</Text>
      <Button onPress={() => logout()}>
        <Text>Logout</Text>
      </Button>
    </Container>
  );
}
