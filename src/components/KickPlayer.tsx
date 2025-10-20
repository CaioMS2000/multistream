type Props = {
	channel: string
	muted: boolean
}

export default function KickPlayer({ channel, muted }: Props) {
	// Kick parece exigir o slug do canal em minúsculas
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
