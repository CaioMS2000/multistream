import { getRouteApi } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useStreamsStore } from '@/store/streams'
import { parseStreams } from '@/utils/parse-stream'

export function useLoadStreams() {
	const routeApi = getRouteApi('/')
	const { streams: streamsRaw } = routeApi.useSearch()
	const setStreams = useStreamsStore(s => s.setStreams)

	useEffect(() => {
		const parsed = parseStreams(streamsRaw)
		setStreams(parsed)
	}, [streamsRaw, setStreams])
}
