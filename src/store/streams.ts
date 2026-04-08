import { create } from 'zustand'
import type { Stream } from '@/@types'

interface StreamsStore {
	streams: Stream[]
	setStreams: (streams: Stream[]) => void
}

export const useStreamsStore = create<StreamsStore>()(set => ({
	streams: [],

	setStreams: streams => set({ streams }),
}))
