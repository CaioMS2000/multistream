import type { Stream } from '@/@types'
import { useHistoryStore } from '@/store/history'
import { getRouteApi } from '@tanstack/react-router'

export function useStreamManager() {
	const routeApi = getRouteApi('/')
	const navigate = routeApi.useNavigate()
	const addToHistory = useHistoryStore(s => s.addToHistory)
	const removeFromHistory = useHistoryStore(s => s.removeFromHistory)

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

	type ReplaceStreamParams = {
		oldPlatform: string
		oldChannel: string
		newPlatform: string
		newChannel: string
	}
	function replaceStream({
		oldPlatform,
		oldChannel,
		newPlatform,
		newChannel,
	}: ReplaceStreamParams) {
		navigate({
			search: prev => ({
				...prev,
				streams: prev.streams
					.split(',')
					.map(s =>
						s === `${oldPlatform}:${oldChannel}`
							? `${newPlatform}:${newChannel}`
							: s
					)
					.join(','),
			}),
		})
	}

	function activateFromHistory(stream: Stream) {
		removeFromHistory(stream)
		addStream(stream.platform, stream.channel)
	}

	function deactivateToHistory(stream: Stream) {
		addToHistory(stream)
		removeStream(stream.platform, stream.channel)
	}

	return {
		addStream,
		removeStream,
		replaceStream,
		activateFromHistory,
		deactivateToHistory,
	}
}
