import { Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type { HistoryItem, Platform } from '@/types'
import { cn } from '@/lib/utils'

type HistorySidebarProps = {
	isOpen: boolean
	history: HistoryItem[]
	onRestore: (platform: Platform, channel: string, index: number) => void
	onDelete: (index: number) => void
}

export function HistorySidebar({
	isOpen,
	history,
	onRestore,
	onDelete,
}: HistorySidebarProps) {
	return (
		<div
			className={cn(
				'fixed right-0 top-0 h-full w-full sm:w-[280px] bg-card border-l border-border z-20 transition-transform duration-300 ease-in-out',
				isOpen ? 'translate-x-0' : 'translate-x-full'
			)}
			role="complementary"
			aria-label="Histórico de streams"
		>
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="px-4 py-3 border-b border-border">
					<h2 className="text-lg font-semibold">Histórico</h2>
					<p className="text-xs text-muted-foreground mt-1">
						{history.length === 0
							? 'Nenhum canal removido'
							: `Últimos ${history.length} ${history.length === 1 ? 'canal removido' : 'canais removidos'}`}
					</p>
				</div>

				{/* Lista com scroll */}
				<div className="flex-1 overflow-y-auto p-2">
					{history.length === 0 ? (
						<div className="flex items-center justify-center h-full text-muted-foreground text-sm px-4 text-center">
							Nenhum canal removido ainda. Streams removidos aparecerão aqui.
						</div>
					) : (
						<div className="space-y-2">
							{history.map((item, index) => (
								<HistoryItemCard
									key={`${item.platform}-${item.channel}-${item.removedAt}-${index}`}
									item={item}
									onRestore={() =>
										onRestore(item.platform, item.channel, index)
									}
									onDelete={() => onDelete(index)}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

type HistoryItemCardProps = {
	item: HistoryItem
	onRestore: () => void
	onDelete: () => void
}

function HistoryItemCard({ item, onRestore, onDelete }: HistoryItemCardProps) {
	return (
		<Card className="p-3 hover:bg-accent/50 transition-colors">
			<div className="flex items-center gap-2">
				{/* Ícone da plataforma */}
				<div className="flex-shrink-0">
					{item.platform === 'twitch' ? (
						<TwitchIcon className="w-5 h-5 text-purple-500" />
					) : (
						<KickIcon className="w-5 h-5 text-green-500" />
					)}
				</div>

				{/* Nome do canal */}
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium truncate">{item.channel}</p>
					<p className="text-xs text-muted-foreground capitalize">
						{item.platform}
					</p>
				</div>

				{/* Botões de ação */}
				<div className="flex items-center gap-1">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={onRestore}
									aria-label="Restaurar stream"
								>
									<Undo2 className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Restaurar stream</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-destructive hover:bg-destructive/10"
									onClick={onDelete}
									aria-label="Remover do histórico"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Remover do histórico</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>
		</Card>
	)
}

// Ícones SVG das plataformas
function TwitchIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
		</svg>
	)
}

function KickIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M6 3v18h3.6V13.8L15 21h4.2l-6.6-8.4L19.2 3H15l-5.4 7.2V3z" />
		</svg>
	)
}
