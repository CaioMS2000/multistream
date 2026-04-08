import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GridStore {
	slotOrder: (string | null)[]
	swap: (indexA: number, indexB: number) => void
	setOrder: (order: (string | null)[]) => void
}

export const useGridStore = create<GridStore>()(
	persist(
		set => ({
			slotOrder: [],

			swap: (indexA, indexB) =>
				set(state => {
					const next = [...state.slotOrder]
					;[next[indexA], next[indexB]] = [next[indexB], next[indexA]]
					return { slotOrder: next }
				}),

			setOrder: order => set({ slotOrder: order }),
		}),
		{ name: 'grid-slot-order' }
	)
)
