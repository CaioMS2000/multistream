import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import TwitchPlayer from './components/TwitchPlayer'
import KickPlayer from './components/KickPlayer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
	Volume2,
	VolumeX,
	Plus,
	ChevronUp,
	ChevronDown,
	RotateCw,
	History,
} from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import {
	type CustomLayout,
	type Rectangle,
	calculateTilePositions,
	enforceAspectRatio,
	isValidPosition,
} from '@/lib/layoutUtils'
import {
	clearCustomLayout,
	loadCustomLayout,
	saveCustomLayout,
} from '@/hooks/useLocalStorage'
import { useStreamHistory } from '@/hooks/useStreamHistory'
import { HistorySidebar } from '@/components/HistorySidebar'
import { cn } from '@/lib/utils'
import { calculateOptimalTileSize } from '@/lib/tileSizing'

type Platform = 'twitch' | 'kick'

type Stream = {
	id: string
	platform: Platform
	channel: string
}

function parseInitialLayout(): {
	streams: Stream[]
	cols: number
	muted: boolean
} {
	const url = new URL(window.location.href)
	const ordered = (url.searchParams.get('streams') || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	const fromOrdered: Stream[] = []
	const mk =
		(platform: Platform) =>
		(name: string, idx: number): Stream => ({
			id: `${platform}:${name}:${idx}:${Math.random().toString(36).slice(2, 7)}`,
			platform,
			channel: name,
		})
	for (let i = 0; i < ordered.length; i++) {
		const token = ordered[i]
		const [pfx, name] = token.split(':')
		if (!name) continue
		const plat =
			pfx === 't' || pfx === 'twitch'
				? 'twitch'
				: pfx === 'k' || pfx === 'kick'
					? 'kick'
					: null
		if (!plat) continue
		fromOrdered.push(mk(plat)(name, i))
	}

	const twitch = (url.searchParams.get('twitch') || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	const kick = (url.searchParams.get('kick') || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	const colsParam = Number.parseInt(url.searchParams.get('cols') || '')
	const cols = Number.isFinite(colsParam)
		? Math.min(Math.max(colsParam, 1), 4)
		: 2
	const muted = url.searchParams.has('muted')

	return {
		streams:
			fromOrdered.length > 0
				? fromOrdered
				: [...twitch.map(mk('twitch')), ...kick.map(mk('kick'))],
		cols,
		muted,
	}
}

function toUrlParams(streams: Stream[], cols: number, muted: boolean) {
	const url = new URL(window.location.href)
	// Ordered list param
	const ordered = streams.map(
		s => `${s.platform === 'twitch' ? 't' : 'k'}:${s.channel}`
	)
	if (ordered.length) url.searchParams.set('streams', ordered.join(','))
	else url.searchParams.delete('streams')
	// Only use canonical 'streams' param; remove legacy ones
	url.searchParams.delete('twitch')
	url.searchParams.delete('kick')
	// Layout params
	if (cols !== 2) url.searchParams.set('cols', String(cols))
	else url.searchParams.delete('cols')
	if (muted) url.searchParams.set('muted', '')
	else url.searchParams.delete('muted')
	// Serialize with bare flag (no '=') for `muted`
	let href = url.toString()
	href = href.replace(/([?&])muted=/g, '$1muted')
	return href
}

function useUrlSync(streams: Stream[], cols: number, muted: boolean) {
	useEffect(() => {
		const href = toUrlParams(streams, cols, muted)
		window.history.replaceState({}, '', href)
	}, [streams, cols, muted])
}

function App() {
	const initial = useMemo(() => parseInitialLayout(), [])
	const [streams, setStreams] = useState<Stream[]>(initial.streams)
	const [layoutOrder, setLayoutOrder] = useState<string[]>(() =>
		initial.streams.map(s => s.id)
	)
	const [cols, setCols] = useState<number>(initial.cols)
	const [platform, setPlatform] = useState<Platform>('twitch')
	const [channel, setChannel] = useState('')
	const [muted, setMuted] = useState<boolean>(initial.muted)
	const [headerOpen, setHeaderOpen] = useState<boolean>(
		initial.streams.length === 0
	)
	const [reloadById, setReloadById] = useState<Record<string, number>>({})
	const [dragId, setDragId] = useState<string | null>(null)
	const [dragOverId, setDragOverId] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)
	const headerRef = useRef<HTMLElement | null>(null)
	const prevColsRef = useRef<number>(cols)
	const [tileSize, setTileSize] = useState<{ w: number; h: number }>({
		w: 0,
		h: 0,
	})
	const [customLayout, setCustomLayout] = useState<CustomLayout>(
		() => loadCustomLayout(initial.streams) ?? {}
	)
	const [historyOpen, setHistoryOpen] = useState<boolean>(false)
	const { history, addToHistory, removeFromHistory } = useStreamHistory()

	const orderedStreams = useMemo(() => {
		if (streams.length === 0) return []
		const byId = new Map<string, Stream>()
		streams.forEach(s => byId.set(s.id, s))
		const seen = new Set<string>()
		const ordered: Stream[] = []
		layoutOrder.forEach(id => {
			const item = byId.get(id)
			if (item) {
				ordered.push(item)
				seen.add(id)
			}
		})
		if (seen.size !== streams.length) {
			streams.forEach(s => {
				if (!seen.has(s.id)) ordered.push(s)
			})
		}
		return ordered
	}, [layoutOrder, streams])

	const layoutIndexMap = useMemo(() => {
		const map = new Map<string, number>()
		layoutOrder.forEach((id, idx) => {
			map.set(id, idx)
		})
		return map
	}, [layoutOrder])

	// Entrar em modo custom automaticamente se houver streams
	// Isso permite redimensionar desde o início
	const isCustomMode = streams.length > 0

	const allTilePositions = useMemo(() => {
		return calculateTilePositions(
			streams,
			layoutOrder,
			customLayout,
			tileSize,
			cols
		)
	}, [streams, layoutOrder, customLayout, tileSize, cols])

	useUrlSync(orderedStreams, cols, muted)

	const addStream = () => {
		const ch = normalizeChannel(channel)
		if (!ch) return
		const stream: Stream = {
			id: `${platform}:${ch}:${Date.now()}`,
			platform,
			channel: ch,
		}
		setStreams(prev => [...prev, stream])
		setLayoutOrder(prev => [...prev, stream.id])
		setChannel('')
	}

	const removeStream = (id: string) => {
		// Capturar dados antes de remover
		const stream = streams.find(s => s.id === id)
		if (stream) {
			addToHistory(stream.platform, stream.channel)
		}

		// Remover do estado
		setStreams(prev => prev.filter(s => s.id !== id))
		setLayoutOrder(prev => prev.filter(existingId => existingId !== id))
	}

	const restoreFromHistory = (
		platform: Platform,
		channel: string,
		index: number
	) => {
		const stream: Stream = {
			id: `${platform}:${channel}:${Date.now()}`,
			platform,
			channel,
		}
		setStreams(prev => [...prev, stream])
		setLayoutOrder(prev => [...prev, stream.id])
		// Remove do histórico
		removeFromHistory(index)
	}

	const copyShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href)
		} catch (e) {
			// ignore
		}
	}
	const resetLayout = () => {
		// Apenas resetar customizações de layout (não limpar streams)
		setCustomLayout({})
		clearCustomLayout(streams)
	}

	// Função opcional para limpar tudo (não utilizada no momento)
	// Para usar, adicione um botão com onClick={clearAll}
	// const clearAll = () => {
	// 	setStreams([])
	// 	setLayoutOrder([])
	// 	setCustomLayout({})
	// 	setCols(2)
	// 	setMuted(false)
	// 	const clean = `${window.location.origin}${window.location.pathname}`
	// 	window.history.replaceState({}, '', clean)
	// }

	const renameStreamChannel = (id: string, rawValue: string) => {
		const normalized = normalizeChannel(rawValue)
		if (!normalized) return false
		let changed = false
		setStreams(prev =>
			prev.map(stream => {
				if (stream.id !== id) return stream
				if (stream.channel === normalized) return stream
				changed = true
				return { ...stream, channel: normalized }
			})
		)
		if (changed) {
			setReloadById(prev => ({
				...prev,
				[id]: (prev[id] || 0) + 1,
			}))
		}
		return true
	}

	const parentHost = window.location.hostname

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
		setLayoutOrder(prev => {
			const from = prev.indexOf(dragId)
			const to = prev.indexOf(targetId)
			if (from < 0 || to < 0) return prev
			const next = [...prev]
			const [moved] = next.splice(from, 1)
			next.splice(to, 0, moved)
			return next
		})
		setDragId(null)
		setDragOverId(null)
	}

	const reloadStream = (id: string) =>
		setReloadById(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))

	const handleResizeStop = (
		streamId: string,
		ref: HTMLElement,
		position: { x: number; y: number }
	) => {
		let newRect: Rectangle = {
			x: position.x,
			y: position.y,
			w: ref.offsetWidth,
			h: ref.offsetHeight,
		}

		// Garantir aspect ratio 16:9
		newRect = enforceAspectRatio(newRect)

		const containerBounds = {
			w: containerRef.current?.clientWidth ?? window.innerWidth,
			h: containerRef.current?.clientHeight ?? window.innerHeight,
		}

		if (isValidPosition(streamId, newRect, allTilePositions, containerBounds)) {
			setCustomLayout(prev => ({
				...prev,
				[streamId]: newRect,
			}))
		} else {
			console.warn('Invalid resize - would overlap or exceed bounds')
		}
	}

	const handleDragStop = (streamId: string, data: { x: number; y: number }) => {
		const currentRect = allTilePositions.get(streamId)
		if (!currentRect) return

		const newRect: Rectangle = {
			x: data.x,
			y: data.y,
			w: currentRect.w,
			h: currentRect.h,
		}

		const containerBounds = {
			w: containerRef.current?.clientWidth ?? window.innerWidth,
			h: containerRef.current?.clientHeight ?? window.innerHeight,
		}

		if (isValidPosition(streamId, newRect, allTilePositions, containerBounds)) {
			setCustomLayout(prev => ({
				...prev,
				[streamId]: newRect,
			}))
		} else {
			console.warn('Invalid drag - would overlap or exceed bounds')
		}
	}

	// Compute tile size to fit viewport without scroll
	useEffect(() => {
		function recalc() {
			// Measure container paddings
			let cw = window.innerWidth
			let ch = window.innerHeight
			let padX = 0
			let padY = 0

			if (containerRef.current) {
				const el = containerRef.current
				const cs = getComputedStyle(el)
				const pl = Number.parseFloat(cs.paddingLeft) || 0
				const pr = Number.parseFloat(cs.paddingRight) || 0
				const pt = Number.parseFloat(cs.paddingTop) || 0
				const pb = Number.parseFloat(cs.paddingBottom) || 0
				padX = pl + pr
				padY = pt + pb
				cw = (el.clientWidth || window.innerWidth) - padX
				ch = (el.clientHeight || window.innerHeight) - padY
			}

			// Detecta mudança de colunas
			const colsChanged = prevColsRef.current !== cols
			if (colsChanged) {
				prevColsRef.current = cols
			}

			// Calcula novo tamanho usando função pura
			const newSize = calculateOptimalTileSize({
				containerWidth: cw,
				containerHeight: ch,
				numStreams: streams.length,
				cols: cols,
				headerHeight: 0,
				marginTop: 12,
				currentSize: colsChanged ? undefined : tileSize,
				preventShrinkOnRowAdd: true,
			})

			// Só atualiza se realmente mudou (previne re-renders)
			if (newSize.w !== tileSize.w || newSize.h !== tileSize.h) {
				setTileSize(newSize)
			}
		}

		recalc()

		const onResize = () => recalc()
		window.addEventListener('resize', onResize)

		const ro = new ResizeObserver(() => recalc())
		if (containerRef.current) ro.observe(containerRef.current)
		if (headerRef.current) ro.observe(headerRef.current)

		return () => {
			window.removeEventListener('resize', onResize)
			ro.disconnect()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
		// tileSize é intencionalmente excluído: é o output, não um trigger
	}, [streams.length, cols, headerOpen, historyOpen])

	// Auto-save customLayout to localStorage
	useEffect(() => {
		if (Object.keys(customLayout).length > 0) {
			saveCustomLayout(streams, customLayout)
		}
	}, [customLayout, streams])

	// Collapse/expand header when streams count crosses 0 <-> >0
	const prevCountRef = useRef<number>(streams.length)
	useEffect(() => {
		const prev = prevCountRef.current
		const curr = streams.length
		if (prev === 0 && curr > 0) setHeaderOpen(false)
		if (prev > 0 && curr === 0) setHeaderOpen(true)
		prevCountRef.current = curr
	}, [streams.length])

	return (
		<>
			{/* Toggle button for header collapse/expand */}
			<Button
				className="fixed top-2 right-2 z-30"
				variant="outline"
				size="icon"
				aria-label={headerOpen ? 'Colapsar cabeçalho' : 'Expandir cabeçalho'}
				aria-pressed={headerOpen}
				onClick={() => setHeaderOpen(o => !o)}
			>
				{headerOpen ? (
					<ChevronUp aria-hidden className="size-4" />
				) : (
					<ChevronDown aria-hidden className="size-4" />
				)}
			</Button>

			{/* Toggle button for history sidebar */}
			<Button
				className="fixed top-16 right-2 z-30"
				variant="outline"
				size="icon"
				aria-label={historyOpen ? 'Fechar histórico' : 'Abrir histórico'}
				aria-pressed={historyOpen}
				onClick={() => setHistoryOpen(o => !o)}
			>
				<History aria-hidden className="size-4" />
			</Button>

			{headerOpen && (
				<div className="fixed inset-x-0 top-0 z-20 bg-background border-b border-border">
					<div className="px-4 sm:px-6 py-3 mx-auto">
						<header
							id="header"
							ref={headerRef}
							className="flex items-center gap-3 flex-wrap"
						>
							<h1 className="text-xl font-semibold tracking-tight mr-2">
								MultiStream
							</h1>
							<div className="flex items-center gap-2 flex-wrap">
								<div className="flex items-center gap-2">
									<Label className="text-sm opacity-80">Plataforma</Label>
									<Select
										value={platform}
										onValueChange={v => setPlatform(v as Platform)}
									>
										<SelectTrigger className="w-28 h-9">
											<SelectValue placeholder="Selecione" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="twitch">Twitch</SelectItem>
											<SelectItem value="kick">Kick</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center gap-2">
									<Input
										placeholder="canal (ex: xqc) ou URL"
										value={channel}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setChannel(e.target.value)
										}
										onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
											if (e.key === 'Enter') addStream()
										}}
										className="w-56"
									/>
									<Button
										onClick={addStream}
										variant="outline"
										aria-label="Adicionar stream"
									>
										<Plus className="text-foreground" />
										<span className="text-foreground">Adicionar</span>
									</Button>
								</div>

								<Separator orientation="vertical" className="h-6 mx-1" />

								<div className="flex items-center gap-2">
									<Label className="text-sm opacity-80">Colunas</Label>
									<Select
										value={String(cols)}
										onValueChange={v =>
											setCols(Math.min(Math.max(Number.parseInt(v), 1), 4))
										}
									>
										<SelectTrigger className="w-20 h-9">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">1</SelectItem>
											<SelectItem value="2">2</SelectItem>
											<SelectItem value="3">3</SelectItem>
											<SelectItem value="4">4</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<Separator orientation="vertical" className="h-6 mx-1" />

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="outline"
												size="icon"
												aria-pressed={muted}
												aria-label={muted ? 'Desmutar global' : 'Mutar global'}
												onClick={() => setMuted(m => !m)}
											>
												{muted ? (
													<VolumeX
														aria-hidden
														className="size-4 text-foreground/90"
													/>
												) : (
													<Volume2
														aria-hidden
														className="size-4 text-foreground/90"
													/>
												)}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											{muted ? 'Desmutar global' : 'Mutar global'}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<Separator orientation="vertical" className="h-6 mx-1" />

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="outline" onClick={copyShare}>
												Copiar link
											</Button>
										</TooltipTrigger>
										<TooltipContent>Copiar configuração atual</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" onClick={resetLayout}>
												Resetar layout
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											Voltar ao grid padrão (mantém canais)
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</header>
					</div>
				</div>
			)}

			<div
				ref={containerRef}
				className={cn(
					'px-4 sm:px-6 py-3 mx-auto h-full box-border overflow-hidden bg-zinc-800 transition-all duration-300',
					historyOpen && 'sm:mr-[280px]'
				)}
			>
				{streams.length === 0 ? (
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
						isCustomMode ? 'relative' : 'grid'
					)}
					style={
						isCustomMode
							? { position: 'relative', minHeight: '100vh' }
							: { gridTemplateColumns: `repeat(${cols}, ${tileSize.w}px)` }
					}
				>
					{streams.map((s, idx) => {
						const position = allTilePositions.get(s.id)

						if (isCustomMode && position) {
							// Modo customizado: usar Rnd
							return (
								<Rnd
									key={s.id}
									size={{ width: position.w, height: position.h }}
									position={{ x: position.x, y: position.y }}
									lockAspectRatio={16 / 9}
									bounds="parent"
									onResizeStop={(_e, _dir, ref, _delta, pos) =>
										handleResizeStop(s.id, ref, pos)
									}
									onDragStop={(_e, data) => handleDragStop(s.id, data)}
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
										<div className="absolute top-1.5 left-2 z-10 flex items-center gap-1 text-xs px-2 py-0 pr-0 rounded-md bg-black/60 text-white pointer-events-auto opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
											<span className="ml-1 uppercase tracking-wide">
												{s.platform}
											</span>

											<EditableChannelLabel
												channel={s.channel}
												onCommit={value => renameStreamChannel(s.id, value)}
											/>
										</div>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														onClick={() => reloadStream(s.id)}
														variant="outline"
														size="icon"
														className="absolute top-1.5 right-10 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
														aria-label="Recarregar stream"
													>
														<RotateCw className="size-4" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Recarregar stream</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														onClick={() => removeStream(s.id)}
														variant="destructive"
														size="icon"
														className="absolute top-1.5 right-1.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
													>
														×
													</Button>
												</TooltipTrigger>
												<TooltipContent>Remover stream</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<div className="w-full h-full">
											{s.platform === 'twitch' ? (
												<TwitchPlayer
													key={`${s.id}:${reloadById[s.id] || 0}`}
													id={s.id}
													channel={s.channel}
													parent={parentHost}
													muted={muted}
												/>
											) : (
												<KickPlayer
													key={`${s.id}:${reloadById[s.id] || 0}`}
													channel={s.channel}
													muted={muted}
												/>
											)}
										</div>
									</Card>
								</Rnd>
							)
						}

						// Modo grid padrão
						return (
							<Card
								key={s.id}
								style={{ order: layoutIndexMap.get(s.id) ?? idx }}
								draggable={!isCustomMode}
								onDragStart={
									!isCustomMode ? () => onDragStart(s.id) : undefined
								}
								onDragEnter={
									!isCustomMode ? () => onDragEnter(s.id) : undefined
								}
								onDragLeave={
									!isCustomMode ? () => onDragLeave(s.id) : undefined
								}
								onDragOver={!isCustomMode ? onDragOver : undefined}
								onDrop={!isCustomMode ? () => onDrop(s.id) : undefined}
								className={[
									'relative overflow-hidden cursor-move bg-black p-0 border-0 box-border group',
									dragOverId === s.id
										? 'outline outline-2 outline-indigo-500'
										: '',
									dragId === s.id ? 'opacity-80' : '',
								].join(' ')}
							>
								<div className="absolute top-1.5 left-2 z-10 flex items-center gap-1 text-xs px-2 py-0 pr-0 rounded-md bg-black/60 text-white pointer-events-auto opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
									<span className="ml-1 uppercase tracking-wide">
										{s.platform}
									</span>

									<EditableChannelLabel
										channel={s.channel}
										onCommit={value => renameStreamChannel(s.id, value)}
									/>
								</div>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={() => reloadStream(s.id)}
												variant="outline"
												size="icon"
												className="absolute top-1.5 right-10 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
												aria-label="Recarregar stream"
											>
												<RotateCw className="size-4" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>Recarregar stream</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={() => removeStream(s.id)}
												variant="destructive"
												size="icon"
												className="absolute top-1.5 right-1.5 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
											>
												×
											</Button>
										</TooltipTrigger>
										<TooltipContent>Remover stream</TooltipContent>
									</Tooltip>
								</TooltipProvider>
								<div
									style={{
										width: `${tileSize.w}px`,
										height: `${tileSize.h}px`,
									}}
								>
									{s.platform === 'twitch' ? (
										<TwitchPlayer
											key={`${s.id}:${reloadById[s.id] || 0}`}
											id={s.id}
											channel={s.channel}
											parent={parentHost}
											muted={muted}
										/>
									) : (
										<KickPlayer
											key={`${s.id}:${reloadById[s.id] || 0}`}
											channel={s.channel}
											muted={muted}
										/>
									)}
								</div>
							</Card>
						)
					})}
				</div>
			</div>

			{/* History Sidebar */}
			<HistorySidebar
				isOpen={historyOpen}
				history={history}
				onRestore={restoreFromHistory}
				onDelete={removeFromHistory}
			/>
		</>
	)
}

