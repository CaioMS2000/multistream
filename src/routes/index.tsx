import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { useState } from 'react'
import { UI_INSETS } from '@/config/ui-insets'
import { Layout } from '@/components/layout'
import { Slot } from '@/components/slot'
import { TopBar } from '@/components/top-bar'
import { SideBar } from '@/components/side-bar'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { useLoadStreams } from '@/hooks/use-load-streams'
import { useStreamManager } from '@/hooks/use-stream-manager'
import { parseStreams } from '@/utils/parse-stream'
import type { Stream } from '@/@types'

const searchSchema = z.object({
	cols: z.number().min(1).default(2),
	muted: z.boolean().default(true),
	streams: z.string().default(''),
})

export const Route = createFileRoute('/')({
	component: Index,
	validateSearch: searchSchema,
})

function Index() {
	const { cols: colsCount, streams: streamsRaw } = Route.useSearch()
	const streams = parseStreams(streamsRaw)
	const { swapSlots } = useStreamManager()
	const [isDragging, setIsDragging] = useState(false)

	const maxSlot =
		streams.length > 0 ? Math.max(...streams.map(s => s.slot)) : -1
	const minSlots = maxSlot + 1

	const { playerWidth, playerHeight, totalSlots } = useGridLayout(
		colsCount,
		minSlots,
		UI_INSETS
	)

	useLoadStreams()

	const streamsBySlot = new Map<number, Stream>()
	for (const stream of streams) {
		streamsBySlot.set(stream.slot, stream)
	}

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		})
	)

	function handleDragStart() {
		setIsDragging(true)
	}

	function handleDragEnd(event: DragEndEvent) {
		setIsDragging(false)
		const { active, over } = event
		if (!over || active.id === over.id) return
		const slotA = Number(active.id)
		const slotB = Number(over.id)
		swapSlots(slotA, slotB)
	}

	const slots = Array.from({ length: totalSlots }, (_, i) => {
		const stream = streamsBySlot.get(i) ?? null
		return (
			<Slot
				key={stream ? `${stream.platform}:${stream.channel}` : `empty-${i}`}
				slotIndex={i}
				stream={stream}
				width={playerWidth}
				height={playerHeight}
				isDragging={isDragging}
			/>
		)
	})

	return (
		<>
			<TopBar />
			<SideBar />
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<Layout cols={colsCount} playerWidth={playerWidth}>
					{slots}
				</Layout>
				<DragOverlay />
			</DndContext>
		</>
	)
}
