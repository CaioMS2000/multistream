import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
	Volume2,
	VolumeX,
	Plus,
	ChevronUp,
	ChevronDown,
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
import type { Platform } from '@/types'

type HeaderProps = {
	headerRef: React.RefObject<HTMLElement | null>
	headerOpen: boolean
	historyOpen: boolean
	platform: Platform
	channel: string
	cols: number
	muted: boolean
	onHeaderToggle: () => void
	onHistoryToggle: () => void
	onPlatformChange: (platform: Platform) => void
	onChannelChange: (channel: string) => void
	onAddStream: () => void
	onColsChange: (cols: number) => void
	onMutedToggle: () => void
	onCopyShare: () => void
	onResetLayout: () => void
}

export function Header({
	headerRef,
	headerOpen,
	historyOpen,
	platform,
	channel,
	cols,
	muted,
	onHeaderToggle,
	onHistoryToggle,
	onPlatformChange,
	onChannelChange,
	onAddStream,
	onColsChange,
	onMutedToggle,
	onCopyShare,
	onResetLayout,
}: HeaderProps) {
	return (
		<>
			{/* Toggle button for header collapse/expand */}
			<Button
				className="fixed top-2 right-2 z-30"
				variant="outline"
				size="icon"
				aria-label={headerOpen ? 'Colapsar cabeçalho' : 'Expandir cabeçalho'}
				aria-pressed={headerOpen}
				onClick={onHeaderToggle}
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
				onClick={onHistoryToggle}
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
										onValueChange={v => onPlatformChange(v as Platform)}
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
											onChannelChange(e.target.value)
										}
										onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
											if (e.key === 'Enter') onAddStream()
										}}
										className="w-56"
									/>
									<Button
										onClick={onAddStream}
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
											onColsChange(Math.min(Math.max(Number.parseInt(v), 1), 4))
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
												onClick={onMutedToggle}
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
											<Button variant="outline" onClick={onCopyShare}>
												Copiar link
											</Button>
										</TooltipTrigger>
										<TooltipContent>Copiar configuração atual</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" onClick={onResetLayout}>
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
		</>
	)
}
