import { useEffect, useMemo, useRef, useState } from 'react'
import { StreamCard } from './components/StreamCard'
import { Header } from './components/Header'
import { HistorySidebar } from './components/HistorySidebar'
import { useStreamHistory } from './hooks/useStreamHistory'
import { useStreamManager } from './hooks/useStreamManager'
import { useLayoutManager } from './hooks/useLayoutManager'
import { useUrlSync } from './hooks/useUrlSync'
import { parseInitialLayout, normalizeChannel } from '@/lib/urlUtils'
import { cn } from '@/lib/utils'
import type { Platform } from '@/types'

function App() {
	const initial = useMemo(() => parseInitialLayout(), [])
	const containerRef = useRef<HTMLDivElement | null>(null)
	const headerRef = useRef<HTMLElement | null>(null)
	const prevCountRef = useRef<number>(initial.streams.length)

	// UI state
	const [platform, setPlatform] = useState<Platform>('twitch')
	const [channel, setChannel] = useState('')
	const [muted, setMuted] = useState<boolean>(initial.muted)
	const [headerOpen, setHeaderOpen] = useState<boolean>(
		initial.streams.length === 0
	)
	const [historyOpen, setHistoryOpen] = useState<boolean>(false)
	const [dragId, setDragId] = useState<string | null>(null)
	const [dragOverId, setDragOverId] = useState<string | null>(null)

	// History management
	const { history, addToHistory, removeFromHistory } = useStreamHistory()

	// Stream management
	const streamManager = useStreamManager(initial.streams)

	// Layout management
	const layoutManager = useLayoutManager({
		streams: streamManager.streams,
		layoutOrder: streamManager.layoutOrder,
		initialCols: initial.cols,
		containerRef,
		headerRef,
	})

	// Sync URL with state
	useUrlSync(streamManager.orderedStreams, layoutManager.cols, muted)

	const parentHost = window.location.hostname

	// Handlers
	const handleAddStream = () => {
		const ch = normalizeChannel(channel)
		if (!ch) return
		streamManager.addStream(platform, ch)
		setChannel('')
	}

	const handleRemoveStream = (id: string) => {
		const stream = streamManager.removeStream(id)
		if (stream) {
			addToHistory(stream.platform, stream.channel)
		}
	}

	const handleRestoreFromHistory = (
		platform: Platform,
		channel: string,
		index: number
	) => {
		streamManager.addStream(platform, channel)
		removeFromHistory(index)
	}

	const handleCopyShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
		} catch (e) {
			// ignore
		}
	}

	const handleRenameStream = (id: string, rawValue: string) => {
		const normalized = normalizeChannel(rawValue)
		if (!normalized) return false
		return streamManager.renameStream(id, normalized)
	}

	// Drag and drop handlers for grid mode
	const onDragStart = (id: string) => setDragId(id)
	const onDragEnter = (id: string) => setDragOverId(id)
	const onDragLeave = (id: string) => {
		if (dragOverId === id) setDragOverId(null)
	}
	const onDragOver: React.DragEventHandler<HTMLDivElement> = e => {
		e.preventDefault()
	}
	const onDrop = (targetId: string) => {
		if (!dragId || dragId === targetId) return
		streamManager.reorderStreams(dragId, targetId)
		setDragId(null)
		setDragOverId(null)
	}

	// Collapse/expand header when streams count crosses 0 <-> >0
	useEffect(() => {
		const prev = prevCountRef.current
		const curr = streamManager.streams.length
		if (prev === 0 && curr > 0) setHeaderOpen(false)
		if (prev > 0 && curr === 0) setHeaderOpen(true)
		prevCountRef.current = curr
	}, [streamManager.streams.length])

	return (
		<>
			<Header
				headerRef={headerRef}
				headerOpen={headerOpen}
				historyOpen={historyOpen}
				platform={platform}
				channel={channel}
				cols={layoutManager.cols}
				muted={muted}
				onHeaderToggle={() => setHeaderOpen(o => !o)}
				onHistoryToggle={() => setHistoryOpen(o => !o)}
				onPlatformChange={setPlatform}
				onChannelChange={setChannel}
				onAddStream={handleAddStream}
				onColsChange={layoutManager.setCols}
				onMutedToggle={() => setMuted(m => !m)}
				onCopyShare={handleCopyShare}
				onResetLayout={layoutManager.resetLayout}
			/>

			<div
				ref={containerRef}
				className={cn(
					'px-4 sm:px-6 py-3 mx-auto h-full box-border overflow-hidden bg-zinc-800 transition-all duration-300',
					historyOpen && 'sm:mr-[280px]'
				)}
			>
				{streamManager.streams.length === 0 ? (
					<div className="flex opacity-80 mt-[20vh] justify-center">
						<p>
							Adicione canais da Twitch ou Kick acima. Você também pode colar a
							URL do canal; o link de compartilhamento mantém sua seleção nos
							parâmetros.
						</p>
					</div>
				) : null}

				<div
					className={cn(
						'mt-3 gap-2 justify-center',
						layoutManager.isCustomMode ? 'relative' : 'grid'
					)}
					style={
						layoutManager.isCustomMode
							? { position: 'relative', minHeight: '100vh' }
							: {
									gridTemplateColumns: `repeat(${layoutManager.cols}, ${layoutManager.tileSize.w}px)`,
								}
					}
				>
					{streamManager.streams.map((s, idx) => {
						const position = layoutManager.allTilePositions.get(s.id)

						return (
							<StreamCard
								key={s.id}
								stream={s}
								position={position}
								tileSize={layoutManager.tileSize}
								muted={muted}
								reloadKey={streamManager.reloadById[s.id] || 0}
								parentHost={parentHost}
								isCustomMode={layoutManager.isCustomMode}
								// Grid mode props
								order={streamManager.layoutIndexMap.get(s.id) ?? idx}
								dragId={dragId}
								dragOverId={dragOverId}
								onDragStart={() => onDragStart(s.id)}
								onDragEnter={() => onDragEnter(s.id)}
								onDragLeave={() => onDragLeave(s.id)}
								onDragOver={onDragOver}
								onDrop={() => onDrop(s.id)}
								// Custom mode props
								onResizeStop={(ref, pos) =>
									layoutManager.handleResizeStop(s.id, ref, pos)
								}
								onDragStop={data => layoutManager.handleDragStop(s.id, data)}
								// Common actions
								onReload={() => streamManager.reloadStream(s.id)}
								onRemove={() => handleRemoveStream(s.id)}
								onRename={value => handleRenameStream(s.id, value)}
							/>
						)
					})}
				</div>
			</div>

			{/* History Sidebar */}
			<HistorySidebar
				isOpen={historyOpen}
				history={history}
				onRestore={handleRestoreFromHistory}
				onDelete={removeFromHistory}
			/>
		</>
	)
}

export default App
