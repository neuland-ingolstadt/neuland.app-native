import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from './Icon'

interface SectionPickerProps {
    title: string
    selectedItem: boolean
    action: (state: boolean) => void
    state: boolean
}

/**
 * A component that renders a single selectable item with a title and a checkmark icon.
 * @param {string} title - The title of the item.
 * @param {boolean} selectedItem - Whether the item is selected.
 * @param {() => void} action - The function to be called when the item is selected.
 * @param {boolean} state - The state of the item.
 * @returns {JSX.Element} - The MultiSectionPicker component.
 * @example
 * <SingleSectionPicker
 *      title={'Title'}
 *      selectedItem={selected}
 *      action={() => {
 *         setSelected(!selected)
 *    }}
 * />
 */
const SingleSectionPicker: React.FC<SectionPickerProps> = ({
    title,
    selectedItem,
    action,
}) => {
    const { styles } = useStyles(stylesheet)
    return (
        <>
            <React.Fragment>
                <Pressable
                    onPressOut={() => {
                        action(!selectedItem)
                    }}
                    style={styles.button}
                >
                    <View style={styles.container}>
                        <Text style={styles.text}>{title}</Text>
                        {selectedItem ? (
                            <PlatformIcon
                                ios={{
                                    name: 'checkmark',
                                    size: 15,
                                }}
                                android={{
                                    name: 'check',
                                    size: 18,
                                }}
                                web={{
                                    name: 'Check',
                                    size: 18,
                                }}
                            />
                        ) : null}
                    </View>
                </Pressable>
            </React.Fragment>
        </>
    )
}

export default SingleSectionPicker

const stylesheet = createStyleSheet((theme) => ({
    button: {
        padding: 8,
    },
    container: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 8,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    text: {
        color: theme.colors.text,
        fontSize: 16,
        paddingVertical: 1,
    },
}))
