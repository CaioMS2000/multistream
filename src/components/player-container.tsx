import { memo, useState } from 'react'

type PlayerContainerProps = {
	playerId: string | null
	slotIndex: number
	width: number
	height: number
	onSwap: (fromIndex: number, toIndex: number) => void
}

export const PlayerContainer = memo(function PlayerContainer({
	playerId,
	slotIndex,
	width,
	height,
	onSwap,
}: PlayerContainerProps) {
	const [isDragOver, setIsDragOver] = useState(false)
	const hasPlayer = playerId !== null

	return (
		// biome-ignore lint/a11y/useSemanticElements: drag-and-drop container, not a semantic list
		<div
			role="listitem"
			style={{ width, height }}
			className={`border rounded-lg flex items-center justify-center transition-colors ${
				isDragOver
					? 'border-blue-500 bg-blue-500/10'
					: hasPlayer
						? 'border-gray-500 bg-black'
						: 'border-dashed border-gray-700 bg-black/50'
			}`}
			draggable={hasPlayer}
			onDragStart={e => {
				e.dataTransfer.setData('text/plain', String(slotIndex))
				e.dataTransfer.effectAllowed = 'move'
			}}
			onDragOver={e => {
				e.preventDefault()
				e.dataTransfer.dropEffect = 'move'
				setIsDragOver(true)
			}}
			onDragLeave={() => setIsDragOver(false)}
			onDrop={e => {
				e.preventDefault()
				setIsDragOver(false)
				const fromIndex = Number(e.dataTransfer.getData('text/plain'))
				onSwap(fromIndex, slotIndex)
			}}
		>
			{hasPlayer ? (
				<span className="text-gray-500 text-sm cursor-grab active:cursor-grabbing">
					{playerId.slice(0, 8)}
				</span>
			) : (
				<span className="text-gray-700 text-xs">vazio</span>
			)}
		</div>
	)
})
