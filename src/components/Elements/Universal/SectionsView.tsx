import { PAGE_PADDING } from '@/utils/style-utils'
import React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const SectionView = ({
    title,
    footer,
    children,
    link,
}: {
    title?: string
    footer?: string
    children: JSX.Element
    link?: { text: string; destination: () => void }
}): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    return (
        <>
            <View style={styles.sectionContainer}>
                {title !== '' && title !== undefined && (
                    <Text style={styles.labelText}>{title}</Text>
                )}
                <View style={styles.sectionBox}>{children}</View>
            </View>
            {footer != null && (
                <Text style={styles.footerText(false)}>
                    {footer}
                    {link != null && (
                        <Text
                            onPress={link.destination}
                            style={styles.footerText(true)}
                        >
                            {' '}
                            {link.text}
                        </Text>
                    )}
                </Text>
            )}
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    footerText: (isLink: boolean) => ({
        marginTop: 6,
        fontSize: 12.5,
        paddingHorizontal: PAGE_PADDING,
        color: isLink ? theme.colors.primary : theme.colors.labelSecondaryColor,
    }),
    labelText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
        color: theme.colors.labelSecondaryColor,
    },
    sectionContainer: {
        marginTop: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        marginTop: 2,
        justifyContent: 'center',
        backgroundColor: theme.colors.card,
    },
}))

export default SectionView
