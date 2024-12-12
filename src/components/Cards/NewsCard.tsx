import API from '@/api/authenticated-api'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { type ThiNews } from '@/types/thi-api'
import { useQuery } from '@tanstack/react-query'
import React, {
    useCallback,
    useContext,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Image, Linking, Pressable, Text, View } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const NewsCard: React.FC = () => {
    const ref = useRef(null)
    const { t } = useTranslation('navigation')
    const { styles } = useStyles(stylesheet)
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const { data } = useQuery({
        queryKey: ['thiNews'],
        queryFn: async () => await API.getThiNews(),
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        enabled: userKind !== USER_GUEST,
    })

    const getRelativeWidth = (width: number): number => {
        return width < 800 ? width - 26 : width / 2 - 26
    }

    const getInitialWidth = (): number => {
        const width = Dimensions.get('window').width
        return getRelativeWidth(width)
    }

    const [cardWidth, setCardWidth] = useState(getInitialWidth)

    const updateWidth = useCallback(() => {
        const width = Dimensions.get('window').width
        setCardWidth(getRelativeWidth(width))
    }, [])

    useLayoutEffect(() => {
        const subscription = Dimensions.addEventListener('change', updateWidth)

        return () => {
            subscription.remove()
        }
    }, [updateWidth])

    const renderEvent = (event: ThiNews): JSX.Element => {
        return (
            <Pressable
                style={styles.eventContainer}
                onPress={() => {
                    void Linking.openURL(event.href)
                }}
            >
                <Image
                    style={styles.imageContainer}
                    source={{
                        uri: event.img,
                    }}
                />
                <Text style={styles.eventTitle} numberOfLines={3}>
                    {event.title}
                </Text>
            </Pressable>
        )
    }

    return (
        <View ref={ref}>
            <BaseCard title="news" onPressRoute="news">
                {data != null && data.length > 0 && (
                    <Carousel
                        loop
                        height={100}
                        width={cardWidth}
                        mode="parallax"
                        modeConfig={{
                            parallaxScrollingOffset: 105,
                        }}
                        containerStyle={styles.carousel}
                        data={data}
                        snapEnabled={true}
                        autoPlay={true}
                        autoPlayInterval={7500}
                        renderItem={({ index }) => renderEvent(data[index])}
                    ></Carousel>
                )}
                {data != null && data.length > 2 && (
                    <View style={styles.cardsFilled}>
                        <Text style={styles.description} numberOfLines={3}>
                            {t('cards.news.more', {
                                count: data.length,
                            })}
                        </Text>
                    </View>
                )}
            </BaseCard>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    cardsFilled: { paddingTop: 4 },
    carousel: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: 4,
        width: '100%',
    },
    description: {
        color: theme.colors.labelColor,
        fontSize: 14,
        fontWeight: '500',
    },
    eventContainer: {
        alignItems: 'center',
        backgroundColor: theme.colors.cardButton,
        borderRadius: theme.radius.md,
        flexDirection: 'row',
        gap: 12,
        padding: 10,
    },
    eventTitle: {
        color: theme.colors.text,
        flexShrink: 1,
        fontSize: 18,
        fontWeight: '500',
    },
    imageContainer: {
        borderRadius: theme.radius.sm,
        height: 85,
        resizeMode: 'cover',
        width: '37%',
    },
}))

export default NewsCard
