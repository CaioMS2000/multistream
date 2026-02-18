import type { STREAM_OPTION, Stream } from '@/@types'

export function parseStreams(raw: string): Stream[] {
	if (raw === '') return []
	return raw.split(',').map(s => {
		const [platform, channel] = s.split(':')
		return { platform: platform as (typeof STREAM_OPTION)[number], channel }
	})
}
