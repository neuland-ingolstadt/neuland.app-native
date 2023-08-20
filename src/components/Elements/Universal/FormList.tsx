import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@/stores/types/components'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

interface FormListProps {
    sections: FormListSections[]
}

/**
 * A component that renders a list of forms with headers and footers.
 * @param {FormListSections[]} sections - An array of sections, each containing a header, footer, and an array of items.
 * @returns {JSX.Element} - A React component that renders the list of forms.
 */
const FormList: React.FC<FormListProps> = ({ sections }) => {
    const colors = useTheme().colors as Colors
    return (
        <>
            {sections.map((section, sectionIndex) => (
                <View
                    key={sectionIndex}
                    style={{ marginTop: 18, width: '92%', alignSelf: 'center' }}
                >
                    <Text
                        style={{
                            fontSize: 13,
                            color: colors.labelSecondaryColor,
                            fontWeight: 'normal',
                            textTransform: 'uppercase',
                            marginBottom: 4,
                        }}
                    >
                        {section.header}
                    </Text>

                    <View
                        style={{
                            alignSelf: 'center',
                            backgroundColor: colors.card,
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
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                marginLeft: 8,
                                                fontSize: 16,
                                                color: colors.text,
                                                maxWidth: '50%',
                                            }}
                                        >
                                            {item.title}
                                        </Text>
                                        {item.value != null && (
                                            <Text
                                                style={{
                                                    marginRight: 8,
                                                    paddingLeft: 20,
                                                    fontSize: 16,
                                                    color:
                                                        item.iconColor ??
                                                        colors.labelColor,
                                                    maxWidth: '70%',
                                                    textAlign: 'right',
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
                                                color={
                                                    item.iconColor ??
                                                    colors.labelSecondaryColor
                                                }
                                            />
                                        )}
                                    </View>
                                </Pressable>
                                {index < section.items.length - 1 && (
                                    <Divider
                                        color={colors.labelTertiaryColor}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                    {section.footer != null && (
                        <Text
                            style={{
                                fontSize: 12,
                                alignSelf: 'flex-start',
                                color: colors.labelSecondaryColor,
                                fontWeight: '400',
                                marginTop: 6,
                            }}
                        >
                            {section.footer}
                        </Text>
                    )}
                </View>
            ))}
        </>
    )
}

export default FormList
