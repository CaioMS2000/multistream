/**
 * Tipos centralizados da aplicação MultiStream
 */

export type Platform = 'twitch' | 'kick'

export type Stream = {
	id: string
	platform: Platform
	channel: string
}

export type Rectangle = {
	x: number
	y: number
	w: number
	h: number
}

export type TileCustomization = Rectangle

export type CustomLayout = {
	[streamId: string]: TileCustomization
}

export type HistoryItem = {
	platform: Platform
	channel: string
	removedAt: number
}

export type TileSize = {
	w: number
	h: number
}
