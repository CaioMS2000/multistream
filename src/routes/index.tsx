import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UI_INSETS } from '@/config/ui-insets'
import { Layout } from '@/components/layout'
import { Slot } from '@/components/slot'
import { TopBar } from '@/components/top-bar'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { useSyncStreamsUrl } from '@/hooks/use-sync-streams-url'
import { useStreamsStore } from '@/store/streams'
import { SideBar } from '@/components/side-bar'

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
	const { cols: colsCount } = Route.useSearch()
	const streams = useStreamsStore(state => state.streams)
	const order = useStreamsStore(state => state.order)
	const { totalSlots, playerWidth, playerHeight } = useGridLayout(
		colsCount,
		streams.length,
		UI_INSETS
	)

	useSyncStreamsUrl(totalSlots)

	return (
		<>
			<TopBar />
			<SideBar />
			<Layout cols={colsCount} playerWidth={playerWidth}>
				{order.map((streamIndex, slotIndex) => {
					const stream =
						streamIndex >= 0 ? (streams[streamIndex] ?? null) : null
					const key = stream
						? `${stream.platform}:${stream.channel}`
						: `empty-${slotIndex}`

					return (
						<Slot
							key={key}
							stream={stream}
							streamIndex={streamIndex}
							slotIndex={slotIndex}
							width={playerWidth}
							height={playerHeight}
						/>
					)
				})}
			</Layout>
		</>
	)
}
