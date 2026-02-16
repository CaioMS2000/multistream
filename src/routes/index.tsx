import { PlayerContainer } from '@/components/player-container'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
	component: Index,
})

function Index() {
	const colsCount = 2
	const { cols, totalSlots, playerWidth, playerHeight } =
		useGridLayout(colsCount)

	const [slots] = useState(() =>
		Array.from({ length: totalSlots }, () => crypto.randomUUID())
	)

	return (
		<div
			className="h-screen w-screen"
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${cols}, ${playerWidth}px)`,
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			{slots.map(id => (
				<PlayerContainer
					key={id}
					id={id}
					width={playerWidth}
					height={playerHeight}
				/>
			))}
		</div>
	)
}
