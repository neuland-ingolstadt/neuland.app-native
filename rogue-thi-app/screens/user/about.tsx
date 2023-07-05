import FormList from "@components/FormList";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Box, HStack, Image, ScrollView, Text, VStack } from "native-base";
import React, { useState } from "react";
import { Linking, Pressable, useColorScheme } from "react-native";
import { version } from "../../package.json";

export function AboutScreen() {
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const sections = [
    {
      header: "Legal",
      settings: [
        {
          title: "Privacy Policy",
          icon: "shield",
          onPress: () => navigation.navigate("Privacy"),
        },
        {
          title: "Terms of Use",
          icon: "document-text",
          onPress: () => navigation.navigate("Terms"),
        },
        {
          title: "Imprint",
          icon: "information-circle",
          onPress: () => navigation.navigate("Imprint"),
        },
      ],
    },
    {
      header: "About us",
      settings: [
        {
          title: "Feedback",
          icon: "chatbox-ellipses-outline",
          onPress: () =>
            Linking.openURL(
              "mailto:info@neuland-ingolstadt.de?subject=Feedback%20Neuland-App-Native"
            ),
        },
        {
          title: "Github",
          icon: "logo-github",
          onPress: () =>
            Linking.openURL(
              "https://github.com/neuland-ingolstadt/neuland.app-native"
            ),
        },
        {
          title: "Website",
          icon: "globe",
          onPress: () => Linking.openURL("https://neuland-ingolstadt.de/"),
        },
      ],
    },
    {
      header: "App",
      settings: [
        {
          title: "Version",
          value: version,
          disabled: true,
        },
        {
          title: "Changelog",
          icon: "newspaper-outline",
          onPress: () => navigation.navigate("Changelog"),
        },
      ],
    },
  ];
  const handlePress = () => {
    setPressCount(pressCount + 1);
    if (pressCount === 7) {
      alert("You found the easter egg!");
      setPressCount(0);
    }
  };
  const [pressCount, setPressCount] = useState(0);
  return (
    <>
      <ScrollView>
        <VStack space={4} alignItems="center" paddingTop={10}>
          <HStack space={4} alignItems="center">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handlePress();
              }}
            >
              <Box shadow={9} rounded={"lg"}>
                <Image
                  source={require("../../assets/icon.png")}
                  alt="Neuland Next Logo"
                  size="xl"
                  rounded="lg"
                />
              </Box>
            </Pressable>

            <VStack space={2}>
              <VStack>
                <Text fontSize="xl" fontWeight="bold">
                  Neuland App
                </Text>
                <Text fontSize="md">Native Version</Text>
              </VStack>
              <VStack>
                <Text fontSize="md" fontWeight="bold">
                  Developed by
                </Text>
                <Text fontSize="md">Neuland Ingolstadt e.V.</Text>
              </VStack>
            </VStack>
          </HStack>
        </VStack>

        <FormList sections={sections} scheme={scheme} />
      </ScrollView>
    </>
  );
}
