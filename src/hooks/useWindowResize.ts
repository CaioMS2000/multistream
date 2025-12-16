import { useEffect } from 'react'

type UseWindowResizeOptions = {
	containerRef?: React.RefObject<HTMLElement | null>
	additionalRefs?: React.RefObject<HTMLElement | null>[]
	onResize: () => void
	dependencies?: unknown[]
}

/**
 * Hook que observa mudanças de tamanho da janela e de elementos específicos
 * usando ResizeObserver e window resize events
 */
export function useWindowResize({
	containerRef,
	additionalRefs = [],
	onResize,
	dependencies = [],
}: UseWindowResizeOptions) {
	useEffect(() => {
		// Chama onResize imediatamente na montagem/atualização
		onResize()

		// Listener para resize da janela
		const handleWindowResize = () => onResize()
		window.addEventListener('resize', handleWindowResize)

		// ResizeObserver para elementos específicos
		const ro = new ResizeObserver(() => onResize())

		if (containerRef?.current) {
			ro.observe(containerRef.current)
		}

		for (const ref of additionalRefs) {
			if (ref?.current) {
				ro.observe(ref.current)
			}
		}

		return () => {
			window.removeEventListener('resize', handleWindowResize)
			ro.disconnect()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependencies)
}
