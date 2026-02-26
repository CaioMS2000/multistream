import type { Stream } from '@/@types'
import { useHistoryStore } from '@/store/history'
import { parseStreams } from '@/utils/parse-stream'
import { getRouteApi } from '@tanstack/react-router'

function serializeStreams(streams: Stream[]): string {
	return streams.map(s => `${s.platform}:${s.channel}@${s.slot}`).join(',')
}

export function useStreamManager() {
	const routeApi = getRouteApi('/')
	const navigate = routeApi.useNavigate()
	const addToHistory = useHistoryStore(s => s.addToHistory)
	const removeFromHistory = useHistoryStore(s => s.removeFromHistory)

	function getParsedStreams(raw: string): Stream[] {
		return parseStreams(raw)
	}

	function addStream(platform: string, channel: string, slot?: number) {
		navigate({
			search: prev => {
				const streams = getParsedStreams(prev.streams)
				const occupiedSlots = new Set(streams.map(s => s.slot))
				const targetSlot = slot ?? findFirstEmptySlot(occupiedSlots)
				return {
					...prev,
					streams: serializeStreams([
						...streams,
						{ platform, channel, slot: targetSlot } as Stream,
					]),
				}
			},
		})
	}

	function removeStream(platform: string, channel: string) {
		navigate({
			search: prev => {
				const streams = getParsedStreams(prev.streams)
				return {
					...prev,
					streams: serializeStreams(
						streams.filter(
							s => !(s.platform === platform && s.channel === channel)
						)
					),
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
								? ({
										platform: newPlatform,
										channel: newChannel,
										slot: s.slot,
									} as Stream)
								: s
						)
					),
				}
			},
		})
	}

	function swapSlots(slotA: number, slotB: number) {
		navigate({
			search: prev => {
				const streams = getParsedStreams(prev.streams)
				return {
					...prev,
					streams: serializeStreams(
						streams.map(s => {
							if (s.slot === slotA) return { ...s, slot: slotB }
							if (s.slot === slotB) return { ...s, slot: slotA }
							return s
						})
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
		swapSlots,
		activateFromHistory,
		deactivateToHistory,
	}
}

function findFirstEmptySlot(occupied: Set<number>): number {
	let slot = 0
	while (occupied.has(slot)) slot++
	return slot
}
