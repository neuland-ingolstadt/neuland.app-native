import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Avatar,
  Box,
  HStack,
  Heading,
  Icon,
  Pressable,
  SectionList,
  Spinner,
  Text,
  VStack,
} from "native-base";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import API from "../../lib/backend/authenticated-api";

function getInitials(name) {
  var names = name.split(" ");
  var firstName = names[0] || "";
  var lastName = names[names.length - 1] || "";

  var initials = (firstName.charAt(0) || "") + (lastName.charAt(0) || "");
  initials = initials.toUpperCase();

  return initials;
}

function getColor(name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = "#";
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
}

function getTextColor(background) {
  var r = parseInt(background.substr(1, 2), 16);
  var g = parseInt(background.substr(3, 2), 16);
  var b = parseInt(background.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

enum LoadingState {
  LOADING,
  LOADED,
  GUEST,
  ERROR,
}

export function SettingsScreen() {
  const [userdata, setUserdata] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isLoaded, setIsLoaded] = useState(LoadingState.LOADING);
  const [errorMsg, setErrorMsg] = useState();

  const navigation = useNavigation();
  const color = getColor(fullName);
  const textColor = getTextColor(color);
  const scheme = useColorScheme();

  useEffect(() => {
    async function load() {
      try {
        const response = await API.getPersonalData();
        const data = response.persdata;
        data.pcounter = response.pcounter;
        setIsLoaded(LoadingState.LOADED);
        setUserdata(data);
        setFullName(data.vname + " " + data.name);
      } catch (e) {
        if (
          e.toString() === "Error: User is logged in as guest" ||
          e.toString() === "Error: User is not logged in"
        ) {
          setIsLoaded(LoadingState.GUEST);
        } else {
          setIsLoaded(LoadingState.ERROR);
          setErrorMsg(e.toString());
        }
      }
    }

    load();
  }, []);

  const SettingsRow = ({ title }) => (
    <Pressable
      onPress={() => navigation.navigate(title)}
      _pressed={{ bg: "grey.200" }}
      px="4"
      py="2"
    >
      <HStack justifyContent="space-between">
        <Text>{title}</Text>
        <Icon as={<Ionicons name="chevron-forward" />} size="sm" />
      </HStack>
    </Pressable>
  );

  return (
    <VStack mt={4}>
      <Pressable
        onPress={() => {
          if (isLoaded === LoadingState.LOADED) {
            navigation.navigate("(user)/profile");
          } else if (isLoaded === LoadingState.GUEST) {
            navigation.navigate("(user)/login");
          }
        }
        }
        _pressed={{ opacity: 0.5 }}
        disabled={isLoaded === LoadingState.LOADING || isLoaded === LoadingState.ERROR}
      >
        <Box
          alignSelf={"center"}
          bg={scheme === "dark" ? "gray.800" : "white"}
          shadow={2}
          rounded="lg"
          width="95%"
          p={8}
          mt={4}
          justifyContent="center"
        >
<HStack justifyContent="space-between" alignItems="center">
  <HStack alignItems="center">
    {isLoaded === LoadingState.LOADING ? (
      <HStack space={2} justifyContent="center">
        <Spinner accessibilityLabel="Loading user data" />
        <Heading color="primary.500" fontSize="md">
          Loading
        </Heading>
      </HStack>
    ) : isLoaded === LoadingState.ERROR ? (
      <>
        <Avatar size="md" background="gray.500" shadow={2}>
          <Icon
            as={<Ionicons name="warning-outline" />}
            size="md"
            color="gray.100"
          />
        </Avatar>
        <VStack>
          <Text ml="4" fontWeight="bold" fontSize="lg">
            Error
          </Text>
          <Text ml="4" fontSize="xs">
            {errorMsg}
          </Text>
        </VStack>
      </>
    ) : isLoaded === LoadingState.GUEST ? (
      <>
        <Avatar size="md" background="gray.500" shadow={2}>
          <Icon
            as={<Ionicons name="person" />}
            size="md"
            color="gray.100"
          />
        </Avatar>
        <VStack>
          <Text ml="4" fontWeight="bold" fontSize="lg">
            Sign in
          </Text>
          <Text ml="4" fontSize="xs">
            Sign in to unlock all features of the app
          </Text>
        </VStack>
      </>
    ) : (
      <>
        <Avatar size="md" background={color} shadow={4}>
          <Text color={textColor} fontWeight="bold" fontSize="lg">
            {getInitials(fullName)}
          </Text>
        </Avatar>
        <VStack maxWidth="95%" alignItems="flex-start">
          <Text
            ml="4"
            fontWeight="bold"
            fontSize="lg"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {fullName}
          </Text>
          <Text ml="4" fontSize="xs">
            {userdata.stgru + ". Semester"}
          </Text>
          <Text
            ml="4"
            fontSize="xs"
            ellipsizeMode="tail"
            numberOfLines={2}
          >
            {userdata.fachrich}
          </Text>
        </VStack>
      </>
    )}
  </HStack>


            <Icon as={<Ionicons name="chevron-forward" />} size="sm" />
          </HStack>
        </Box>
      </Pressable>
      <SectionList
        sections={[
          { title: "General", data: ["Language", "Theme"] },
          { title: "Account", data: ["Profile", "Password"] },
          {
            title: "About",
            data: ["Version", "Privacy Policy", "Terms of Service"],
          },
        ]}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => <SettingsRow title={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text fontWeight="bold" fontSize="lg" p="4">
            {title}
          </Text>
        )}
      />
    </VStack>
  );
}
