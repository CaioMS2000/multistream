import type { Stream } from '@/@types'
import { create } from 'zustand'

interface StreamsStore {
	streams: Stream[]
	setStreams: (streams: Stream[]) => void
}

export const useStreamsStore = create<StreamsStore>()(set => ({
	streams: [],

	setStreams: streams => set({ streams }),
}))
