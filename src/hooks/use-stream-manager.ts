import { getRouteApi } from '@tanstack/react-router'
import type { Stream } from '@/@types'
import { useHistoryStore } from '@/store/history'
import { parseStreams } from '@/utils/parse-stream'

function serializeStreams(streams: Stream[]): string {
	return streams.map(s => `${s.platform}:${s.channel}`).join(',')
}

export function useStreamManager() {
	const routeApi = getRouteApi('/')
	const navigate = routeApi.useNavigate()
	const addToHistory = useHistoryStore(s => s.addToHistory)
	const removeFromHistory = useHistoryStore(s => s.removeFromHistory)

	function getParsedStreams(raw: string): Stream[] {
		return parseStreams(raw)
	}

	function addStream(platform: string, channel: string) {
		navigate({
			search: prev => {
				const streams = getParsedStreams(prev.streams)
				return {
					...prev,
					streams: serializeStreams([
						...streams,
						{ platform, channel } as Stream,
					]),
				}
			},
		})
	}

	function removeStream(platform: string, channel: string) {
		navigate({
			search: prev => {
				const streams = getParsedStreams(prev.streams)
				const filtered = streams.filter(
					s => !(s.platform === platform && s.channel === channel)
				)
				return {
					...prev,
					streams: serializeStreams(filtered),
				}
			},
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
			search: prev => {
				const streams = getParsedStreams(prev.streams)
				return {
					...prev,
					streams: serializeStreams(
						streams.map(s =>
							s.platform === oldPlatform && s.channel === oldChannel
								? ({ platform: newPlatform, channel: newChannel } as Stream)
								: s
						)
					),
				}
			},
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
