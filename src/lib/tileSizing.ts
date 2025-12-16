export type TileSizeParams = {
	containerWidth: number
	containerHeight: number
	numStreams: number
	cols: number
	headerHeight: number
	marginTop: number
	currentSize?: { w: number; h: number }
	preventShrinkOnRowAdd?: boolean
}

export type TileSize = { w: number; h: number }

const GAP = 8 // px, matches gap-2 in Tailwind

export function calculateOptimalTileSize(params: TileSizeParams): TileSize {
	const {
		containerWidth,
		containerHeight,
		numStreams,
		cols,
		headerHeight,
		marginTop,
		currentSize,
		preventShrinkOnRowAdd = true,
	} = params

	const n = numStreams || 0
	const c = Math.max(1, cols)
	const rows = Math.max(1, Math.ceil((n || 1) / c))

	const availH = Math.max(0, containerHeight - headerHeight - marginTop)
	const colGapTotal = (c - 1) * GAP
	const rowGapTotal = (rows - 1) * GAP

	// Calcula tamanho baseado na largura disponível
	const widthPerCol = Math.floor((containerWidth - colGapTotal) / c)
	const heightFromWidth = Math.floor((widthPerCol * 9) / 16)

	// Otimização: Verifica primeiro se pode manter o tamanho atual
	// Evita cálculos desnecessários quando o tamanho não precisa mudar
	if (preventShrinkOnRowAdd && currentSize && currentSize.w > 0) {
		const totalH = rows * currentSize.h + rowGapTotal
		const totalW = c * currentSize.w + colGapTotal

		// Se cabe na largura e altura disponíveis
		if (totalW <= containerWidth && totalH <= availH) {
			// Verifica se não é menor que o tamanho baseado na largura
			if (currentSize.w >= widthPerCol) {
				return currentSize
			}
			// Se for menor, pode ser que caiba um tamanho maior - continua calculando
		}
	}

	// Calcula tamanho baseado na altura disponível
	const maxHPerTile = Math.floor((availH - rowGapTotal) / rows)
	const widthFromHeight = Math.floor((maxHPerTile * 16) / 9)

	// Escolhe o MAIOR tamanho possível que cabe em ambas as dimensões
	const totalWidthIfUsingHeight = c * widthFromHeight + colGapTotal

	if (totalWidthIfUsingHeight <= containerWidth) {
		// Usa tamanho baseado na altura (maximiza espaço vertical)
		return { w: widthFromHeight, h: maxHPerTile }
	}

	// Usa tamanho baseado na largura
	return { w: widthPerCol, h: heightFromWidth }
}
