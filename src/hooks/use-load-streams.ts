import { getRouteApi } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useGridStore } from '@/store/grid'
import { useStreamsStore } from '@/store/streams'
import { parseStreams } from '@/utils/parse-stream'

export function useLoadStreams() {
	const routeApi = getRouteApi('/')
	const { streams: streamsRaw } = routeApi.useSearch()
	const setStreams = useStreamsStore(s => s.setStreams)
	const setOrder = useGridStore(s => s.setOrder)

	useEffect(() => {
		const parsed = parseStreams(streamsRaw)
		setStreams(parsed)

		const activeIds = new Set(parsed.map(s => `${s.platform}:${s.channel}`))

		// Read current slotOrder imperatively to avoid dependency loop
		const currentOrder = useGridStore.getState().slotOrder

		// Start from current slotOrder, remove streams that are no longer active
		const next = currentOrder.map(id =>
			id !== null && activeIds.has(id) ? id : null
		)

		// Find new streams not yet in slotOrder
		const existingIds = new Set(next.filter((id): id is string => id !== null))
		const newIds = [...activeIds].filter(id => !existingIds.has(id))

		// Place new streams in the first available null slots, or append
		for (const id of newIds) {
			const emptyIndex = next.indexOf(null)
			if (emptyIndex !== -1) {
				next[emptyIndex] = id
			} else {
				next.push(id)
			}
		}

		// Compact: remove all null gaps so the grid has no empty slots
		const compacted = next.filter((id): id is string => id !== null)

		setOrder(compacted)
	}, [streamsRaw, setStreams, setOrder])
}
