import type React from 'react'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

interface NameBoxProps {
	children: ReactNode
	title: string
	subTitle1: string
	subTitle2?: string
	showChevron?: boolean
}

/**
 * A component that displays a box with a title and two subtitles.
 *
 * @param {NameBoxProps} props - The props object.
 * @param {ReactNode} props.children - The children of the component.
 * @param {string} props.title - The title of the box.
 * @param {string} props.subTitle1 - The first subtitle of the box.
 * @param {string} [props.subTitle2] - The second subtitle of the box (optional).
 * @param {boolean} [props.showChevron] - Whether to show the chevron icon (optional).
 * @returns {React.JSX.Element} - The JSX element representing the component.
 */
const NameBox = ({
	children,
	title,
	subTitle1,
	subTitle2,
	showChevron
}: NameBoxProps): React.JSX.Element => {
	const labelSecondaryColor = toColor(useCSSVariable('--color-label-secondary'))

	return (
		<View className="flex-row items-center px-4 py-[15px] w-full">
			{children}
			<View className="items-start flex-1 justify-center ml-4 max-w-[92%]">
				<Text
					className="text-text text-lg font-bold overflow-hidden"
					numberOfLines={1}
				>
					{title}
				</Text>

				<Text
					className="text-label text-xs leading-[14px] overflow-hidden"
					numberOfLines={2}
					allowFontScaling={true}
				>
					{subTitle1}
				</Text>

				{subTitle2 !== '' && (
					<Text
						className="text-label text-xs leading-[14px] overflow-hidden"
						numberOfLines={2}
					>
						{subTitle2}
					</Text>
				)}
			</View>
			{showChevron && (
				<View className="ml-2 items-center justify-center">
					<PlatformIcon
						ios={{ name: 'chevron.forward', size: 14 }}
						android={{ name: 'chevron_right', size: 28 }}
						web={{ name: 'ChevronRight', size: 28 }}
						style={{ color: labelSecondaryColor }}
					/>
				</View>
			)}
		</View>
	)
}

export default NameBox
