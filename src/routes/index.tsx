import { Layout } from '@/components/layout'
import { PlayerContainer } from '@/components/player-container'
import { TopBar } from '@/components/top-bar'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { z } from 'zod'
import type { Stream } from '@/@types'
import { STREAM_OPTION } from '@/@types'

const searchSchema = z.object({
	cols: z.number().min(1).default(2),
	muted: z.boolean().default(true),
	streams: z.string().default(''),
})

export function parseStreams(raw: string): Stream[] {
	if (raw === '') return []
	return raw.split(',').map(s => {
		const [platform, username] = s.split(':')
		return { platform: platform as (typeof STREAM_OPTION)[number], username }
	})
}

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
					<PlayerContainer
						key={key}
						playerId={stream ? `${stream.platform}:${stream.username}` : null}
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
