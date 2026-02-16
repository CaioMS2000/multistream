import { useMemo } from 'react'
import { useWindowSize } from './use-window-size'

const _ASPECT_RATIO = 16 / 9
// const ASPECT_RATIO = _ASPECT_RATIO as const -> TS error
const ASPECT_RATIO = 1.777777777777778 as const

export function useGridLayout(count: number) {
	const { width, height } = useWindowSize()

	return useMemo(() => {
		if (count <= 0) {
			return { cols: 0, rows: 0, playerWidth: 0, playerHeight: 0 }
		}

		let bestLayout = { cols: 1, rows: count, playerWidth: 0, playerHeight: 0 }
		let bestArea = 0

		for (let cols = 1; cols <= count; cols++) {
			const rows = Math.ceil(count / cols)
			const cellWidth = width / cols
			const cellHeight = height / rows

			let playerWidth: number
			let playerHeight: number

			if (cellWidth / cellHeight > ASPECT_RATIO) {
				playerHeight = cellHeight
				playerWidth = cellHeight * ASPECT_RATIO
			} else {
				playerWidth = cellWidth
				playerHeight = cellWidth / ASPECT_RATIO
			}

			const area = playerWidth * playerHeight
			if (area > bestArea) {
				bestArea = area
				bestLayout = {
					cols,
					rows,
					playerWidth: Math.floor(playerWidth),
					playerHeight: Math.floor(playerHeight),
				}
			}
		}

		return bestLayout
	}, [count, width, height])
}
