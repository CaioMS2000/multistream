import { Rnd, type DraggableData } from 'react-rnd'
import TwitchPlayer from './TwitchPlayer'
import KickPlayer from './KickPlayer'
import { Card } from '@/components/ui/card'
import { RotateCw } from 'lucide-react'
import { TooltipButton } from '@/components/TooltipButton'
import { EditableChannelLabel } from './EditableChannelLabel'
import { Z_INDEX, STREAM_CARD_POS } from '@/lib/uiConstants'
import { cn } from '@/lib/utils'
import type { Stream, Rectangle } from '@/types'

type StreamCardProps = {
	stream: Stream
	position?: Rectangle
	tileSize?: { w: number; h: number }
	muted: boolean
	reloadKey: number
	parentHost: string
	isCustomMode: boolean
	// Grid mode props
	order?: number
	dragId?: string | null
	dragOverId?: string | null
	onDragStart?: () => void
	onDragEnter?: () => void
	onDragLeave?: () => void
	onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void
	onDrop?: () => void
	// Custom mode props
	onResizeStop?: (ref: HTMLElement, pos: { x: number; y: number }) => void
	onDragStop?: (data: DraggableData) => void
	// Common actions
	onReload: () => void
	onRemove: () => void
	onRename: (newChannel: string) => boolean
}

export function StreamCard({
	stream,
	position,
	tileSize,
	muted,
	reloadKey,
	parentHost,
	isCustomMode,
	order,
	dragId,
	dragOverId,
	onDragStart,
	onDragEnter,
	onDragLeave,
	onDragOver,
	onDrop,
	onResizeStop,
	onDragStop,
	onReload,
	onRemove,
	onRename,
}: StreamCardProps) {
	const cardContent = (
		<>
			<div
				className={cn(
					'absolute flex items-center gap-1 text-xs px-2 py-0 pr-0 rounded-md bg-black/60 text-white pointer-events-auto opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100',
					STREAM_CARD_POS.LABEL.top,
					STREAM_CARD_POS.LABEL.left,
					`z-${Z_INDEX.STREAM_CARD}`
				)}
			>
				<span className="ml-1 uppercase tracking-wide">{stream.platform}</span>
				<EditableChannelLabel channel={stream.channel} onCommit={onRename} />
			</div>

			<TooltipButton
				onClick={onReload}
				variant="outline"
				size="icon"
				className={cn(
					'absolute opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100',
					STREAM_CARD_POS.RELOAD.top,
					STREAM_CARD_POS.RELOAD.right,
					`z-${Z_INDEX.STREAM_CARD}`
				)}
				aria-label="Recarregar stream"
				tooltip="Recarregar stream"
			>
				<RotateCw className="size-4" />
			</TooltipButton>

			<TooltipButton
				onClick={onRemove}
				variant="destructive"
				size="icon"
				className={cn(
					'absolute opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100',
					STREAM_CARD_POS.REMOVE.top,
					STREAM_CARD_POS.REMOVE.right,
					`z-${Z_INDEX.STREAM_CARD}`
				)}
				tooltip="Remover stream"
			>
				×
			</TooltipButton>

			<div
				className="w-full h-full"
				style={
					!isCustomMode && tileSize
						? { width: `${tileSize.w}px`, height: `${tileSize.h}px` }
						: undefined
				}
			>
				{stream.platform === 'twitch' ? (
					<TwitchPlayer
						key={`${stream.id}:${reloadKey}`}
						id={stream.id}
						channel={stream.channel}
						parent={parentHost}
						muted={muted}
					/>
				) : (
					<KickPlayer
						key={`${stream.id}:${reloadKey}`}
						channel={stream.channel}
						muted={muted}
					/>
				)}
			</div>
		</>
	)

	if (isCustomMode && position) {
		// Modo customizado: usar Rnd
		return (
			<Rnd
				key={stream.id}
				size={{ width: position.w, height: position.h }}
				position={{ x: position.x, y: position.y }}
				lockAspectRatio={16 / 9}
				bounds="parent"
				onResizeStop={(_e, _dir, ref, _delta, pos) =>
					onResizeStop?.(ref as HTMLElement, pos)
				}
				onDragStop={(_e, data) => onDragStop?.(data)}
				enableResizing={{
					top: false,
					right: true,
					bottom: true,
					left: false,
					topRight: true,
					bottomRight: true,
					bottomLeft: false,
					topLeft: false,
				}}
			>
				<Card className="relative overflow-hidden bg-black p-0 border-0 box-border group h-full w-full">
					{cardContent}
				</Card>
			</Rnd>
		)
	}

	// Modo grid padrão
	return (
		<Card
			key={stream.id}
			style={{ order }}
			draggable={!isCustomMode}
			onDragStart={!isCustomMode ? onDragStart : undefined}
			onDragEnter={!isCustomMode ? onDragEnter : undefined}
			onDragLeave={!isCustomMode ? onDragLeave : undefined}
			onDragOver={!isCustomMode ? onDragOver : undefined}
			onDrop={!isCustomMode ? onDrop : undefined}
			className={[
				'relative overflow-hidden cursor-move bg-black p-0 border-0 box-border group',
				dragOverId === stream.id ? 'outline outline-2 outline-indigo-500' : '',
				dragId === stream.id ? 'opacity-80' : '',
			].join(' ')}
		>
			{cardContent}
		</Card>
	)
}
