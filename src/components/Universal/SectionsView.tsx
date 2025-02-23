import type React from 'react'
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
}): React.JSX.Element => {
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
        paddingHorizontal: theme.margins.page,
        color: isLink ? theme.colors.primary : theme.colors.labelSecondaryColor,
    }),
    labelText: {
        color: theme.colors.labelSecondaryColor,
        fontSize: 13,
        fontWeight: 'normal',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    sectionBox: {
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        marginTop: 2,
        width: '100%',
    },
    sectionContainer: {
        alignSelf: 'center',
        marginTop: 16,
        paddingHorizontal: theme.margins.page,
        width: '100%',
    },
}))

export default SectionView
