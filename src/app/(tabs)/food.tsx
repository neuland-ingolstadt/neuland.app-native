import { type Food } from '@/stores/types/neuland-api'
import { formatNearDate } from '@/utils/date-utils'
import { loadFoodEntries } from '@/utils/food-utils'
import React, { useEffect, useState } from 'react'
import { ScrollView, Text } from 'react-native'

export default function FoodScreen(): JSX.Element {
    const [days, setDays] = useState<any>([])

    useEffect(() => {
        function load(): void {
            loadFoodEntries(['mensa'])
                .then((loadedDays: Food[]) => {
                    const filteredDays: Food[] = loadedDays.filter(
                        (day: Food) =>
                            new Date(day.timestamp).getTime() >= Date.now()
                    )
                    const formattedDays: Food[] = filteredDays.map(
                        (day: Food) => ({
                            timestamp: formatNearDate(day.timestamp),
                            meals: day.meals,
                        })
                    )
                    setDays(formattedDays)
                })
                .catch((e: Error) => {
                    console.error(e)
                    alert(e)
                })
        }

        load()
    }, [])

    return (
        <ScrollView>
            <Text>{JSON.stringify(days, null, 2)}</Text>
        </ScrollView>
    )
}
