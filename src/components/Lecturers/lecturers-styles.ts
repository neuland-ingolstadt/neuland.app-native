import { StyleSheet } from 'react-native'

export const PAGE_MARGIN = 12
export const BOTTOM_SAFE_AREA = 90

export const lecturersStyles = StyleSheet.create({
	contentContainer: {
		marginHorizontal: PAGE_MARGIN,
		paddingBottom: BOTTOM_SAFE_AREA
	},
	loadedRows: {
		paddingBottom: BOTTOM_SAFE_AREA,
		paddingHorizontal: PAGE_MARGIN
	},
	loadingContainer: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center'
	},
	page: {
		flex: 1
	},
	resultsCountContainer: {
		left: 0,
		position: 'relative',
		right: 0,
		zIndex: 1
	},
	rowContainer: {
		marginBottom: 8
	},
	searchContainer: {
		flex: 1,
		gap: 10,
		paddingTop: 10
	},
	viewHorizontal: {
		paddingHorizontal: PAGE_MARGIN
	}
})
