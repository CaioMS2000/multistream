import { useEffect } from 'react'

export type KickPlayerProps = {
	channel: string
	muted: boolean
}

export function KickPlayer({ channel, muted }: KickPlayerProps) {
	const safeChannel = channel.toLowerCase()
	const src = `https://player.kick.com/${encodeURIComponent(safeChannel)}?autoplay=true${muted ? '&muted=true' : ''}`
	console.log(`[KickPlayer:${channel}] src recomputed; muted=${muted}`)

	useEffect(() => {
		console.log(`[KickPlayer:${channel}] mount`)
		return () => console.log(`[KickPlayer:${channel}] unmount`)
	}, [channel])

	return (
		<iframe
			src={src}
			allow="autoplay; encrypted-media; picture-in-picture"
			allowFullScreen
			frameBorder={0}
			width="100%"
			height="100%"
			className="block"
			title={`Kick:${channel}`}
		/>
	)
}
