import { type Food } from '@customTypes/neuland-api'
import { ScrollView, Text } from 'native-base'
import React, { useEffect, useState } from 'react'

import { loadFoodEntries } from '../../lib/backend-utils/food-utils'
import { formatNearDate } from '../../lib/date-utils'

export const FoodScreen = (): JSX.Element => {
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