type EditableChannelLabelProps = {
	channel: string
	onCommit: (next: string) => boolean
}

function EditableChannelLabel({
	channel,
	onCommit,
}: EditableChannelLabelProps) {
	const [editing, setEditing] = useState(false)
	const [value, setValue] = useState(channel)
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (!editing) setValue(channel)
	}, [channel, editing])

	useEffect(() => {
		if (!editing) return
		const id = window.requestAnimationFrame(() => {
			inputRef.current?.focus()
			inputRef.current?.select()
		})
		return () => window.cancelAnimationFrame(id)
	}, [editing])

	const stopPointerPropagation = (event: React.SyntheticEvent) => {
		event.stopPropagation()
	}

	const commit = () => {
		const trimmed = value.trim()
		if (!trimmed) {
			setValue(channel)
			setEditing(false)
			return
		}
		const ok = onCommit(trimmed)
		if (!ok) {
			setValue(channel)
		}
		setEditing(false)
	}

	const cancel = () => {
		setValue(channel)
		setEditing(false)
	}

	if (editing) {
		return (
			<input
				ref={inputRef}
				value={value}
				onChange={e => setValue(e.target.value)}
				onBlur={commit}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						e.preventDefault()
						commit()
					} else if (e.key === 'Escape') {
						e.preventDefault()
						cancel()
					}
				}}
				onMouseDown={stopPointerPropagation}
				onPointerDown={stopPointerPropagation}
				className="bg-transparent border-b border-white/60 text-white outline-none text-xs w-28 focus-visible:border-white"
			/>
		)
	}

	return (
		<button
			type="button"
			onClick={e => {
				e.stopPropagation()
				setEditing(true)
			}}
			onMouseDown={stopPointerPropagation}
			onPointerDown={stopPointerPropagation}
			className="underline decoration-dotted underline-offset-2 hover:decoration-solid focus-visible:outline-none focus-visible:underline focus-visible:decoration-solid"
		>
			{channel}
		</button>
	)
}

function normalizeChannel(input: string) {
	const v = input.trim()
	if (!v) return ''
	// Accept raw handle or URLs from Twitch/Kick
	try {
		const url = new URL(v)
		const host = url.hostname.replace(/^www\./, '')
		if (host.includes('twitch.tv'))
			return url.pathname.replace(/\/+/, '').split('/')[0]
		if (host.includes('kick.com'))
			return url.pathname.replace(/\/+/, '').split('/')[0]
	} catch {
		// not a URL
	}
	return v.replace(/^@/, '').split(/[/?#]/)[0]
}

export default App
