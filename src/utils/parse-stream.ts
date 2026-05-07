import type { STREAM_OPTION, Stream } from '@/@types'

export function parseStreams(raw: string): Stream[] {
	if (raw === '') return []
	const seen = new Set<string>()
	const result: Stream[] = []
	for (const s of raw.split(',')) {
		const [platform, channel] = s.split(':')
		const id = `${platform}:${channel}`
		if (seen.has(id)) continue
		seen.add(id)
		result.push({
			platform: platform as (typeof STREAM_OPTION)[number],
			channel,
		})
	}
	return result
}
