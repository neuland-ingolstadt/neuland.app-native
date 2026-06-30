import React from 'react'
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native'
import { useCSSVariable, useResolveClassNames } from 'uniwind'
import Divider from '@/components/Universal/divider'
import type { FormListSections, SectionGroup } from '@/types/components'
import { copyToClipboard } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import PlatformIcon from './icon'

interface FormListProps {
	sections: FormListSections[]
	rowStyle?: ViewStyle
	privacyHidden?: boolean
	sheet?: boolean
}

interface RenderSectionFrameProps {
	sectionIndex: number
	children: React.ReactNode
	footer?: string
	header?: string
}

interface RenderSectionItemProps {
	sectionIndex: number
	section: FormListSections
	sheet: boolean
}

const blockCardClassName = (sheet: boolean): string =>
	sheet
		? 'bg-card-sheet ios:rounded-ios android:rounded-md border-border overflow-hidden'
		: 'bg-card ios:rounded-ios android:rounded-md border-border overflow-hidden'

const itemSectionClassName = (sheet: boolean): string =>
	sheet
		? 'bg-card-sheet ios:rounded-ios android:rounded-md border-border overflow-hidden px-4 py-[13px]'
		: 'bg-card ios:rounded-ios android:rounded-md border-border overflow-hidden px-4 py-[13px]'

const RenderSectionItem = ({
	sectionIndex,
	section,
	sheet
}: RenderSectionItemProps): React.JSX.Element => {
	return (
		<View key={sectionIndex} className="gap-1.5">
			<View className={itemSectionClassName(sheet)} style={hairlineBorder}>
				{typeof section.item === 'string' ? (
					<Text className="text-text text-base pt-0.5 text-left">
						{section.item}
					</Text>
				) : (
					section.item
				)}
			</View>
		</View>
	)
}

const RenderSectionFrame = ({
	sectionIndex,
	children,
	footer,
	header
}: RenderSectionFrameProps): React.JSX.Element => {
	return (
		<View key={sectionIndex} className="gap-1.5">
			{header != null && (
				<Text className="text-label-secondary ios:text-base ios:ml-[18px] ios:font-semibold android:text-[13px] android:font-normal android:uppercase">
					{header}
				</Text>
			)}
			{children}
			{footer != null && (
				<Text className="text-label-secondary text-xs font-normal ios:mx-4 android:mx-0">
					{footer}
				</Text>
			)}
		</View>
	)
}

interface RenderSectionItemsProps {
	items: SectionGroup[]
	privacyHidden: boolean
	rowStyle?: ViewStyle
	sheet: boolean
}

