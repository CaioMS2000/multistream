import { useMemo } from 'react'
import { useWindowSize } from './use-window-size'

const ASPECT_RATIO = 1.777777777777778 as const // 16 / 9

export function useGridLayout(
	cols: number,
	streamCount = 0,
	insets: { top?: number; right?: number } = {}
) {
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

		const usableWidth = width - (insets.right ?? 0)
		const usableHeight = height - (insets.top ?? 0)

		const playerWidth = Math.floor(usableWidth / cols)
		const naturalPlayerHeight = Math.floor(playerWidth / ASPECT_RATIO)
		const naturalRows = Math.floor(usableHeight / naturalPlayerHeight)
		const rows = Math.max(naturalRows, Math.ceil(streamCount / cols), 1)

		let finalPlayerWidth = playerWidth
		let playerHeight = Math.floor(playerWidth / ASPECT_RATIO)

		if (playerHeight * rows > usableHeight) {
			playerHeight = Math.floor(usableHeight / rows)
			finalPlayerWidth = Math.floor(playerHeight * ASPECT_RATIO)
		}

		const totalSlots = cols * rows

		return {
			cols,
			rows,
			totalSlots,
			playerWidth: finalPlayerWidth,
			playerHeight,
		}
	}, [cols, streamCount, width, height, insets.top, insets.right])
}
