import { defineConfig } from 'vitepress';
import { de } from './de';
import { en } from './en';
import { shared } from './shared';

export default defineConfig({
	...shared,
	locales: {
		root: { label: 'Deutsch', ...de },
		en: { label: 'English', ...en }
	}
});
