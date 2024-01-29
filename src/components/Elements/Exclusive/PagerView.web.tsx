import type React from 'react';
import {
    type FC,
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react'

interface PagerViewProps {
    initialPage?: number
    onPageSelected?: (event: { nativeEvent: { position: number } }) => void
    scrollEnabled?: boolean
    overdrag?: boolean
    children: React.ReactElement[]
}

const PagerView: FC<PagerViewProps> = (
    { initialPage, children },
    ref
): React.ReactElement => {
    const [page, setPage] = useState(initialPage ?? 0)
    useImperativeHandle(
        ref,
        () => {
            return {
                setPage: (newPage: number) => {
                    console.log('page', newPage)
                    setPage(newPage)
                },
            }
        },
        []
    )
    return children[page]
}

export default forwardRef(PagerView)
