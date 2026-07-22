import { useNavigation } from 'expo-router'
import type React from 'react'
import { use, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import PagerView from '@/components/Layout/pager-view'
import LecturerList from '@/components/Lecturers/lecturer-list'
import LecturerSearchSectionList from '@/components/Lecturers/lecturer-search-section-list'
import { lecturersStyles as styles } from '@/components/Lecturers/lecturers-styles'
import ToggleRow from '@/components/Universal/toggle-row'
import { USER_GUEST } from '@/data/constants'
import { useLecturersData } from '@/hooks/useLecturersData'
import { guestError } from '@/utils/api-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function LecturersScreen(): React.JSX.Element {
	const { userKind = USER_GUEST } = use(UserKindContext)
	const navigation = useNavigation()
	const [selectedPage, setSelectedPage] = useState(0)
	const textColor = toColor(useCSSVariable('--color-text'))
	const { t } = useTranslation('common')
	const pagerViewRef = useRef<PagerView>(null)
	const [localSearch, setLocalSearch] = useState('')
	const [isSearchBarFocused, setLocalSearchBarFocused] = useState(false)

	const {
		allLecturersResult,
		personalLecturersResult,
		isRefetchingByUserPersonal,
		refetchByUserPersonal,
		isRefetchingByUserAll,
		refetchByUserAll,
		facultyData,
		displaysProfessors,
		filteredLecturers,
		sections
	} = useLecturersData(localSearch)

	function setPage(page: number): void {
		pagerViewRef.current?.setPage(page)
	}

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				placeholder: t('navigation.lecturers.search', {
					ns: 'navigation'
				}),

				...Platform.select({
					android: {
						headerIconColor: textColor,
						hintTextColor: textColor,
						textColor
					}
				}),
				shouldShowHintSearchIcon: false,
				hideWhenScrolling: false,
				hideNavigationBar: false,
				onChangeText: (event: { nativeEvent: { text: string } }) => {
					const text = event.nativeEvent.text
					setLocalSearch(text)
				},
				onFocus: () => {
					setLocalSearchBarFocused(true)
				},
				onClose: () => {
					setLocalSearchBarFocused(false)
				},
				onCancelButtonPress: () => {
					setLocalSearchBarFocused(false)
				}
			}
		})
	}, [navigation, t, textColor])

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.page} edges={['top']}>
				{userKind === USER_GUEST ? (
					<ErrorView title={guestError} />
				) : !isSearchBarFocused ? (
					<View style={styles.searchContainer}>
						<View style={styles.viewHorizontal}>
							<ToggleRow
								items={[
									t('pages.lecturers.personal'),
									displaysProfessors
										? t('pages.lecturers.professors')
										: t('pages.lecturers.faculty')
								]}
								selectedElement={selectedPage}
								setSelectedElement={setPage}
							/>
						</View>
						<PagerView
							style={styles.page}
							initialPage={selectedPage}
							onPageSelected={(e) => {
								setSelectedPage(e.nativeEvent.position)
							}}
							ref={pagerViewRef}
						>
							<View key="personal" style={styles.page} collapsable={false}>
								<LecturerList
									lecturers={personalLecturersResult.data}
									isPaused={personalLecturersResult.isPaused}
									isError={personalLecturersResult.isError}
									isSuccess={personalLecturersResult.isSuccess}
									error={personalLecturersResult.error}
									isLoading={personalLecturersResult.isLoading}
									isPersonal
									isRefetchingByUserPersonal={isRefetchingByUserPersonal}
									isRefetchingByUserAll={isRefetchingByUserAll}
									allLecturersIsRefetching={allLecturersResult.isRefetching}
									refetchByUserPersonal={refetchByUserPersonal}
									refetchByUserAll={refetchByUserAll}
								/>
							</View>
							<View key="faculty" style={styles.page} collapsable={false}>
								<LecturerList
									lecturers={facultyData}
									isPaused={allLecturersResult.isPaused}
									isError={allLecturersResult.isError}
									isSuccess={allLecturersResult.isSuccess}
									error={allLecturersResult.error}
									isLoading={allLecturersResult.isLoading}
									isRefetchingByUserPersonal={isRefetchingByUserPersonal}
									isRefetchingByUserAll={isRefetchingByUserAll}
									allLecturersIsRefetching={allLecturersResult.isRefetching}
									refetchByUserPersonal={refetchByUserPersonal}
									refetchByUserAll={refetchByUserAll}
								/>
							</View>
						</PagerView>
					</View>
				) : (
					<LecturerSearchSectionList
						isLoading={allLecturersResult.isLoading}
						isPaused={allLecturersResult.isPaused}
						isError={allLecturersResult.isError}
						error={allLecturersResult.error}
						isRefetchingByUserAll={isRefetchingByUserAll}
						refetchByUserAll={refetchByUserAll}
						filteredLecturersCount={filteredLecturers.length}
						sections={sections}
					/>
				)}
			</SafeAreaView>
		</SafeAreaProvider>
	)
}
