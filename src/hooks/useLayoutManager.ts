import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { CustomLayout, Rectangle, TileSize, Stream } from '@/types'
import {
	calculateTilePositions,
	enforceAspectRatio,
	isValidPosition,
} from '@/lib/layoutUtils'
import { calculateOptimalTileSize } from '@/lib/tileSizing'
import {
	loadCustomLayout,
	saveCustomLayout,
	clearCustomLayout,
} from '@/hooks/useLocalStorage'

type UseLayoutManagerProps = {
	streams: Stream[]
	layoutOrder: string[]
	initialCols?: number
	containerRef: React.RefObject<HTMLDivElement | null>
	headerRef: React.RefObject<HTMLElement | null>
	headerOpen: boolean
	historyOpen: boolean
}

export function useLayoutManager({
	streams,
	layoutOrder,
	initialCols = 2,
	containerRef,
	headerRef,
	headerOpen,
	historyOpen,
}: UseLayoutManagerProps) {
	const [cols, setCols] = useState<number>(initialCols)
	const [tileSize, setTileSize] = useState<TileSize>({ w: 0, h: 0 })
	const [customLayout, setCustomLayout] = useState<CustomLayout>(
		() => loadCustomLayout(streams) ?? {}
	)
	const prevColsRef = useRef<number>(cols)

	// Entrar em modo custom automaticamente se houver streams
	const isCustomMode = streams.length > 0

	const allTilePositions = useMemo(() => {
		return calculateTilePositions(
			streams,
			layoutOrder,
			customLayout,
			tileSize,
			cols
		)
	}, [streams, layoutOrder, customLayout, tileSize, cols])

	const handleResizeStop = useCallback(
		(
			streamId: string,
			ref: HTMLElement,
			position: { x: number; y: number }
		) => {
			let newRect: Rectangle = {
				x: position.x,
				y: position.y,
				w: ref.offsetWidth,
				h: ref.offsetHeight,
			}

			// Garantir aspect ratio 16:9
			newRect = enforceAspectRatio(newRect)

			const containerBounds = {
				w: containerRef.current?.clientWidth ?? window.innerWidth,
				h: containerRef.current?.clientHeight ?? window.innerHeight,
			}

			if (
				isValidPosition(streamId, newRect, allTilePositions, containerBounds)
			) {
				setCustomLayout(prev => ({
					...prev,
					[streamId]: newRect,
				}))
			} else {
				console.warn('Invalid resize - would overlap or exceed bounds')
			}
		},
		[allTilePositions, containerRef]
	)

	const handleDragStop = useCallback(
		(streamId: string, data: { x: number; y: number }) => {
			const currentRect = allTilePositions.get(streamId)
			if (!currentRect) return

			const newRect: Rectangle = {
				x: data.x,
				y: data.y,
				w: currentRect.w,
				h: currentRect.h,
			}

			const containerBounds = {
				w: containerRef.current?.clientWidth ?? window.innerWidth,
				h: containerRef.current?.clientHeight ?? window.innerHeight,
			}

			if (
				isValidPosition(streamId, newRect, allTilePositions, containerBounds)
			) {
				setCustomLayout(prev => ({
					...prev,
					[streamId]: newRect,
				}))
			} else {
				console.warn('Invalid drag - would overlap or exceed bounds')
			}
		},
		[allTilePositions, containerRef]
	)

	const resetLayout = useCallback(() => {
		setCustomLayout({})
		clearCustomLayout(streams)
	}, [streams])

	// Compute tile size to fit viewport without scroll
	useEffect(() => {
		function recalc() {
			// Measure container paddings
			let cw = window.innerWidth
			let ch = window.innerHeight
			let padX = 0
			let padY = 0

			if (containerRef.current) {
				const el = containerRef.current
				const cs = getComputedStyle(el)
				const pl = Number.parseFloat(cs.paddingLeft) || 0
				const pr = Number.parseFloat(cs.paddingRight) || 0
				const pt = Number.parseFloat(cs.paddingTop) || 0
				const pb = Number.parseFloat(cs.paddingBottom) || 0
				padX = pl + pr
				padY = pt + pb
				cw = (el.clientWidth || window.innerWidth) - padX
				ch = (el.clientHeight || window.innerHeight) - padY
			}

			// Detecta mudança de colunas
			const colsChanged = prevColsRef.current !== cols
			if (colsChanged) {
				prevColsRef.current = cols
			}

			// Calcula novo tamanho usando função pura
			const newSize = calculateOptimalTileSize({
				containerWidth: cw,
				containerHeight: ch,
				numStreams: streams.length,
				cols: cols,
				headerHeight: 0,
				marginTop: 12,
				currentSize: colsChanged ? undefined : tileSize,
				preventShrinkOnRowAdd: true,
			})

			// Só atualiza se realmente mudou (previne re-renders)
			if (newSize.w !== tileSize.w || newSize.h !== tileSize.h) {
				setTileSize(newSize)
			}
		}

		recalc()

		const onResize = () => recalc()
		window.addEventListener('resize', onResize)

		const ro = new ResizeObserver(() => recalc())
		if (containerRef.current) ro.observe(containerRef.current)
		if (headerRef.current) ro.observe(headerRef.current)

		return () => {
			window.removeEventListener('resize', onResize)
			ro.disconnect()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		// tileSize é intencionalmente excluído: é o output, não um trigger
	}, [streams.length, cols, headerOpen, historyOpen, containerRef, headerRef])

	// Auto-save customLayout to localStorage
	useEffect(() => {
		if (Object.keys(customLayout).length > 0) {
			saveCustomLayout(streams, customLayout)
		}
	}, [customLayout, streams])

	return {
		cols,
		setCols,
		tileSize,
		customLayout,
		isCustomMode,
		allTilePositions,
		handleResizeStop,
		handleDragStop,
		resetLayout,
	}
}
