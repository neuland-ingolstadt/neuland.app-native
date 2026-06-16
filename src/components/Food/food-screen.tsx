/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO */
import { useQuery } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import {
	memo,
	useCallback,
	useDeferredValue,
	useEffect,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'
import {
	Animated,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import { FoodLoadingIndicator, MealDay } from '@/components/Food'
import { AllergensBanner } from '@/components/Food/allergens-banner'
import PagerView from '@/components/Layout/pager-view'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { Food } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { formatISODate } from '@/utils/date-utils'
import { loadFoodEntries } from '@/utils/food-utils'
