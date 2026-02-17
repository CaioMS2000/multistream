import { Layout } from '@/components/layout'
import { Slot } from '@/components/slot'
import { TopBar } from '@/components/top-bar'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { parseStreams } from '@/utils/parse-stream'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { z } from 'zod'

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
	const { totalSlots, playerWidth, playerHeight } = useGridLayout(colsCount)

	const [order, setOrder] = useState<number[]>(() =>
		Array.from({ length: totalSlots }, (_, i) => i)
	)

	const handleSwap = useCallback((fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return
		setOrder(prev => {
			const next = [...prev]
			const temp = next[fromIndex]
			next[fromIndex] = next[toIndex]
			next[toIndex] = temp
			return next
		})
	}, [])

	return (
		<Layout>
			<TopBar />
			{order.map((streamIndex, slotIndex) => {
				const stream = streams[streamIndex] ?? null
				const key = stream
					? `${stream.platform}:${stream.username}`
					: `empty-${slotIndex}`

				return (
					<Slot
						key={key}
						stream={stream}
						slotIndex={slotIndex}
						width={playerWidth}
						height={playerHeight}
						onSwap={handleSwap}
					/>
				)
			})}
		</Layout>
	)
}
