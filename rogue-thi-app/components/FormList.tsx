import { type FormListSections } from '@customTypes/components'
import { Ionicons } from '@expo/vector-icons'
import {
    Box,
    Divider,
    HStack,
    Heading,
    Icon,
    Pressable,
    Text,
} from 'native-base'
import React from 'react'
import { type ColorSchemeName } from 'react-native'

const FormList = ({
    sections,
    scheme,
}: {
    sections: FormListSections[]
    scheme: ColorSchemeName
}): JSX.Element => {
    return (
        <>
            {sections.map((section, sectionIndex) => (
                <Box key={sectionIndex} mt={5} width="92%" alignSelf="center">
                    <Heading
                        size="xs"
                        color="gray.500"
                        fontWeight="normal"
                        textTransform={'uppercase'}
                    >
                        {section.header}
                    </Heading>

                    <Box
                        alignSelf="center"
                        bg={scheme === 'dark' ? 'gray.900' : 'white'}
                        rounded="lg"
                        width="100%"
                        mt={2}
                        justifyContent="center"
                    >
                        {section.items.map((item, index) => (
                            <React.Fragment key={index}>
                                <Pressable
                                    onPress={item.onPress}
                                    _pressed={{ opacity: 0.5 }}
                                    padding={1}
                                    disabled={item.disabled ?? false}
                                >
                                    <HStack
                                        justifyContent="space-between"
                                        paddingX={2}
                                        paddingY={1.5}
                                    >
                                        <Text ml={2} fontSize="md">
                                            {item.title}
                                        </Text>
                                        {item.value != null && (
                                            <Text
                                                mr={2}
                                                fontSize="md"
                                                color="gray.400"
                                            >
                                                {item.value}
                                            </Text>
                                        )}
                                        {item.icon != null && (
                                            <Icon
                                                as={Ionicons}
                                                name={item.icon}
                                                size="md"
                                            />
                                        )}
                                    </HStack>
                                </Pressable>
                                {index < section.items.length - 1 && (
                                    <Divider
                                        bg={
                                            scheme === 'dark'
                                                ? 'gray.700'
                                                : 'gray.200'
                                        }
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
    )
}

export default FormList
