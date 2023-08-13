// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type Colors } from '@/stores/colors'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface BaseCardProps {
    title: string
    onPress: () => void
    icon: typeof Ionicons.defaultProps.name
    children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
    title,
    onPress,
    icon,
    children,
}) => {
    const colors = useTheme().colors as Colors
    return (
        <TouchableOpacity onPress={onPress} style={{ marginVertical: 8 }}>
            <View
                style={{
                    alignSelf: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    shadowOffset: {
                        width: 0,
                        height: 1,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 1,
                    elevation: 1,
                    shadowColor: colors.text,
                }}
            >
                <View
                    style={{
                        marginHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <Ionicons name={icon} size={20} color={colors.primary} />
                    <Text
                        style={{
                            fontSize: 16,
                            color: colors.text,
                            fontWeight: '500',
                            padding: 16,
                            flex: 1,
                        }}
                    >
                        {title}
                    </Text>
                    <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color={colors.labelColor}
                    />
                </View>
                {children}
            </View>
        </TouchableOpacity>
    )
}

export default BaseCard
