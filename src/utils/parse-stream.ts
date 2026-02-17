import type { Stream, STREAM_OPTION } from '@/@types'

export function parseStreams(raw: string): Stream[] {
	if (raw === '') return []
	return raw.split(',').map(s => {
		const [platform, username] = s.split(':')
		return { platform: platform as (typeof STREAM_OPTION)[number], username }
	})
}
