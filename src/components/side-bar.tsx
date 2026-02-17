import { ChevronLeft, ChevronRight, Trash, Undo2 } from 'lucide-react'
import { useState } from 'react'
import type { Stream } from '@/@types'
import { useHistoryStore } from '@/store/history'
import { useStreamsStore } from '@/store/streams'
import { Button } from './ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from './ui/collapsible'

export function SideBar() {
	const [open, setOpen] = useState(true)
	const history = useHistoryStore(state => state.history)
	const removeFromHistory = useHistoryStore(state => state.removeFromHistory)
	const addStream = useStreamsStore(state => state.addStream)
	const historyEmpty = history.length === 0

	function onRestore(stream: Stream) {
		removeFromHistory(stream)
		addStream(stream)
	}

	function onRemove(stream: Stream) {
		removeFromHistory(stream)
	}

	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className="absolute top-1/2 -translate-y-1/2 right-0 z-10 h-10/12 pr-1"
		>
			<CollapsibleTrigger>
				<Button>{open ? <ChevronRight /> : <ChevronLeft />}</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="bg-card text-card-foreground border border-r-0 border-border rounded-l-lg p-4 overflow-y-auto">
				{!historyEmpty &&
					history.map((stream, index) => {
						const key = index
						return (
							<div key={key} className="flex space-x-2 items-center">
								<div className="flex gap-2">
									<Button onClick={() => onRestore(stream)}>
										<Undo2 />
									</Button>
									<Button onClick={() => onRemove(stream)}>
										<Trash />
									</Button>
								</div>
								<p>{stream.channel}</p>
							</div>
						)
					})}
			</CollapsibleContent>
		</Collapsible>
	)
}
