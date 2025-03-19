import { defaultQuicklinks } from '@/data/constants';
import { zustandStorage } from '@/utils/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const DEFAULT_ACCENT_COLOR = 'blue';

export enum TimetableMode {
	List = 'list',
	Timeline1 = 'timeline-1',
	Timeline3 = 'timeline-3',
	// 5 mode scrolls by 5 at a time
	Timeline5 = 'timeline-5',
	Timeline7 = 'timeline-7'
}

interface PreferencesStore {
	accentColor: string;
	theme: string;
	language: 'de' | 'en' | undefined;
	appIcon: string | undefined;
	unlockedAppIcons: string[];
	timetableMode: TimetableMode;
	selectedDate: Date;
	recentQuicklinks: string[];
	setAccentColor: (language: string) => void;
	setTheme: (theme: string) => void;
	setLanguage: (language: 'en' | 'de') => void;
	setAppIcon: (name: string) => void;
	addUnlockedAppIcon: (name: string) => void;
	setTimetableMode: (timetableMode: TimetableMode) => void;
	setSelectedDate: (date: Date) => void;
	addRecentQuicklink: (quicklink: string) => void;
	reset: () => void;
}

const initialState: Omit<
	PreferencesStore,
	| 'setAccentColor'
	| 'setTheme'
	| 'setAppIcon'
	| 'addUnlockedAppIcon'
	| 'setTimetableMode'
	| 'setSelectedDate'
	| 'addRecentQuicklink'
	| 'reset'
	| 'setLanguage'
> = {
	accentColor: DEFAULT_ACCENT_COLOR,
	appIcon: undefined,
	language: undefined,
	theme: 'auto',
	unlockedAppIcons: [],
	timetableMode: TimetableMode.Timeline3,
	selectedDate: new Date(),
	recentQuicklinks: defaultQuicklinks
};

export const usePreferencesStore = create<PreferencesStore>()(
	persist(
		(set) => ({
			...initialState,
			setAccentColor: (accentColor: string) => {
				set({ accentColor });
			},
			setTheme: (theme: string) => {
				set({ theme });
			},
			setLanguage: (language: 'de' | 'en') => {
				set({ language });
			},
			setAppIcon: (appIcon: string) => {
				set({ appIcon });
			},
			addUnlockedAppIcon: (name: string) => {
				set((state) => {
					const newUnlockedAppIcons = new Set([
						...state.unlockedAppIcons,
						name
					]);
					return { unlockedAppIcons: Array.from(newUnlockedAppIcons) };
				});
			},
			setTimetableMode: (timetableMode: TimetableMode) => {
				set({ timetableMode });
			},
			setSelectedDate: (selectedDate: Date) => {
				set({ selectedDate });
			},
			addRecentQuicklink: (quicklink: string) => {
				set((state) => {
					const existingQuicklinks = state.recentQuicklinks ?? [];
					const updatedQuicklinks = [quicklink, ...existingQuicklinks];
					const uniqueQuicklinks = Array.from(new Set(updatedQuicklinks));
					const neededQuicklinks = 3 - uniqueQuicklinks.length;
					const additionalQuicklinks =
						neededQuicklinks > 0
							? defaultQuicklinks
									.filter((link) => !uniqueQuicklinks.includes(link))
									.slice(0, neededQuicklinks)
							: [];

					const finalQuicklinks = [
						...uniqueQuicklinks,
						...additionalQuicklinks
					].slice(0, 3);
					return { recentQuicklinks: finalQuicklinks };
				});
			},
			reset: () => {
				set(initialState);
				zustandStorage.removeItem('app-storage');
			}
		}),
		{
			name: 'app-storage',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
);
