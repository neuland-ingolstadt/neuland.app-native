import { useNavigation } from "@react-navigation/native";
import { Box, HStack, Image, Text, VStack } from "native-base";
import React from "react";
import { version } from "../../package.json";

export function AboutScreen() {
  const navigation = useNavigation();

  return (
    <VStack space={4} alignItems="center" paddingTop={10}>
      <HStack space={4} alignItems="center">
        <Box shadow={9} rounded={"lg"}>
          <Image
            source={require("../../assets/icon.png")}
            alt="Neuland Next Logo"
            size="xl"
            rounded="lg"
          />
        </Box>

        <VStack space={2}>
          <VStack>
            <Text fontSize="xl" fontWeight="bold">
              Neuland App
            </Text>
            <Text fontSize="md">Version {version}</Text>
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
  );
}
