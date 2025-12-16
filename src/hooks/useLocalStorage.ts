import type { CustomLayout, Stream } from '@/types'

const STORAGE_KEY_PREFIX = 'multistream-custom-layout:'

/**
 * Gera uma chave baseada na assinatura dos streams (permite múltiplos layouts salvos)
 */
export function getLayoutStorageKey(streams: Stream[]): string {
	const streamIds = streams
		.map(s => `${s.platform[0]}:${s.channel}`)
		.sort()
		.join(',')
	return `${STORAGE_KEY_PREFIX}${streamIds}`
}

/**
 * Salva o layout customizado no localStorage
 */
export function saveCustomLayout(
	streams: Stream[],
	layout: CustomLayout
): void {
	const key = getLayoutStorageKey(streams)
	try {
		localStorage.setItem(key, JSON.stringify(layout))
	} catch (e) {
		console.warn('Failed to save custom layout:', e)
	}
}

/**
 * Carrega o layout customizado do localStorage
 * Retorna null se não encontrar ou se os IDs não baterem
 */
export function loadCustomLayout(streams: Stream[]): CustomLayout | null {
	const key = getLayoutStorageKey(streams)
	try {
		const stored = localStorage.getItem(key)
		if (!stored) return null

		const parsed = JSON.parse(stored) as CustomLayout

		// Validar que os IDs ainda existem
		const validIds = new Set(streams.map(s => s.id))
		const filtered: CustomLayout = {}

		for (const [id, customization] of Object.entries(parsed)) {
			if (validIds.has(id)) {
				filtered[id] = customization
			}
		}

		return Object.keys(filtered).length > 0 ? filtered : null
	} catch (e) {
		console.warn('Failed to load custom layout:', e)
		return null
	}
}

/**
 * Remove o layout customizado do localStorage
 */
export function clearCustomLayout(streams: Stream[]): void {
	const key = getLayoutStorageKey(streams)
	try {
		localStorage.removeItem(key)
	} catch (e) {
		console.warn('Failed to clear custom layout:', e)
	}
}
