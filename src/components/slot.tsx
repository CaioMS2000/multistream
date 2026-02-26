import type { Stream } from '@/@types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { PlayerContainer } from './player-container'

type SlotProps = {
	slotIndex: number
	stream: Stream | null
	width: number
	height: number
	isDragging: boolean
}

export const Slot = function Slot({
	slotIndex,
	stream,
	width,
	height,
	isDragging,
}: SlotProps) {
	const hasContent = stream !== null

	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: slotIndex,
	})

	const {
		attributes,
		listeners,
		setNodeRef: setDragRef,
		isDragging: isThisDragging,
	} = useDraggable({
		id: slotIndex,
		disabled: !hasContent,
	})

	return (
		// biome-ignore lint/a11y/useSemanticElements: drag-and-drop container, not a semantic list
		<div
			ref={setDropRef}
			role="listitem"
			style={{ width, height }}
			className={`overflow-hidden border rounded-lg flex items-center justify-center transition-colors relative ${
				isOver ? 'border-primary border-2' : ''
			} ${isThisDragging ? 'opacity-50' : ''}`}
		>
			<div
				ref={setDragRef}
				{...listeners}
				{...attributes}
				className="w-full h-full"
			>
				{hasContent ? (
					<PlayerContainer stream={stream} />
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<span className="text-muted-foreground/60 text-xs">vazio</span>
					</div>
				)}
			</div>
			{isDragging && hasContent && <div className="absolute inset-0 z-10" />}
		</div>
	)
}
