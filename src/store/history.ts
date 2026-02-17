import type { Stream } from '@/@types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
						h =>
							h.platform === stream.platform && h.username === stream.username
					)
					return alreadyIn ? state : { history: [...state.history, stream] }
				}),

			removeFromHistory: stream =>
				set(state => ({
					history: state.history.filter(
						h =>
							!(
								h.platform === stream.platform && h.username === stream.username
							)
					),
				})),

			clearHistory: () => set({ history: [] }),
		}),
		{ name: 'history-store' }
	)
)
