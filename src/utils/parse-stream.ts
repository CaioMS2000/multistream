import type { STREAM_OPTION, Stream } from '@/@types'

export function parseStreams(raw: string): Stream[] {
	if (raw === '') return []
	return raw.split(',').map((s, index) => {
		const [streamPart, slotStr] = s.split('@')
		const [platform, channel] = streamPart.split(':')
		return {
			platform: platform as (typeof STREAM_OPTION)[number],
			channel,
			slot: slotStr !== undefined ? Number(slotStr) : index,
		}
	})
}
