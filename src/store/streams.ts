import type { Stream } from '@/@types'
import { create } from 'zustand'

interface StreamsStore {
	streams: Stream[]
	order: number[]
	reloadKeys: number[]

	initFromUrl: (streams: Stream[], totalSlots: number) => void
	resizeOrder: (totalSlots: number) => void
	addStream: (stream: Stream) => void
	removeStream: (streamIndex: number) => void
	reloadStream: (streamIndex: number) => void
	swapSlots: (from: number, to: number) => void
}

export const useStreamsStore = create<StreamsStore>()(set => ({
	streams: [],
	order: [],
	reloadKeys: [],

	initFromUrl: (streams, totalSlots) =>
		set({
			streams,
			order: Array.from(
				{ length: Math.max(totalSlots, streams.length) },
				(_, i) => i
			),
			reloadKeys: Array.from({ length: streams.length }, () => 0),
		}),

	resizeOrder: totalSlots =>
		set(state => {
			if (state.order.length === totalSlots) return state
			if (totalSlots > state.order.length) {
				const extra = Array.from(
					{ length: totalSlots - state.order.length },
					(_, i) => state.order.length + i
				)
				return { order: [...state.order, ...extra] }
			}
			return { order: state.order.slice(0, totalSlots) }
		}),

	addStream: stream =>
		set(state => ({
			streams: [...state.streams, stream],
			reloadKeys: [...state.reloadKeys, 0],
		})),

	// Sentinel -1 marks an empty slot; indices above the removed one shift down
	removeStream: streamIndex =>
		set(state => {
			const newStreams = state.streams.filter((_, i) => i !== streamIndex)
			const newReloadKeys = state.reloadKeys.filter((_, i) => i !== streamIndex)
			const newOrder = state.order.map(idx => {
				if (idx === streamIndex) return -1
				if (idx > streamIndex) return idx - 1
				return idx
			})
			return {
				streams: newStreams,
				order: newOrder,
				reloadKeys: newReloadKeys,
			}
		}),

	reloadStream: streamIndex =>
		set(state => {
			const newReloadKeys = [...state.reloadKeys]
			newReloadKeys[streamIndex] = (newReloadKeys[streamIndex] ?? 0) + 1
			return { reloadKeys: newReloadKeys }
		}),

	swapSlots: (from, to) =>
		set(state => {
			if (from === to) return state
			const newOrder = [...state.order]
			;[newOrder[from], newOrder[to]] = [newOrder[to], newOrder[from]]
			return { order: newOrder }
		}),
}))
