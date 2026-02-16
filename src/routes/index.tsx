import { PlayerContainer } from '@/components/player-container'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

export const Route = createFileRoute('/')({
	component: Index,
})

function Index() {
	const colsCount = 2
	const { cols, totalSlots, playerWidth, playerHeight } =
		useGridLayout(colsCount)

	const [slots, setSlots] = useState<(string | null)[]>(() =>
		Array.from({ length: totalSlots }, () => crypto.randomUUID())
	)

	const handleSwap = useCallback((fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) return
		setSlots(prev => {
			const next = [...prev]
			const temp = next[fromIndex]
			next[fromIndex] = next[toIndex]
			next[toIndex] = temp
			return next
		})
	}, [])

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
			{slots.map((playerId, index) => (
				<PlayerContainer
					key={`slot-${index}`}
					playerId={playerId}
					slotIndex={index}
					width={playerWidth}
					height={playerHeight}
					onSwap={handleSwap}
				/>
			))}
		</div>
	)
}
