import { useEffect } from 'react'
import type { Stream } from '@/types'
import { toUrlParams } from '@/lib/urlUtils'

export function useUrlSync(streams: Stream[], cols: number, muted: boolean) {
	useEffect(() => {
		const href = toUrlParams(streams, cols, muted)
		window.history.replaceState({}, '', href)
	}, [streams, cols, muted])
}
