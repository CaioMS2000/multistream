import { useMemo } from 'react'
import { useWindowSize } from './use-window-size'

const ASPECT_RATIO = 1.777777777777778 as const // 16 / 9

export function useGridLayout(cols: number, streamCount = 0) {
	const { width, height } = useWindowSize()

	return useMemo(() => {
		if (cols <= 0) {
			return {
				cols: 0,
				rows: 0,
				totalSlots: 0,
				playerWidth: 0,
				playerHeight: 0,
			}
		}

		const playerWidth = Math.floor(width / cols)
		const naturalPlayerHeight = Math.floor(playerWidth / ASPECT_RATIO)
		const naturalRows = Math.floor(height / naturalPlayerHeight)
		const rows = Math.max(naturalRows, Math.ceil(streamCount / cols), 1)
		const playerHeight = Math.floor(height / rows)
		const totalSlots = cols * rows

		return { cols, rows, totalSlots, playerWidth, playerHeight }
	}, [cols, streamCount, width, height])
}
