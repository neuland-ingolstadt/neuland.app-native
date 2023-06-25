import { useNavigation } from "@react-navigation/native";
import { Box, Button, HStack, Heading, Link, Text, VStack } from "native-base";

export function HomeScreen() {
  const navigation = useNavigation();

  return (
    <VStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      p={4}
      space={4}
    >
      <VStack maxWidth={600} space={4}>
        <Heading
        textAlign={"center"}
        >
          Welcome to neuland.app</Heading>

        <Text textAlign="center">
          An open source, web-based replacement for the official app of the
          Technische Hochschule Ingolstadt built with React Native and Expo.
        </Text>

        <Box alignItems="center">
          <HStack space={2}>
            <Text>Made by</Text>
            <Link href="https://neuland-ingolstadt.de/">
              Neuland Ingolstadt
            </Link>
          </HStack>
        </Box>
      </VStack>
      <HStack space={2}>
        <Heading size="md" color={"primary.600"}
        >Checkout Settings</Heading>
       </HStack>
    </VStack>
  );
}
