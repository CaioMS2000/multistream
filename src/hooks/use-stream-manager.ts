import type { Stream } from '@/@types'
import { useHistoryStore } from '@/store/history'
import { useStreamsStore } from '@/store/streams'

export function useStreamManager() {
	const addStream = useStreamsStore(s => s.addStream)
	const removeStream = useStreamsStore(s => s.removeStream)
	const updateStream = useStreamsStore(s => s.updateStream)
	const reloadStream = useStreamsStore(s => s.reloadStream)
	const swapSlots = useStreamsStore(s => s.swapSlots)
	const addToHistory = useHistoryStore(s => s.addToHistory)
	const removeFromHistory = useHistoryStore(s => s.removeFromHistory)

	return {
		activate: (stream: Stream) => {
			addStream(stream)
			removeFromHistory(stream)
		},
		deactivate: (streamIndex: number, stream: Stream) => {
			addToHistory(stream)
			removeStream(streamIndex)
		},
		change: (streamIndex: number, partial: Partial<Stream>) => {
			updateStream(streamIndex, partial)
			reloadStream(streamIndex)
		},
		reload: (streamIndex: number) => reloadStream(streamIndex),
		swap: (from: number, to: number) => swapSlots(from, to),
		dismissHistory: (stream: Stream) => removeFromHistory(stream),
	}
}
