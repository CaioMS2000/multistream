import { useWindowSize } from './use-window-size'

const ASPECT_RATIO = 1.777777777777778 as const // 16 / 9

export function useGridLayout(
	cols: number,
	streamCount = 0,
	insets: { top?: number; right?: number } = {}
) {
	let { width, height } = useWindowSize()

	if (cols <= 0) {
		return {
			cols: 0,
			rows: 0,
			totalSlots: 0,
			playerWidth: 0,
			playerHeight: 0,
		}
	}

	width = width - (insets.right ?? 0)
	height = height - (insets.top ?? 0)

	const rows = Math.ceil(streamCount / cols)
	let playerWidth = width / cols
	let playerHeight = playerWidth / ASPECT_RATIO

	if (playerHeight * rows > height) {
		playerHeight = height / rows
		playerWidth = playerHeight * ASPECT_RATIO
	}

	return {
		cols,
		rows,
		playerWidth,
		playerHeight,
	}
}
