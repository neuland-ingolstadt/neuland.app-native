import Divider from '@/components/Divider'
import { type FormListSections } from '@customTypes/components'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { type Theme } from '@react-navigation/native'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

import { type Colors } from '../provider'

interface FormListProps {
    sections: FormListSections[]
}

const FormList: React.FC<FormListProps> = ({ sections }) => {
    const theme: Theme = useTheme()
    const colors = theme.colors as Colors
    return (
        <>
            {sections.map((section, sectionIndex) => (
                <View
                    key={sectionIndex}
                    style={{ marginTop: 15, width: '92%', alignSelf: 'center' }}
                >
                    <Text
                        style={{
                            fontSize: 12,
                            color: '#999',
                            fontWeight: 'normal',
                            textTransform: 'uppercase',
                            marginBottom: 6,
                        }}
                    >
                        {section.header}
                    </Text>

                    <View
                        style={{
                            alignSelf: 'center',
                            backgroundColor: colors.secondary,
                            borderRadius: 8,
                            width: '100%',
                            marginTop: 2,
                            justifyContent: 'center',
                        }}
                    >
                        {section.items.map((item, index) => (
                            <React.Fragment key={index}>
                                <Pressable
                                    onPress={item.onPress}
                                    style={({ pressed }) => [
                                        { opacity: pressed ? 0.5 : 1 },
                                        { padding: 8 },
                                    ]}
                                    disabled={item.disabled ?? false}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingHorizontal: 5,
                                            paddingVertical: 4,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                marginLeft: 8,
                                                fontSize: 16,
                                                color: colors.text,
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                        {item.value != null && (
                                            <Text
                                                style={{
                                                    marginRight: 8,
                                                    fontSize: 16,
                                                    color: '#999',
                                                }}
                                            >
                                                {item.value}
                                            </Text>
                                        )}
                                        {item.icon != null && (
                                            <Ionicons
                                                name={item.icon as any}
                                                size={18}
                                                style={{ marginRight: 8 }}
                                                color={colors.text}
                                            />
                                        )}
                                    </View>
                                </Pressable>
                                {index < section.items.length - 1 && (
                                    <Divider />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            ))}
        </>
    )
}

export default FormList
