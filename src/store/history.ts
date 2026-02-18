import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stream } from '@/@types'

interface HistoryStore {
	history: Stream[]
	addToHistory: (stream: Stream) => void
	removeFromHistory: (stream: Stream) => void
	clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>()(
	persist(
		set => ({
			history: [],

			addToHistory: stream =>
				set(state => {
					const alreadyIn = state.history.some(
						h => h.platform === stream.platform && h.channel === stream.channel
					)
					return alreadyIn ? state : { history: [...state.history, stream] }
				}),

			removeFromHistory: stream =>
				set(state => ({
					history: state.history.filter(
						h =>
							!(h.platform === stream.platform && h.channel === stream.channel)
					),
				})),

			clearHistory: () => set({ history: [] }),
		}),
		{ name: 'history-store' }
	)
)
