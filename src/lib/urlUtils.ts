import type { Stream, Platform } from '@/types'

export function normalizeChannel(input: string): string {
	const v = input.trim()
	if (!v) return ''
	// Accept raw handle or URLs from Twitch/Kick
	try {
		const url = new URL(v)
		const host = url.hostname.replace(/^www\./, '')
		if (host.includes('twitch.tv'))
			return url.pathname.replace(/\/+/, '').split('/')[0]
		if (host.includes('kick.com'))
			return url.pathname.replace(/\/+/, '').split('/')[0]
	} catch {
		// not a URL
	}
	return v.replace(/^@/, '').split(/[/?#]/)[0]
}

export function parseInitialLayout(): {
	streams: Stream[]
	cols: number
	muted: boolean
} {
	const url = new URL(window.location.href)
	const ordered = (url.searchParams.get('streams') || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	const fromOrdered: Stream[] = []
	const mk =
		(platform: Platform) =>
		(name: string, idx: number): Stream => ({
			id: `${platform}:${name}:${idx}:${Math.random().toString(36).slice(2, 7)}`,
			platform,
			channel: name,
		})
	for (let i = 0; i < ordered.length; i++) {
		const token = ordered[i]
		const [pfx, name] = token.split(':')
		if (!name) continue
		const plat =
			pfx === 't' || pfx === 'twitch'
				? 'twitch'
				: pfx === 'k' || pfx === 'kick'
					? 'kick'
					: null
		if (!plat) continue
		fromOrdered.push(mk(plat)(name, i))
	}

	const twitch = (url.searchParams.get('twitch') || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	const kick = (url.searchParams.get('kick') || '')
		.split(',')
		.map(s => s.trim())
		.filter(Boolean)
	const colsParam = Number.parseInt(url.searchParams.get('cols') || '')
	const cols = Number.isFinite(colsParam)
		? Math.min(Math.max(colsParam, 1), 4)
		: 2
	const muted = url.searchParams.has('muted')

	return {
		streams:
			fromOrdered.length > 0
				? fromOrdered
				: [...twitch.map(mk('twitch')), ...kick.map(mk('kick'))],
		cols,
		muted,
	}
}

export function toUrlParams(
	streams: Stream[],
	cols: number,
	muted: boolean
): string {
	const url = new URL(window.location.href)
	// Ordered list param
	const ordered = streams.map(
		s => `${s.platform === 'twitch' ? 't' : 'k'}:${s.channel}`
	)
	if (ordered.length) url.searchParams.set('streams', ordered.join(','))
	else url.searchParams.delete('streams')
	// Only use canonical 'streams' param; remove legacy ones
	url.searchParams.delete('twitch')
	url.searchParams.delete('kick')
	// Layout params
	if (cols !== 2) url.searchParams.set('cols', String(cols))
	else url.searchParams.delete('cols')
	if (muted) url.searchParams.set('muted', '')
	else url.searchParams.delete('muted')
	// Serialize with bare flag (no '=') for `muted`
	let href = url.toString()
	href = href.replace(/([?&])muted=/g, '$1muted')
	return href
}
