import { ChevronRight, History, Search, Trash, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Stream } from '@/@types'
import { useStreamManager } from '@/hooks/use-stream-manager'
import { SearchEngine } from '@/lib/text'
import { useHistoryStore } from '@/store/history'
import { Button } from './ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from './ui/collapsible'
import { Input } from './ui/input'

const streamKey = (s: Stream) => `${s.platform}:${s.channel}`

export function SideBar() {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const history = useHistoryStore(state => state.history)
	const removeFromHistory = useHistoryStore(s => s.removeFromHistory)
	const { activateFromHistory } = useStreamManager()
	const historyEmpty = history.length === 0

	const visibleHistory = useMemo(() => {
		// Sem nada digitado: comportamento atual (mostra tudo)
		if (query.trim() === '') return history

		const byKey = new Map(history.map(s => [streamKey(s), s]))
		return SearchEngine.search([...byKey.keys()], query)
			.map(key => byKey.get(key))
			.filter((s): s is Stream => s !== undefined)
	}, [history, query])

	const noResults = !historyEmpty && visibleHistory.length === 0

	function onRestore(stream: Stream) {
		activateFromHistory(stream)
	}

	function onRemove(stream: Stream) {
		removeFromHistory(stream)
	}

	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className="absolute top-1/2 -translate-y-1/2 right-0 z-10 h-10/12 max-h-10/12 pr-1"
		>
			{!open && (
				<CollapsibleTrigger asChild>
					<Button variant="outline" size="icon">
						<History />
					</Button>
				</CollapsibleTrigger>
			)}
			<CollapsibleContent className="h-full flex flex-col bg-card text-card-foreground border border-r-0 border-border rounded-l-lg p-4">
				<CollapsibleTrigger asChild>
					<Button variant="outline" className="mb-4">
						<ChevronRight /> Histórico
					</Button>
				</CollapsibleTrigger>

				{!historyEmpty && (
					<div className="relative mb-4">
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Pesquisar..."
							className="pl-8"
							value={query}
							onChange={e => setQuery(e.target.value)}
						/>
					</div>
				)}

				<div className="flex-1 overflow-auto min-h-0 space-y-2">
					{visibleHistory.map(stream => (
						<div
							key={streamKey(stream)}
							className="flex space-x-2 items-center border-zinc-700 border-2 rounded-lg p-2"
						>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onRestore(stream)}
								>
									<Undo2 />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive hover:bg-destructive/10"
									onClick={() => onRemove(stream)}
								>
									<Trash />
								</Button>
							</div>
							<div className="flex flex-col">
								<p className="text-sm">{stream.channel}</p>
								<span
									className={
										stream.platform === 'twitch'
											? 'text-xs text-purple-500'
											: 'text-xs text-green-500'
									}
								>
									{stream.platform}
								</span>
							</div>
						</div>
					))}
				</div>

				{historyEmpty && (
					<div className="flex gap-2 items-center text-muted-foreground">
						<History className="size-4" />
						<span>Histórico vazio.</span>
					</div>
				)}
				{noResults && (
					<div className="flex gap-2 items-center text-muted-foreground">
						<Search className="size-4" />
						<span>Nenhum resultado.</span>
					</div>
				)}
			</CollapsibleContent>
		</Collapsible>
	)
}
