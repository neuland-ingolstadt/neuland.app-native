import {
	type Ref,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState
} from 'react'

interface TabLayoutProps {
	initialPage: number
	onPageSelected: (e: { nativeEvent: { position: number } }) => void
	children: JSX.Element[]
}

const TabLayout = (
	{ initialPage, onPageSelected, children }: TabLayoutProps,
	ref: Ref<{ setPage: (i: number) => void }>
): React.JSX.Element => {
	const [page, setPage] = useState<number>(initialPage)

	useImperativeHandle(
		ref,
		() => ({
			setPage: (i: number) => {
				setPage(i)
				onPageSelected({ nativeEvent: { position: i } })
			}
		}),
		[onPageSelected]
	)

	useEffect(() => {
		onPageSelected({ nativeEvent: { position: page } })
	}, [page, onPageSelected])

	return children[page]
}

export default forwardRef(TabLayout)
