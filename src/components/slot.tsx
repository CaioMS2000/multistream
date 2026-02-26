import type { Stream } from '@/@types'
import { type JSX } from 'react'
import { PlayerContainer } from './player-container'

type SlotProps = {
	stream: Stream | null
	width: number
	height: number
}

export const Slot = function Slot({ stream, width, height }: SlotProps) {
	const hasContent = stream !== null
	let ChildComponent: JSX.Element = (
		<span className="text-muted-foreground/60 text-xs">vazio</span>
	)

	if (hasContent) {
		ChildComponent = <PlayerContainer stream={stream} />
	} else {
		ChildComponent = (
			<div className="w-full h-full flex items-center justify-center">
				<span className="text-muted-foreground/60 text-xs">vazio</span>
			</div>
		)
	}

	return (
		// biome-ignore lint/a11y/useSemanticElements: drag-and-drop container, not a semantic list
		<div
			role="listitem"
			style={{ width, height }}
			className={`overflow-hidden border rounded-lg flex items-center justify-center transition-colors`}
		>
			{ChildComponent}
		</div>
	)
}
