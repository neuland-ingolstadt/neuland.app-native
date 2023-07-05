import FormList from "@components/FormList";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Box, Button, ScrollView, useToast } from "native-base";
import React, { useEffect, useState } from "react";
import { Linking, Platform, useColorScheme } from "react-native";
import API from "../../lib/backend/authenticated-api";
import {
  createGuestSession,
  forgetSession,
} from "../../lib/backend/thi-session-handler";

export function ProfileScreen() {
  const scheme = useColorScheme();
  const [userData, setUserData] = useState(false);
  const navigation = useNavigation();
  const toastIdRef = React.useRef();

  const logout = () => {
    forgetSession();
    createGuestSession();
    navigation.navigate("(tabs)");
  };

  const openURL = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const response = await API.getPersonalData();
        const data = response.persdata;
        data.pcounter = response.pcounter;
        setUserData(data);
      } catch (e) {
        console.log(e);
      }
    }

    load();
  }, []);
  const toast = useToast();
  const copyToClipboard = async (text: string) => {
    if (!text) {
      return;
    }
    await Clipboard.setStringAsync(text);
    // Android shows clipboard toast by default so we don't need to show it
    if (Platform.OS === "android") {
      return;
    }
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
    toastIdRef.current = toast.show({
      title: "Copied to clipboard",
      placement: "top",
      duration: 2000,
    });
  };

  const sections = [
    {
      header: "User",
      settings: [
        {
          title: "Name",
          value: userData.vname + " " + userData.name,
          disabled: true,
        },
        {
          title: "Matriculation Number",
          value: userData.mtknr,
          onPress: () => copyToClipboard(userData.mtknr),
        },
        {
          title: "Library Number",
          value: userData.bibnr,
          onPress: () => copyToClipboard(userData.bibnr),
        },
        {
          title: "Printer Credits",
          value: userData.pcounter,
          disabled: true,
        },
      ],
    },

    {
      header: "Study",
      settings: [
        {
          title: "Degree",
          value: userData.fachrich + " (" + userData.stg + ")",
          disabled: true,
        },
        {
          title: "Exam Regulations",
          value: userData.pvers,
          onPress: () => openURL(userData.po_url),
        },
        {
          title: "Study Group",
          value: userData.stgru,
          disabled: true,
        },
      ],
    },
    {
      header: "Contact",
      settings: [
        {
          title: "THI Email",
          value: userData.fhmail,
          onPress: () => copyToClipboard(userData.fhmail),
        },
        {
          title: "Email",
          value: userData.email,
          onPress: () => copyToClipboard(userData.email),
        },
        {
          title: "Phone",
          value: userData.telefon,
          onPress: () => copyToClipboard(userData.telefon),
        },
        {
          title: "Street",
          value: userData.str,
          disabled: true,
        },
        {
          title: "City",
          value: userData.plz + " " + userData.ort,
          disabled: true,
        },
      ],
    },
  ];

  return (
    <ScrollView>
      <FormList sections={sections} scheme={scheme} />
      <Box
        alignSelf="center"
        bg={scheme === "dark" ? "gray.900" : "white"}
        rounded="lg"
        width="42%"
        mt={5}
        justifyContent="center"
      >
        <Button
          onPress={logout}
          _pressed={{ opacity: 0.5 }}
          variant="ghost"
          colorScheme="red"
          startIcon={<Ionicons name="log-out-outline" size={24} color="red" />}
        >
          Logout
        </Button>
      </Box>
    </ScrollView>
  );
}
