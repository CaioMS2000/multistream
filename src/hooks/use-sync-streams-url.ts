import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useStreamsStore } from '@/store/streams'
import { parseStreams } from '@/utils/parse-stream'

const routeApi = getRouteApi('/')

export function useSyncStreamsUrl(totalSlots: number) {
	const { streams: streamsRaw, cols, muted } = routeApi.useSearch()
	const navigate = useNavigate()
	const streams = useStreamsStore(state => state.streams)
	const initFromUrl = useStreamsStore(state => state.initFromUrl)
	const resizeOrder = useStreamsStore(state => state.resizeOrder)
	const initialized = useRef(false)

	// URL → Store (mount only)
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
	useEffect(() => {
		if (initialized.current) return
		initialized.current = true
		initFromUrl(parseStreams(streamsRaw), totalSlots)
	}, [])

	// Resize order when grid columns change
	useEffect(() => {
		if (!initialized.current) return
		resizeOrder(totalSlots)
	}, [totalSlots, resizeOrder])

	// Store → URL (when streams list changes)
	// biome-ignore lint/correctness/useExhaustiveDependencies: only streams should trigger URL sync
	useEffect(() => {
		// Avoid clearing URL before init completes
		if (streams.length === 0 && streamsRaw) return
		const streamsParam = streams
			.map(s => `${s.platform}:${s.channel}`)
			.join(',')
		if (streamsParam === streamsRaw) return
		navigate({ to: '/', search: { cols, muted, streams: streamsParam } })
	}, [streams])
}
