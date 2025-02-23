import { useEffect, useRef } from 'react';

/**
 * Hook that calls a callback function at a given interval.
 * @param callback
 * @param delay
 */
export function useInterval(callback: () => void, delay: number | null): void {
	const savedCallback = useRef<(() => void) | null>(null);

	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		function tick(): void {
			if (savedCallback.current != null) {
				savedCallback.current();
			}
		}

		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => {
				clearInterval(id);
			};
		}
	}, [delay]);
}
