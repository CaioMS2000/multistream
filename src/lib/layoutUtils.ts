import type { Rectangle, CustomLayout } from '@/types'

export type { Rectangle, TileCustomization, CustomLayout } from '@/types'

/**
 * Detecta se dois retângulos se sobrepõem
 */
export function rectanglesOverlap(a: Rectangle, b: Rectangle): boolean {
	return !(
		(
			a.x + a.w <= b.x || // a está à esquerda de b
			a.x >= b.x + b.w || // a está à direita de b
			a.y + a.h <= b.y || // a está acima de b
			a.y >= b.y + b.h
		) // a está abaixo de b
	)
}

/**
 * Valida se uma nova posição/tamanho é válida (sem colisão e dentro dos bounds)
 */
export function isValidPosition(
	targetId: string,
	newRect: Rectangle,
	allTiles: Map<string, Rectangle>,
	containerBounds: { w: number; h: number }
): boolean {
	// Verifica se está dentro do container
	if (
		newRect.x < 0 ||
		newRect.y < 0 ||
		newRect.x + newRect.w > containerBounds.w ||
		newRect.y + newRect.h > containerBounds.h
	) {
		return false
	}

	// Verifica colisão com outros tiles
	for (const [id, rect] of allTiles.entries()) {
		if (id === targetId) continue
		if (rectanglesOverlap(newRect, rect)) {
			return false
		}
	}

	return true
}

/**
 * Calcula as posições de todos os tiles (modo padrão ou customizado)
 */
export function calculateTilePositions(
	streams: Array<{ id: string }>,
	layoutOrder: string[],
	customLayout: CustomLayout,
	defaultTileSize: { w: number; h: number },
	cols: number
): Map<string, Rectangle> {
	const positions = new Map<string, Rectangle>()
	const GAP = 8

	streams.forEach((stream, idx) => {
		const custom = customLayout[stream.id]

		if (custom) {
			// Usar posição customizada
			positions.set(stream.id, custom)
		} else {
			// Calcular posição no grid padrão
			const orderIdx = layoutOrder.indexOf(stream.id)
			const effectiveIdx = orderIdx >= 0 ? orderIdx : idx
			const row = Math.floor(effectiveIdx / cols)
			const col = effectiveIdx % cols

			positions.set(stream.id, {
				x: col * (defaultTileSize.w + GAP),
				y: row * (defaultTileSize.h + GAP),
				w: defaultTileSize.w,
				h: defaultTileSize.h,
			})
		}
	})

	return positions
}

/**
 * Corrige aspect ratio para garantir 16:9 exato
 */
export function enforceAspectRatio(
	rect: Rectangle,
	aspectRatio: number = 16 / 9
): Rectangle {
	const expectedH = Math.round(rect.w / aspectRatio)

	// Se a diferença for maior que 2px, corrigir
	if (Math.abs(rect.h - expectedH) > 2) {
		return { ...rect, h: expectedH }
	}

	return rect
}
