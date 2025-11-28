import { useEffect, useState } from 'react'

const HISTORY_STORAGE_KEY = 'multistream-history'
const MAX_HISTORY_ITEMS = 50

export type Platform = 'twitch' | 'kick'

export type HistoryItem = {
	platform: Platform
	channel: string
	removedAt: number
}

// Carregar histórico do localStorage
function loadHistory(): HistoryItem[] {
	try {
		const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
		if (!stored) return []
		const parsed = JSON.parse(stored) as HistoryItem[]
		return parsed
	} catch (e) {
		console.warn('Failed to load history:', e)
		return []
	}
}

// Salvar histórico no localStorage
function saveHistory(history: HistoryItem[]): void {
	try {
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
	} catch (e) {
		console.warn('Failed to save history:', e)
	}
}

// Hook customizado
export function useStreamHistory() {
	const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory())

	// Auto-save quando history muda
	useEffect(() => {
		saveHistory(history)
	}, [history])

	// Adicionar item ao histórico (mantém limite de 50)
	const addToHistory = (platform: Platform, channel: string) => {
		setHistory(prev => {
			const newItem: HistoryItem = {
				platform,
				channel,
				removedAt: Date.now(),
			}
			// Adiciona no início, remove do final se exceder limite
			return [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS)
		})
	}

	// Remover item específico do histórico
	const removeFromHistory = (index: number) => {
		setHistory(prev => prev.filter((_, i) => i !== index))
	}

	// Limpar todo o histórico
	const clearHistory = () => {
		setHistory([])
		localStorage.removeItem(HISTORY_STORAGE_KEY)
	}

	return {
		history,
		addToHistory,
		removeFromHistory,
		clearHistory,
	}
}
