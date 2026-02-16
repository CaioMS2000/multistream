import { useMemo } from 'react'
import { useWindowSize } from './use-window-size'

const ASPECT_RATIO = 1.777777777777778 as const // 16 / 9

export function useGridLayout(cols: number) {
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
		const playerHeight = Math.floor(playerWidth / ASPECT_RATIO)
		const rows = Math.floor(height / playerHeight)
		const totalSlots = cols * rows

		return { cols, rows, totalSlots, playerWidth, playerHeight }
	}, [cols, width, height])
}
