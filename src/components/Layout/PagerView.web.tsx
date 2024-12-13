/*
ref={pagerViewRef}
style={{
    ...styles.pagerContainer,
    height: screenHeight,
}}
initialPage={0}
onPageSelected={(e) => {
    const page = e.nativeEvent.position
    setSelectedData(page)
    trackEvent('Route', {
        path: 'calendar/' + pages[page],
    })
}}
scrollEnabled
overdrag
*/

import { type Ref, useEffect, useImperativeHandle, useState } from "react"

export default function TabLayout({
    initialPage,
    onPageSelected,
    scrollEnabled,
    overdrag,
    children,
    ref,
}: {
    initialPage: number,
    onPageSelected: (e: any) => void,
    scrollEnabled: boolean,
    overdrag: boolean,
    children: JSX.Element[],
    ref: Ref<{ setPage: (i: number) => void }>,
}): JSX.Element {
    const [page, setPage] = useState<number>(initialPage)

    useImperativeHandle(ref, () => {
        return {
            setPage
        }
    }, [])

    useEffect(() => {
        onPageSelected({ nativeEvent: { page } })
    }, [page])

    return children[page]
}
