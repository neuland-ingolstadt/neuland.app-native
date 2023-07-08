import { Heading, Text, VStack } from 'native-base'
import React from 'react'

export function HomeScreen(): JSX.Element {
    return (
        <VStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            p={4}
            space={4}
        >
            <VStack maxWidth={600} space={4}>
                <Heading textAlign={'center'} size={'2xl'}>
                    🚧🏗️⚒️
                </Heading>

                <Text textAlign="center" paddingTop={5}>
                    Nothing here yet
                </Text>
            </VStack>
        </VStack>
    )
}
