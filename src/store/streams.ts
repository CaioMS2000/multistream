import type { Stream, STREAM_OPTION } from '@/@types'
import { create } from 'zustand'

interface StreamsStore {
	streams: Stream[]

	addStream: (stream: Stream) => void
	removeStream: (platform: STREAM_OPTION, channel: string) => void
	updateStream: (index: number, partial: Partial<Stream>) => void
}

export const useStreamsStore = create<StreamsStore>()(set => ({
	streams: [],
	order: [],
	reloadKeys: [],

	addStream: stream =>
		set(state => {
			return {
				streams: [...state.streams, stream],
			}
		}),

	// Sentinel -1 marks an empty slot; indices above the removed one shift down
	updateStream: (index, partial) =>
		set(state => {
			const newStreams = [...state.streams]
			newStreams[index] = { ...newStreams[index], ...partial }
			return { streams: newStreams }
		}),

	removeStream: (platform, channel) =>
		set(state => {
			const newStreams = state.streams.filter(
				s => !(s.platform === platform && s.channel === channel)
			)

			return {
				streams: newStreams,
			}
		}),
}))
