import { useEffect, useRef } from 'react'

declare global {
	interface Window {
		Twitch?: any
	}
}

export type TwitchPlayerProps = {
	channel: string
	muted: boolean
}

const parent = window.location.hostname

function loadScript(): Promise<any> {
	if (window.Twitch && window.Twitch.Player)
		return Promise.resolve(window.Twitch)
	return new Promise((resolve, reject) => {
		const id = 'twitch-embed-script'
		if (document.getElementById(id)) {
			const check = () =>
				window.Twitch && window.Twitch.Player
					? resolve(window.Twitch)
					: setTimeout(check, 50)
			check()
			return
		}
		const s = document.createElement('script')
		s.id = id
		s.src = 'https://player.twitch.tv/js/embed/v1.js'
		s.async = true
		s.onload = () => {
			const check = () =>
				window.Twitch && window.Twitch.Player
					? resolve(window.Twitch)
					: setTimeout(check, 50)
			check()
		}
		s.onerror = reject
		document.head.appendChild(s)
	})
}

export function TwitchPlayer({ channel, muted }: TwitchPlayerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const playerRef = useRef<any>(null)

	useEffect(() => {
		let cancelled = false
		console.log(
			`[TwitchPlayer:${channel}] mount effect; initial muted=${muted}`
		)
		loadScript().then(Twitch => {
			if (cancelled || !containerRef.current) return
			const opts = {
				width: '100%',
				height: '100%',
				channel,
				parent: [parent],
				autoplay: true,
				muted,
			}
			const player = new Twitch.Player(containerRef.current, opts)
			playerRef.current = player
			const P = Twitch.Player
			try {
				player.addEventListener(P.READY, () => {
					console.log(
						`[TwitchPlayer:${channel}] READY fired; applying muted=${muted} (from mount closure)`
					)
					try {
						player.setMuted(muted)
						player.setVolume(muted ? 0 : 0.5)
					} catch {}
				})
			} catch {}
		})

		return () => {
			cancelled = true
			try {
				if (
					playerRef.current &&
					typeof playerRef.current.destroy === 'function'
				) {
					playerRef.current.destroy()
				}
			} catch {}
			playerRef.current = null
		}
	}, [channel])

	useEffect(() => {
		const p = playerRef.current
		console.log(
			`[TwitchPlayer:${channel}] muted prop changed; playerRef ready=${!!p}; calling setMuted(${muted})`
		)
		if (!p) return
		try {
			p.setMuted(muted)
			p.setVolume(muted ? 0 : 0.5)
		} catch {}
	}, [muted, channel])

	return <div ref={containerRef} className="w-full h-full" />
}
