import { useEffect, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'

declare global {
	interface Window {
		Twitch?: any
	}
}

export type TwitchPlayerProps = {
	channel: string
}

const parent = window.location.hostname
const routeApi = getRouteApi('/')

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

export function TwitchPlayer({ channel }: TwitchPlayerProps) {
	const { muted } = routeApi.useSearch()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const playerRef = useRef<any>(null)

	useEffect(() => {
		let cancelled = false
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
		if (!p) return
		try {
			p.setMuted(muted)
			p.setVolume(muted ? 0 : 0.5)
		} catch {}
	}, [muted])

	return <div ref={containerRef} className="w-full h-full" />
}
