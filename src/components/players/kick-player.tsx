export type KickPlayerProps = {
	channel: string
	muted: boolean
}

export function KickPlayer({ channel, muted }: KickPlayerProps) {
	const safeChannel = channel.toLowerCase()
	const src = `https://player.kick.com/${encodeURIComponent(safeChannel)}?autoplay=true${muted ? '&muted=true' : ''}`
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
