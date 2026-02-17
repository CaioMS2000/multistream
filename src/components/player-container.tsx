import type { Stream } from '@/@types'
import { STREAM_OPTION } from '@/@types'
import { useStreamsStore } from '@/store/streams'
import { memo, useEffect, type JSX } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { RotateCcw, X } from 'lucide-react'
import { TwitchPlayer } from './players/twitch-player'
import { KickPlayer } from './players/kick-player'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'

type PlayerContainerProps = {
	stream: Stream
	streamIndex: number
}

export const PlayerContainer = memo(function PlayerContainer({
	stream,
	streamIndex,
}: PlayerContainerProps) {
	const removeStream = useStreamsStore(state => state.removeStream)
	const reloadStream = useStreamsStore(state => state.reloadStream)
	const reloadKey = useStreamsStore(state => state.reloadKeys[streamIndex] ?? 0)

	function onClickClose() {
		removeStream(streamIndex)
	}

	function onClickReload() {
		reloadStream(streamIndex)
	}

	useEffect(() => {
		if (!STREAM_OPTION.includes(stream.platform as STREAM_OPTION)) {
			toast.error(`Plataforma "${stream.platform}" não suportada.`)
		}
	}, [stream.platform])

	let PlayerComponent: JSX.Element
	switch (stream.platform) {
		case 'twitch':
			PlayerComponent = (
				<TwitchPlayer key={reloadKey} username={stream.username} />
			)
			break
		case 'kick':
			PlayerComponent = (
				<KickPlayer key={reloadKey} username={stream.username} />
			)
			break
		default: {
			const _exhaustive: never = stream.platform
			PlayerComponent = (
				<Card className="m-4">
					<CardHeader>
						<CardTitle>Plataforma não suportada</CardTitle>
						<CardDescription>
							"{_exhaustive as string}" não é uma plataforma válida.
						</CardDescription>
					</CardHeader>
				</Card>
			)
		}
	}
	return (
		<div className="relative bg-yellow-200 w-full h-full">
			<div className="absolute w-full flex justify-end gap-2 pt-1 pr-1">
				<Button type="button" onClick={onClickClose}>
					<X />
				</Button>
				<Button type="button" onClick={onClickReload}>
					<RotateCcw />
				</Button>
			</div>
			{PlayerComponent}
		</div>
	)
})
