import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  HStack,
  Icon,
  IconButton,
  Input,
  Pressable,
  Text,
  VStack,
} from "native-base";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  createGuestSession,
  createSession,
} from "../../lib/backend/thi-session-handler";

import { useColorScheme } from "react-native";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saveCredentials, setSaveCredentials] = useState(true);
  const [failure, setFailure] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const toggleSaveCredentials = () => setSaveCredentials(!saveCredentials);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const resetFailure = () => {
    setFailure(false);
  };

  async function login() {
    try {
      await createSession(username, password, saveCredentials);

      console.log("Login successful");
      navigation.goBack();
    } catch (e) {
      setFailure(e.message);
    }
  }

  async function guestLogin() {
    createGuestSession();
    navigation.goBack();
  }

  return (
    <LinearGradient
      colors={["#f7ba2c", "#ea5459"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Box
              bg={colorScheme === "dark" ? "black" : "white"}
              shadow={2}
              rounded="lg"
              maxWidth={500}
              width="90%"
              p={8}
              justifyContent="center"
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 30,
                  marginTop: 10,
                }}
              >
                Sign in to your account
              </Text>

              {failure ? (
                <Center>
                  <Alert
                    status="error"
                    width="90%"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <VStack space={1} w={"90%"}>
                      <HStack
                        flexShrink={1}
                        space={2}
                        justifyContent="space-between"
                      >
                        <HStack flexShrink={1} space={2}>
                          <Alert.Icon />
                          <Text
                            fontSize="md"
                            fontWeight="medium"
                            color="coolGray.800"
                          >
                            Login failed
                          </Text>
                        </HStack>
                        <IconButton
                          variant="unstyled"
                          _focus={{
                            borderWidth: 0,
                          }}
                          icon={
                            <Ionicons name="close" size={14} color="black" />
                          }
                          _icon={{
                            color: "coolGray.600",
                          }}
                          onPress={resetFailure}
                        />
                      </HStack>
                      <Box
                        flexShrink={1}
                        _text={{
                          color: "coolGray.600",
                        }}
                      >
                        {failure}
                      </Box>
                    </VStack>
                  </Alert>
                </Center>
              ) : null}
              <FormControl paddingTop={3}>
                <FormControl.Label>THI Username</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="abc1234"
                  onChangeText={(text) => {
                    setUsername(text);
                  }}
                  textContentType="username"
                  autoCapitalize="none"
                />
              </FormControl>
              <FormControl paddingTop={3}>
                <FormControl.Label>Password</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="Password"
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                  textContentType="password"
                  secureTextEntry={!showPassword}
                  type={showPassword ? "text" : "password"}
                  InputRightElement={
                    <Pressable onPress={() => toggleShowPassword()}>
                      <Icon
                        as={
                          <Ionicons
                            name={
                              showPassword ? "eye-outline" : "eye-off-outline"
                            }
                          />
                        }
                        size={5}
                        mr="2"
                        color="muted.400"
                      />
                    </Pressable>
                  }
                />
              </FormControl>

              <Box width="100%" mt={2} mb={2} paddingY={3}>
                <Checkbox
                  size={"sm"}
                  value="saveCredentials"
                  my={1}
                  onChange={toggleSaveCredentials}
                  defaultIsChecked={true}
                >
                  Stay signed in
                </Checkbox>
              </Box>

              <Button
                onPress={() => {
                  login();
                }}
                colorScheme={"primary"}
              >
                {"Sign in"}
              </Button>

              <HStack>
                <TouchableOpacity onPress={guestLogin}>
                  <Text style={{ opacity: 0.7, fontSize: 13, marginTop: 10 }}>
                    {"Or continue as guest"}
                  </Text>
                </TouchableOpacity>
              </HStack>
            </Box>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
