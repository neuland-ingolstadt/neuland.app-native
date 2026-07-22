import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import type { Meal } from '@/types/neuland-api'
import { formatPrice } from '@/utils/food-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

interface MealPriceRowProps {
	prices: Meal['prices']
	userKind: string
}

export function MealPriceRow({
	prices,
	userKind
}: MealPriceRowProps): React.JSX.Element | null {
	const { t } = useTranslation('food')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const primaryBackgroundColor = toColor(
		useCSSVariable('--color-primary-background')
	)

	const studentPrice = formatPrice(prices?.student)
	const employeePrice = formatPrice(prices?.employee)
	const guestPrice = formatPrice(prices?.guest)
	const isPriceAvailable =
		studentPrice !== '' && employeePrice !== '' && guestPrice !== ''

	if (!isPriceAvailable) {
		return null
	}

	return (
		<View className="flex-row gap-2 mb-4">
			<View
				className="flex-1 bg-card-sheet rounded-md p-3 items-center border-border"
				style={[
					hairlineBorder,
					userKind === USER_STUDENT
						? {
								backgroundColor: primaryBackgroundColor,
								borderColor: primaryColor
							}
						: undefined
				]}
			>
				<Text className="text-label text-xs mb-1 text-center">
					{t('details.formlist.prices.student')}
				</Text>
				<Text
					className={`text-base font-semibold text-center ${
						userKind === USER_STUDENT ? 'text-primary' : 'text-text'
					}`}
				>
					{studentPrice}
				</Text>
			</View>
			<View
				className="flex-1 bg-card-sheet rounded-md p-3 items-center border-border"
				style={[
					hairlineBorder,
					userKind === USER_EMPLOYEE
						? {
								backgroundColor: primaryBackgroundColor,
								borderColor: primaryColor
							}
						: undefined
				]}
			>
				<Text className="text-label text-xs mb-1 text-center">
					{t('details.formlist.prices.employee')}
				</Text>
				<Text
					className={`text-base font-semibold text-center ${
						userKind === USER_EMPLOYEE ? 'text-primary' : 'text-text'
					}`}
				>
					{employeePrice}
				</Text>
			</View>
			<View
				className="flex-1 bg-card-sheet rounded-md p-3 items-center border-border"
				style={[
					hairlineBorder,
					userKind === USER_GUEST
						? {
								backgroundColor: primaryBackgroundColor,
								borderColor: primaryColor
							}
						: undefined
				]}
			>
				<Text className="text-label text-xs mb-1 text-center">
					{t('details.formlist.prices.guest')}
				</Text>
				<Text
					className={`text-base font-semibold text-center ${
						userKind === USER_GUEST ? 'text-primary' : 'text-text'
					}`}
				>
					{guestPrice}
				</Text>
			</View>
		</View>
	)
}
