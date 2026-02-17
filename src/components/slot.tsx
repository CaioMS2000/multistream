import type { Stream } from '@/@types'
import { memo, useState } from 'react'
import { PlayerContainer } from './player-container'

type SlotProps = {
	stream: Stream | null
	slotIndex: number
	width: number
	height: number
	onSwap: (fromIndex: number, toIndex: number) => void
}

export const Slot = memo(function Slot({
	stream,
	slotIndex,
	width,
	height,
	onSwap,
}: SlotProps) {
	const [isDragOver, setIsDragOver] = useState(false)
	const hasContent = stream !== null

	return (
		// biome-ignore lint/a11y/useSemanticElements: drag-and-drop container, not a semantic list
		<div
			role="listitem"
			style={{ width, height }}
			className={`border rounded-lg flex items-center justify-center transition-colors ${
				isDragOver
					? 'border-blue-500 bg-blue-500/10'
					: hasContent
						? 'border-gray-500 bg-black'
						: 'border-dashed border-gray-700 bg-black/50'
			}`}
			draggable={hasContent}
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
			{stream ? (
				<PlayerContainer stream={stream} />
			) : (
				<span className="text-gray-700 text-xs">vazio</span>
			)}
		</div>
	)
})
