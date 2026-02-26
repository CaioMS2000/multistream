import { getRouteApi } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useStreamsStore } from '@/store/streams'
import { parseStreams } from '@/utils/parse-stream'

export function useStreamManager() {
	const routeApi = getRouteApi('/')
	const navigate = routeApi.useNavigate()
	const { streams: streamsRaw } = routeApi.useSearch()
	const addStreamToStore = useStreamsStore(s => s.addStream)
	const removeStreamFromStore = useStreamsStore(s => s.removeStream)

	// function loadFromURL(){
	//     const parsed = parseStreams(streamsRaw)
	//     console.log('Parsed streams from URL:', parsed)
	//     const streamsToAdd = parsed.filter(s => !streams.some(existing => existing.platform === s.platform && existing.channel === s.channel))
	//     const streamsToRemove = streams.filter(s => !parsed.some(p => p.platform === s.platform && p.channel === s.channel))

	//     streamsToAdd.forEach(addStream)
	// biome-ignore lint/suspicious/useIterableCallbackReturn: i know whats going on here
	//     streamsToRemove.forEach(s => removeStream(s.platform, s.channel))
	// }

	useEffect(() => {
		const streams = useStreamsStore.getState().streams
		const parsed = parseStreams(streamsRaw)

		const streamsToAdd = parsed.filter(
			s =>
				!streams.some(
					existing =>
						existing.platform === s.platform && existing.channel === s.channel
				)
		)
		const streamsToRemove = streams.filter(
			s =>
				!parsed.some(p => p.platform === s.platform && p.channel === s.channel)
		)

		streamsToAdd.forEach(addStreamToStore)
		// biome-ignore lint/suspicious/useIterableCallbackReturn: i know whats going on here
		streamsToRemove.forEach(s => removeStreamFromStore(s.platform, s.channel))
	}, [streamsRaw, addStreamToStore, removeStreamFromStore])

	function addStream(platform: string, channel: string) {
		navigate({
			search: prev => ({
				...prev,
				streams: prev.streams
					? `${prev.streams},${platform}:${channel}`
					: `${platform}:${channel}`,
			}),
		})
	}

	function removeStream(platform: string, channel: string) {
		navigate({
			search: prev => ({
				...prev,
				streams: prev.streams
					.split(',')
					.filter(s => s !== `${platform}:${channel}`)
					.join(','),
			}),
		})
	}

	return {
		addStream,
		removeStream,
	}
}
