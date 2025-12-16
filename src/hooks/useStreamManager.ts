import { useState, useMemo, useCallback } from 'react'
import type { Stream, Platform } from '@/types'

export function useStreamManager(initialStreams: Stream[] = []) {
	const [streams, setStreams] = useState<Stream[]>(initialStreams)
	const [layoutOrder, setLayoutOrder] = useState<string[]>(() =>
		initialStreams.map(s => s.id)
	)
	const [reloadById, setReloadById] = useState<Record<string, number>>({})

	const orderedStreams = useMemo(() => {
		if (streams.length === 0) return []
		const byId = new Map<string, Stream>()
		streams.forEach(s => byId.set(s.id, s))
		const seen = new Set<string>()
		const ordered: Stream[] = []
		layoutOrder.forEach(id => {
			const item = byId.get(id)
			if (item) {
				ordered.push(item)
				seen.add(id)
			}
		})
		if (seen.size !== streams.length) {
			streams.forEach(s => {
				if (!seen.has(s.id)) ordered.push(s)
			})
		}
		return ordered
	}, [layoutOrder, streams])

	const layoutIndexMap = useMemo(() => {
		const map = new Map<string, number>()
		layoutOrder.forEach((id, idx) => {
			map.set(id, idx)
		})
		return map
	}, [layoutOrder])

	const addStream = useCallback((platform: Platform, channel: string) => {
		const stream: Stream = {
			id: `${platform}:${channel}:${Date.now()}`,
			platform,
			channel,
		}
		setStreams(prev => [...prev, stream])
		setLayoutOrder(prev => [...prev, stream.id])
		return stream
	}, [])

	const removeStream = useCallback(
		(id: string) => {
			const stream = streams.find(s => s.id === id)
			setStreams(prev => prev.filter(s => s.id !== id))
			setLayoutOrder(prev => prev.filter(existingId => existingId !== id))
			return stream
		},
		[streams]
	)

	const renameStream = useCallback((id: string, newChannel: string) => {
		let changed = false
		setStreams(prev =>
			prev.map(stream => {
				if (stream.id !== id) return stream
				if (stream.channel === newChannel) return stream
				changed = true
				return { ...stream, channel: newChannel }
			})
		)
		if (changed) {
			setReloadById(prev => ({
				...prev,
				[id]: (prev[id] || 0) + 1,
			}))
		}
		return changed
	}, [])

	const reloadStream = useCallback((id: string) => {
		setReloadById(prev => ({
			...prev,
			[id]: (prev[id] || 0) + 1,
		}))
	}, [])

	const reorderStreams = useCallback((fromId: string, toId: string) => {
		setLayoutOrder(prev => {
			const from = prev.indexOf(fromId)
			const to = prev.indexOf(toId)
			if (from < 0 || to < 0) return prev
			const next = [...prev]
			const [moved] = next.splice(from, 1)
			next.splice(to, 0, moved)
			return next
		})
	}, [])

	const resetStreams = useCallback((newStreams: Stream[]) => {
		setStreams(newStreams)
		setLayoutOrder(newStreams.map(s => s.id))
		setReloadById({})
	}, [])

	return {
		streams,
		orderedStreams,
		layoutOrder,
		layoutIndexMap,
		reloadById,
		addStream,
		removeStream,
		renameStream,
		reloadStream,
		reorderStreams,
		resetStreams,
	}
}
