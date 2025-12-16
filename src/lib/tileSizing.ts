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

	// Calcula tamanho baseado na altura disponível
	const maxHPerTile = Math.floor((availH - rowGapTotal) / rows)
	const widthFromHeight = Math.floor((maxHPerTile * 16) / 9)

	console.group('🎯 Tile Sizing Calculation')
	console.log('🖥️  WINDOW SIZE:', {
		innerWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
		innerHeight: typeof window !== 'undefined' ? window.innerHeight : 'N/A',
	})
	console.log('📐 Container:', {
		width: containerWidth,
		height: containerHeight,
	})
	console.log('🎬 Layout:', { streams: numStreams, cols: c, rows })
	console.log('📏 Available Space:', { availH, colGapTotal, rowGapTotal })
	console.log('📊 Width-based:', { widthPerCol, heightFromWidth })
	console.log('📊 Height-based:', { maxHPerTile, widthFromHeight })
	console.log('📏 Space Usage:', {
		usedWidth: c * widthPerCol + colGapTotal,
		containerWidth: containerWidth,
		wastedWidth: containerWidth - (c * widthPerCol + colGapTotal),
		usedHeight: rows * heightFromWidth + rowGapTotal,
		availableHeight: availH,
		wastedHeight: availH - (rows * heightFromWidth + rowGapTotal),
	})

	// Escolhe o MAIOR tamanho possível que cabe em ambas as dimensões
	// Limitado pela largura OU pela altura, o que resultar em tiles maiores
	let optimalW: number
	let optimalH: number

	// Verifica se o tamanho baseado na altura cabe na largura total disponível
	const totalWidthIfUsingHeight = c * widthFromHeight + colGapTotal

	if (totalWidthIfUsingHeight <= containerWidth) {
		console.log(
			'✅ Usando tamanho baseado na ALTURA (maximiza espaço vertical)'
		)
		console.log(
			`   → Total width needed: ${totalWidthIfUsingHeight}, available: ${containerWidth}`
		)
		optimalW = widthFromHeight
		optimalH = maxHPerTile
	} else {
		console.log('✅ Usando tamanho baseado na LARGURA')
		console.log(
			`   → Total width needed: ${totalWidthIfUsingHeight}, available: ${containerWidth}`
		)
		optimalW = widthPerCol
		optimalH = heightFromWidth
	}

	console.log('🎯 Optimal size:', { w: optimalW, h: optimalH })

	// Otimização: Tenta manter tamanho atual se couber
	if (preventShrinkOnRowAdd && currentSize && currentSize.w > 0) {
		const totalH = rows * currentSize.h + rowGapTotal
		const totalW = c * currentSize.w + colGapTotal
		const fitsHeight = totalH <= availH
		const fitsWidth = totalW <= containerWidth

		console.log('🔄 Checking if current size fits:', {
			current: currentSize,
			totalH,
			totalW,
			fitsHeight,
			fitsWidth,
			isLargerThanOptimal: currentSize.w >= optimalW,
		})

		// Se o tamanho atual cabe e não é menor que o ótimo, mantém
		if (fitsHeight && fitsWidth && currentSize.w >= optimalW) {
			console.log('✅ Mantendo tamanho atual (não encolher)')
			console.groupEnd()
			return currentSize
		}
	}

	console.log('🎯 Retornando novo tamanho:', { w: optimalW, h: optimalH })
	console.groupEnd()
	return { w: optimalW, h: optimalH }
}
