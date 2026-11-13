export class SearchEngine {
	private static normalize(text: string): string {
		return text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase()
	}

	private static tokenize(text: string) {
		return SearchEngine.normalize(text)
			.split(/[^\p{L}\p{N}]+/u)
			.filter(Boolean)
	}

	// Levenshtein com duas linhas e corte antecipado (maxDistance)
	private static editDistance(
		a: string,
		b: string,
		maxDistance: number
	): number {
		if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

		let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
		for (let i = 1; i <= a.length; i++) {
			const curr = [i]
			let rowMin = i
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1
				curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost)
				rowMin = Math.min(rowMin, curr[j]!)
			}
			if (rowMin > maxDistance) return maxDistance + 1
			prev = curr
		}
		return prev[b.length]!
	}

	// Quantos erros tolerar depende do tamanho da palavra
	private static maxTypos(term: string): number {
		if (term.length <= 3) return 0
		if (term.length <= 7) return 1
		return 2
	}

	// Melhor pontuação de um termo contra os tokens de um item
	private static scoreTerm(term: string, tokens: string[]): number {
		let best = 0
		for (const token of tokens) {
			if (token === term) return 10
			if (token.startsWith(term)) best = Math.max(best, 6)
			else {
				const max = SearchEngine.maxTypos(term)
				if (max > 0) {
					const d = SearchEngine.editDistance(term, token, max)
					if (d <= max) best = Math.max(best, 4 - d) // 3 ou 2
				}
			}
		}
		return best
	}

	static search(items: readonly string[], query: string): string[] {
		const terms = SearchEngine.tokenize(query)
		if (terms.length === 0) return []

		return items
			.map(item => {
				const tokens = SearchEngine.tokenize(item)
				const scores = terms.map(t => SearchEngine.scoreTerm(t, tokens))
				// AND: todos os termos precisam casar em algum nível
				const score = scores.every(s => s > 0)
					? scores.reduce((a, b) => a + b, 0)
					: 0
				return { item, score }
			})
			.filter(r => r.score > 0)
			.sort((a, b) => b.score - a.score)
			.map(r => r.item)
	}
}
