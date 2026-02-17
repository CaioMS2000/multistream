export const STREAM_OPTION = ['twitch', 'kick'] as const
export type STREAM_OPTION = (typeof STREAM_OPTION)[number]

export type Stream = {
	platform: STREAM_OPTION
	username: string
}
