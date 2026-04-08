import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { Layout } from '@/components/layout'
import { PlayerContainer } from '@/components/player-container'
import { SideBar } from '@/components/side-bar'
import { Slot } from '@/components/slot'
import { TopBar } from '@/components/top-bar'
import { UI_INSETS } from '@/config/ui-insets'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { useLoadStreams } from '@/hooks/use-load-streams'
import { useGridStore } from '@/store/grid'
import { parseStreams } from '@/utils/parse-stream'

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
	const slotOrder = useGridStore(s => s.slotOrder)
	const swap = useGridStore(s => s.swap)
	const [isDragging, setIsDragging] = useState(false)

	const minSlots = streams.length

	const { playerWidth, playerHeight, totalSlots } = useGridLayout(
		colsCount,
		minSlots,
		UI_INSETS
	)

	useLoadStreams()

	// Build a map from playerId to stream for quick lookup
	const streamById = new Map<string, (typeof streams)[number]>()
	for (const stream of streams) {
		streamById.set(`${stream.platform}:${stream.channel}`, stream)
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
		swap(Number(active.id), Number(over.id))
	}

	// Pad slotOrder to totalSlots for empty drop targets
	const paddedOrder = Array.from(
		{ length: totalSlots },
		(_, i) => slotOrder[i] ?? null
	)

	return (
		<>
			<TopBar />
			<SideBar />
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<Layout
					cols={colsCount}
					playerWidth={playerWidth}
					playerHeight={playerHeight}
				>
					{/* Players — keyed by identity, positioned via CSS grid */}
					{streams.map(stream => {
						const playerId = `${stream.platform}:${stream.channel}`
						const slotIndex = paddedOrder.indexOf(playerId)
						if (slotIndex === -1) return null
						const col = (slotIndex % colsCount) + 1
						const row = Math.floor(slotIndex / colsCount) + 1

						return (
							<Slot
								key={playerId}
								slotIndex={slotIndex}
								hasContent
								width={playerWidth}
								height={playerHeight}
								isDragging={isDragging}
								col={col}
								row={row}
							>
								<PlayerContainer stream={stream} />
							</Slot>
						)
					})}

					{/* Empty slots — drop targets only */}
					{paddedOrder.map((id, i) => {
						if (id !== null) return null
						const col = (i % colsCount) + 1
						const row = Math.floor(i / colsCount) + 1
						return (
							<Slot
								key={`empty-${i}`}
								slotIndex={i}
								hasContent={false}
								width={playerWidth}
								height={playerHeight}
								isDragging={isDragging}
								col={col}
								row={row}
							>
								<div className="w-full h-full flex items-center justify-center">
									<span className="text-muted-foreground/60 text-xs">
										vazio
									</span>
								</div>
							</Slot>
						)
					})}
				</Layout>
				<DragOverlay />
			</DndContext>
		</>
	)
}
