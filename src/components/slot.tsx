import { useDraggable, useDroppable } from '@dnd-kit/core'
import type React from 'react'

type SlotProps = {
	slotIndex: number
	hasContent: boolean
	width: number
	height: number
	isDragging: boolean
	col: number
	row: number
	children: React.ReactNode
}

export function Slot({
	slotIndex,
	hasContent,
	width,
	height,
	isDragging,
	col,
	row,
	children,
}: SlotProps) {
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
			style={{ width, height, gridColumn: col, gridRow: row }}
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
				{children}
			</div>
			{isDragging && hasContent && <div className="absolute inset-0 z-10" />}
		</div>
	)
}
