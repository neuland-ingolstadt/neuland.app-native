export const lightTheme = {
	colors: {
		typography: '#000000',
		background: 'rgb(242, 242, 242)',
		labelTertiaryColor: '#99999a',
		labelSecondaryColor: '#777778',
		labelColor: '#606062',
		labelBackground: '#d4d2d2',
		success: '#1fa31f',
		datePickerBackground: '#ebebec',
		card: 'rgb(255, 255, 255)',
		cardButton: '#f2f2f2',
		notification: 'rgb(255, 59, 48)',
		warning: '#f48e00',
		inputBackground: '#e9e9e9',
		contrast: '#ffffff',
		cardContrast: '#eeeeee',
		border: 'rgb(216, 216, 216)',
		text: 'rgb(28, 28, 30)',
		primary: '#0079fa', // default blue, updated dynamically in provider
		sheetButton: '#ffffff',
		vegGreen: 'rgba(51,196,58,0.6)'
	},
	margins: {
		page: 12,
		card: 16,
		bottomSafeArea: 90,
		modalBottomMargin: 32,
		rowPadding: 5
	},
	radius: {
		sm: 4,
		md: 8,
		mg: 10,
		lg: 12,
		infinite: 9999
	}
} as const;

export const darkTheme = {
	colors: {
		typography: '#ffffff',
		background: 'rgb(1, 1, 1)',
		labelSecondaryColor: '#8e8e8f',
		labelTertiaryColor: '#4b4b4c',
		labelColor: '#a4a4a5',
		labelBackground: '#4a4a4a',
		success: '#37d837',
		datePickerBackground: '#2a2a2c',
		card: 'rgb(18, 18, 18)',
		cardButton: '#262626',
		notification: 'rgb(255, 69, 58)',
		warning: '#ff9900',
		inputBackground: '#383838',
		contrast: '#000000',
		cardContrast: '#1c1c1d',
		border: 'rgb(39, 39, 41)',
		text: 'rgb(229, 229, 231)',
		primary: '#0b83ff',
		sheetButton: '#262626',
		vegGreen: 'rgb(12,103,19)'
	},
	margins: {
		page: 12,
		card: 16,
		bottomSafeArea: 90,
		modalBottomMargin: 32,
		rowPadding: 5
	},
	radius: {
		sm: 4,
		md: 8,
		mg: 10,
		lg: 12,
		infinite: 9999
	}
} as const;
