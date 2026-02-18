import type { Stream } from '@/@types'
import { useStreamsStore } from '@/store/streams'
import { memo, useState, type JSX } from 'react'
import { PlayerContainer } from './player-container'

type SlotProps = {
	stream: Stream | null
	streamIndex: number
	slotIndex: number
	width: number
	height: number
}

export const Slot = memo(function Slot({
	stream,
	streamIndex,
	slotIndex,
	width,
	height,
}: SlotProps) {
	const swapSlots = useStreamsStore(state => state.swapSlots)
	const [isDragOver, setIsDragOver] = useState(false)
	const hasContent = stream !== null
	let ChildComponent: JSX.Element = (
		<span className="text-muted-foreground/60 text-xs">vazio</span>
	)

	if (hasContent) {
		ChildComponent = (
			<PlayerContainer stream={stream} streamIndex={streamIndex} />
		)
	}

	return (
		// biome-ignore lint/a11y/useSemanticElements: drag-and-drop container, not a semantic list
		<div
			role="listitem"
			style={{ width, height }}
			className={`overflow-hidden border rounded-lg flex items-center justify-center transition-colors ${
				isDragOver
					? 'border-indigo-500 bg-indigo-500/10'
					: hasContent
						? 'border-border bg-black'
						: 'border-dashed border-border bg-black/50'
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
				swapSlots(fromIndex, slotIndex)
			}}
		>
			{ChildComponent}
		</div>
	)
})
