import FormList from "@components/FormList";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Avatar,
  Box,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Skeleton,
  Text,
  VStack,
} from "native-base";
import React, { useEffect, useState } from "react";
import { Linking, RefreshControl, useColorScheme } from "react-native";
import API from "../../lib/backend/authenticated-api";
/**
 * Generates the initials of a given name.
 * @param name The name to generate the initials from.
 * @returns The initials of the name.
 */
function getInitials(name) {
  var names = name.split(" ");
  var firstName = names[0] || "";
  var lastName = names[names.length - 1] || "";

  var initials = (firstName.charAt(0) || "") + (lastName.charAt(0) || "");
  initials = initials.toUpperCase();

  return initials;
}

/**
 * Generates a hexadecimal color code based on the given name.
 * @param name The name to generate the color from.
 * @returns The hexadecimal color code.
 */
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

/**
 * Calculates the appropriate text color (black or white) based on the given background color.
 * @param background The background color in hexadecimal format (#RRGGBB).
 * @returns The appropriate text color (black or white).
 */
function getTextColor(background) {
  var r = parseInt(background.substr(1, 2), 16);
  var g = parseInt(background.substr(3, 2), 16);
  var b = parseInt(background.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

enum LoadingState {
  LOADING,
  REFRESHING,
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

  const loadData = async () => {
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
        setErrorMsg(e.toString().split(":")[1].trim());
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsLoaded(LoadingState.LOADING);
    loadData();
  };

  const sections = [
    {
      header: "Preferences",
      settings: [
        {
          title: "Theme",
          icon: "color-palette-outline",
          onPress: () => navigation.navigate("(user)/theme"),
        },
        {
          title: "Language",
          icon: "language-outline",
          onPress: () => Linking.openSettings(),
        },
        {
          title: "Dashboard",
          icon: "cube-outline",
          onPress: () => navigation.navigate("(user)/dashboard"),
        },
      ],
    },
    {
      header: "Quick Links",
      settings: [
        {
          title: "Primuss",
          icon: "link-outline",
          onPress: () =>
            Linking.openURL(
              "https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin"
            ),
        },
        {
          title: "Moodle",
          icon: "link-outline",
          onPress: () => Linking.openURL("https://moodle.thi.de/"),
        },
        {
          title: "Webmail",
          icon: "link-outline",
          onPress: () => Linking.openURL("http://outlook.thi.de/"),
        },
      ],
    },
    {
      header: "Legal",
      settings: [
        {
          title: "About",
          icon: "chevron-forward-outline",
          onPress: () => navigation.navigate("(user)/about"),
        },
        {
          title: "Rate the app",
          icon: "star-outline",
          onPress: () => navigation.navigate("(user)/privacy"),
        },
      ],
    },
  ];

  return (
    <ScrollView
        refreshControl={
          isLoaded !== LoadingState.LOADED && isLoaded !== LoadingState.GUEST ? (
            <RefreshControl refreshing={isLoaded === LoadingState.REFRESHING} onRefresh={handleRefresh} />
          ) : null
        }
      >
      <VStack mt={4}>
        <Pressable
          onPress={() => {
            if (isLoaded === LoadingState.LOADED) {
              navigation.navigate("(user)/profile");
            } else if (isLoaded === LoadingState.GUEST) {
              navigation.navigate("(user)/login");
            }
          }}
          _pressed={{ opacity: 0.5 }}
          disabled={
            isLoaded === LoadingState.LOADING || isLoaded === LoadingState.ERROR
          }
        >
          <Box
            alignSelf={"center"}
            bg={scheme === "dark" ? "gray.900" : "white"}
            rounded="lg"
            width="92%"
            p={8}
            mt={4}
            justifyContent="center"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack alignItems="center">
                {isLoaded === LoadingState.LOADING ? (
                  <>
                    <Skeleton height={12} width={12} borderRadius={"full"} />
                    <VStack space={2} ml={4}>
                      <Skeleton height={7} width={130} borderRadius={3} />
                      <Skeleton height={4} width={200} borderRadius={3} />
                    </VStack>
                  </>
                ) : isLoaded === LoadingState.ERROR ? (
                  <>
                    <Avatar size="md" background="gray.500" shadow={2}>
                      <Icon
                        as={Ionicons}
                        name="warning-outline"
                        size="md"
                        color="gray.100"
                      />
                    </Avatar>
                    <VStack>
                      <Text ml="4" fontWeight="bold" fontSize="lg">
                        Error
                      </Text>
                      <Text
                        ml="4"
                        fontSize="xs"
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >
                        {errorMsg}
                      </Text>
                    </VStack>
                  </>
                ) : isLoaded === LoadingState.GUEST ? (
                  <>
                    <Avatar size="md" background="gray.500" shadow={2}>
                      <Icon
                        as={Ionicons}
                        name="person"
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
                    <VStack maxWidth="92%" alignItems="flex-start">
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
              {isLoaded === LoadingState.LOADED ||
              isLoaded === LoadingState.GUEST ? (
                <Icon as={Ionicons} name="chevron-forward" size="sm" />
              ) : null}
            </HStack>
          </Box>
        </Pressable>

        <FormList sections={sections} scheme={scheme} />
      </VStack>
      <Text alignSelf="center" mt={4} mb={4} color="gray.500" paddingTop={4}>
        © 2023 by Neuland Ingolstadt e.V.
      </Text>
    </ScrollView>
  );
}
