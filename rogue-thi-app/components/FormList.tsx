import { Ionicons } from "@expo/vector-icons";
import {
  Box,
  Divider,
  HStack,
  Heading,
  Icon,
  Pressable,
  Text,
} from "native-base";
import React from "react";

const FormList = ({ sections, scheme }) => {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <Box key={sectionIndex} mt={5} width="92%" alignSelf="center">
          <Heading
            size="xs"
            color="gray.500"
            fontWeight="normal"
            textTransform={"uppercase"}
          >
            {section.header}
          </Heading>

          <Box
            alignSelf="center"
            bg={scheme === "dark" ? "gray.900" : "white"}
            rounded="lg"
            width="100%"
            mt={2}
            justifyContent="center"
          >
            {section.settings.map((setting, index) => (
              <React.Fragment key={index}>
                <Pressable
                  onPress={setting.onPress}
                  _pressed={{ opacity: 0.5 }}
                  padding={1}
                  disabled={setting.disabled || false}
                >
                  <HStack
                    justifyContent="space-between"
                    paddingX={2}
                    paddingY={1.5}
                  >
                    <Text ml={2} fontSize="md">
                      {setting.title}
                    </Text>
                    {setting.value && (
                      <Text mr={2} fontSize="md">
                        {setting.value}
                      </Text>
                    )}
                    {setting.icon && (
                      <Icon as={Ionicons} name={setting.icon} size="md" />
                    )}
                  </HStack>
                </Pressable>
                {index < section.settings.length - 1 && (
                  <Divider
                    bg={scheme === "dark" ? "gray.700" : "gray.200"}
                    width="95%"
                    alignSelf="flex-end"
                  ></Divider>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default FormList;