const RenderSectionItems = ({
	items,
	privacyHidden,
	rowStyle,
	sheet
}: RenderSectionItemsProps): React.JSX.Element => {
	const labelColor = toColor(useCSSVariable('--color-label'))
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelTertiaryColor = toColor(useCSSVariable('--color-label-tertiary'))
	const columnDetailsStyle = useResolveClassNames(
		'text-text text-base pt-0.5 text-left'
	)
	const rowDetailsStyle = useResolveClassNames(
		'text-base text-right pl-px shrink'
	)

	const handlePress = (onPress?: () => Promise<void> | void): void => {
		if (onPress != null) {
			Promise.resolve(onPress()).catch((error) => {
				console.error(error)
			})
		}
	}

	const handleTextCopy = async (text: string): Promise<void> => {
		await copyToClipboard(text)
	}

	const renderValueText = (item: SectionGroup) => {
		const textComponent = (
			<Text
				style={[
					item.layout === 'column' ? columnDetailsStyle : rowDetailsStyle,
					{
						color: item.textColor ?? labelColor,
						fontWeight: item.fontWeight ?? 'normal'
					}
				]}
				selectable={item.selectable ?? false}
			>
				{item.value}
			</Text>
		)

		if (item.copyable && item.value != null) {
			return (
				<Pressable
					onPress={() =>
						handleTextCopy(
							typeof item.copyable === 'string'
								? item.copyable
								: (item.value?.toString() ?? '')
						)
					}
					className="active:opacity-70"
				>
					{textComponent}
				</Pressable>
			)
		}

		return textComponent
	}

	return (
		<View className={blockCardClassName(sheet)} style={hairlineBorder}>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						onPress={() => {
							handlePress(item.onPress)
						}}
						className="w-full active:opacity-90"
						disabled={item.disabled ?? item.onPress === undefined}
					>
						<View
							className={
								item.layout === 'column'
									? 'flex-row items-start py-3.5 px-0'
									: 'flex-row items-center py-[15px]'
							}
							style={rowStyle}
						>
							{item.icon != null && item.icon.endIcon !== true && (
								<View className="w-7 items-center justify-center ml-4">
									<PlatformIcon
										ios={{
											name: item.icon.ios,
											fallback: item.icon.iosFallback,
											size: (item.icon.iosFallback ?? false) ? 22 : 18
										}}
										android={{
											name: item.icon.android,
											size: 20,
											variant: item.icon.androidVariant ?? 'outlined'
										}}
										web={{
											name: item.icon.web,
											size: 20
										}}
										style={{
											color: item.iconColor ?? textColor
										}}
									/>
								</View>
							)}

							<View
								className={
									item.layout === 'column'
										? 'flex-1 flex-col items-start gap-1 pl-4 pr-2'
										: 'flex-1 flex-row justify-between items-center pl-4 pr-2'
								}
							>
								{item.title != null && (
									<Text className="text-text text-base pr-2">{item.title}</Text>
								)}

								{item.value != null && !privacyHidden && renderValueText(item)}
								{!item.value &&
									item.customComponent &&
									!privacyHidden &&
									item.customComponent([
										item.layout === 'column'
											? columnDetailsStyle
											: rowDetailsStyle,
										{
											color: item.textColor ?? labelColor,
											fontWeight: item.fontWeight ?? 'normal'
										}
									])}
							</View>

							{(item.value != null || item.customComponent != null) && (
								<View className="mr-3" />
							)}

							{item.icon?.endIcon ? (
								<View className="mr-4 items-center justify-center w-[22px]">
									<PlatformIcon
										ios={{
											name: item.icon.ios,
											fallback: item.icon.iosFallback,
											size: (item.icon.iosFallback ?? false) ? 22 : 18
										}}
										android={{
											name: item.icon.android,
											size: 20,
											variant: item.icon.androidVariant ?? 'outlined'
										}}
										web={{
											name: item.icon.web,
											size: 20
										}}
										style={{
											color: item.iconColor ?? textColor
										}}
									/>
								</View>
							) : (
								item.onPress != null &&
								item.hideChevron !== true &&
								item.value == null && (
									<View className="mr-4 items-center justify-center w-[22px]">
										<PlatformIcon
											ios={{
												name: 'chevron.right',
												size: 10,
												weight: 'semibold'
											}}
											android={{
												name: 'chevron_right',
												size: 19
											}}
											web={{
												name: 'ChevronRight',
												size: 16
											}}
											style={{
												color: labelTertiaryColor
											}}
										/>
									</View>
								)
							)}
						</View>
					</Pressable>

					{index < items.length - 1 && (
						<View className="w-full">
							<Divider
								paddingLeft={
									item.icon && (item.icon.endIcon ?? false) !== true
										? 60
										: Platform.OS === 'ios'
											? 16
											: 0
								}
							/>
						</View>
					)}
				</React.Fragment>
			))}
		</View>
	)
}

/**
 * A component that renders a list of forms with headers and footers.
 * @param {FormListSections[]} sections - An array of sections, each containing a header, footer, and an array of items.
 * @returns {React.JSX.Element} - A React component that renders the list of forms.
 */
const FormList = ({
	sections,
	rowStyle,
	privacyHidden,
	sheet = false
}: FormListProps): React.JSX.Element => {
	return (
		<View className="gap-4 w-full">
			{sections.map((section, sectionIndex) =>
				section.items !== undefined && section.items.length > 0 ? (
					<RenderSectionFrame
						key={sectionIndex}
						sectionIndex={sectionIndex}
						header={section.header}
						footer={section.footer}
					>
						<RenderSectionItems
							items={section.items}
							rowStyle={rowStyle}
							privacyHidden={privacyHidden ?? false}
							sheet={sheet}
						/>
					</RenderSectionFrame>
				) : section.item != null ? (
					<RenderSectionFrame
						key={sectionIndex}
						sectionIndex={sectionIndex}
						header={section.header}
						footer={section.footer}
					>
						<RenderSectionItem
							sectionIndex={sectionIndex}
							section={section}
							sheet={sheet}
						/>
					</RenderSectionFrame>
				) : null
			)}
		</View>
	)
}

export default FormList
