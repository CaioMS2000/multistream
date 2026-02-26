import { RotateCcw, X } from 'lucide-react'
import { type JSX, memo, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Stream } from '@/@types'
import { STREAM_OPTION } from '@/@types'
import { KickPlayer } from './players/kick-player'
import { TwitchPlayer } from './players/twitch-player'
import { Button } from './ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'
import { useStreamManager } from '@/hooks/use-stream-manager'

type PlayerContainerProps = {
	stream: Stream
}

export const PlayerContainer = memo(function PlayerContainer({
	stream,
}: PlayerContainerProps) {
	const { removeStream } = useStreamManager()
	const [channel, setChannel] = useState(stream.channel)
	const [platform, setPlatform] = useState(stream.platform)

	useEffect(() => {
		setChannel(stream.channel)
		setPlatform(stream.platform)
	}, [stream.channel, stream.platform])

	function onClickClose() {
		removeStream(stream.platform, stream.channel)
	}

	function onClickReload() {}

	function onChannelBlur() {}

	function onPlatformChange(value: string) {}

	useEffect(() => {
		if (!STREAM_OPTION.includes(stream.platform as STREAM_OPTION)) {
			toast.error(`Plataforma "${stream.platform}" não suportada.`)
		}
	}, [stream.platform])

	let PlayerComponent: JSX.Element
	switch (stream.platform) {
		case 'twitch':
			PlayerComponent = (
				<TwitchPlayer
					key={`${stream.platform}:${stream.channel}`}
					channel={stream.channel}
				/>
			)
			break
		case 'kick':
			PlayerComponent = (
				<KickPlayer
					key={`${stream.platform}:${stream.channel}`}
					channel={stream.channel}
				/>
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
		<div className="relative w-full h-full group">
			<div className="flex absolute justify-between w-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="flex gap-1 items-center">
					<Select value={platform} onValueChange={onPlatformChange}>
						<SelectTrigger className="bg-card hover:bg-card dark:bg-card dark:hover:bg-card">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="bg-card dark:bg-card">
							<SelectGroup>
								{STREAM_OPTION.map(option => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					<div className="inline-grid grid-cols-[min-content] *:col-start-1 *:row-start-1">
						<span className="invisible px-3 py-1 text-sm whitespace-pre">
							{channel || ' '}
						</span>
						<Input
							type="text"
							className="bg-card dark:bg-card pr-1"
							value={channel}
							onChange={e => setChannel(e.target.value)}
							onBlur={onChannelBlur}
						/>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="destructive"
						size="icon"
						className="dark:bg-destructive"
						onClick={onClickClose}
					>
						<X />
					</Button>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="bg-card dark:bg-card"
						onClick={onClickReload}
					>
						<RotateCcw />
					</Button>
				</div>
			</div>
			{PlayerComponent}
		</div>
	)
})
