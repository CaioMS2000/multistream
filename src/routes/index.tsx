import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UI_INSETS } from '@/config/ui-insets'
import { Layout } from '@/components/layout'
import { Slot } from '@/components/slot'
import { TopBar } from '@/components/top-bar'
import { SideBar } from '@/components/side-bar'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { useStreamsStore } from '@/store/streams'
import { useLoadStreams } from '@/hooks/use-load-streams'

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
	const { playerWidth, playerHeight, rows } = useGridLayout(
		colsCount,
		streams.length,
		UI_INSETS
	)
	const emptySlots = rows * colsCount - streams.length

	useLoadStreams()

	return (
		<>
			<TopBar />
			<SideBar />
			<Layout cols={colsCount} playerWidth={playerWidth}>
				{streams.map(stream => (
					<Slot
						key={`${stream.platform}:${stream.channel}`}
						stream={stream}
						width={playerWidth}
						height={playerHeight}
					/>
				))}
				{Array.from({ length: emptySlots }, (_, i) => (
					<Slot
						key={`empty-${i}`}
						stream={null}
						width={playerWidth}
						height={playerHeight}
					/>
				))}
			</Layout>
		</>
	)
}
