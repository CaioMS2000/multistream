import { useEffect, useRef, useState } from 'react'

export type KickPlayerProps = {
	channel: string
	muted: boolean
}

const t = () => `t=${performance.now().toFixed(0)}ms`

const FIXED_W = 1280
const FIXED_H = 720

export function KickPlayer({ channel, muted }: KickPlayerProps) {
	const safeChannel = channel.toLowerCase()
	const src = `https://player.kick.com/${encodeURIComponent(safeChannel)}?autoplay=true${muted ? '&muted=true' : ''}`
	console.log(`${t()} [KickPlayer:${channel}] src recomputed; muted=${muted}`)

	const wrapperRef = useRef<HTMLDivElement | null>(null)
	const iframeRef = useRef<HTMLIFrameElement | null>(null)
	const [scale, setScale] = useState(1)

	useEffect(() => {
		console.log(`${t()} [KickPlayer:${channel}] mount`)
		return () => console.log(`${t()} [KickPlayer:${channel}] unmount`)
	}, [channel])

	useEffect(() => {
		const wrapper = wrapperRef.current
		if (!wrapper) return
		const ro = new ResizeObserver(() => {
			const { width, height } = wrapper.getBoundingClientRect()
			setScale(Math.min(width / FIXED_W, height / FIXED_H))
		})
		ro.observe(wrapper)
		return () => ro.disconnect()
	}, [])

	useEffect(() => {
		const iframe = iframeRef.current
		if (!iframe) return

		const ro = new ResizeObserver(entries => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect
				console.log(
					`${t()} [KickPlayer:${channel}] resize: ${width.toFixed(0)}x${height.toFixed(0)}`
				)
			}
		})
		ro.observe(iframe)

		const io = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					console.log(
						`${t()} [KickPlayer:${channel}] intersection: ratio=${entry.intersectionRatio.toFixed(2)} visible=${entry.isIntersecting}`
					)
				}
			},
			{ threshold: [0, 0.5, 1] }
		)
		io.observe(iframe)

		const mo = new MutationObserver(mutations => {
			for (const m of mutations) {
				console.log(
					`${t()} [KickPlayer:${channel}] mutation: type=${m.type} attr=${m.attributeName ?? '-'}`
				)
			}
		})
		mo.observe(iframe, {
			attributes: true,
			childList: true,
			subtree: false,
		})

		return () => {
			ro.disconnect()
			io.disconnect()
			mo.disconnect()
		}
	}, [channel])

	return (
		<div ref={wrapperRef} className="relative w-full h-full overflow-hidden">
			<iframe
				ref={iframeRef}
				src={src}
				allow="autoplay; encrypted-media; picture-in-picture"
				allowFullScreen
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: `${FIXED_W}px`,
					height: `${FIXED_H}px`,
					transformOrigin: 'top left',
					transform: `scale(${scale})`,
					border: 0,
				}}
				className="block"
				title={`Kick:${channel}`}
			/>
		</div>
	)
}
