import { type Meal } from '@customTypes/neuland-api'
import { useLocalSearchParams } from 'expo-router'
import { Container, Text } from 'native-base'
import React from 'react'

export interface RootStackParamList {
    FoodDetail: { food?: Meal }
}

export function FoodDetailScreen(): JSX.Element {
    const params = useLocalSearchParams()

    const { food }: { food?: Meal } = params

    return (
        <Container>
            <Text>{JSON.stringify(food, null, 2)}</Text>
        </Container>
    )
}
