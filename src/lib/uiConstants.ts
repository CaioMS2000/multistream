/**
 * Constantes de UI para manter consistência no design
 */

// Z-index layers
export const Z_INDEX = {
	/** Cards de stream e labels */
	STREAM_CARD: 10,
	/** Header e sidebar */
	HEADER: 20,
	/** Botões de toggle (header/history) */
	TOGGLE_BUTTONS: 30,
} as const

// Posicionamento de botões de toggle
export const TOGGLE_BUTTON_POS = {
	/** Posição do botão de toggle do header */
	HEADER: {
		top: 'top-2',
		right: 'right-2',
	},
	/** Posição do botão de toggle do histórico */
	HISTORY: {
		top: 'top-16',
		right: 'right-2',
	},
} as const

// Posicionamento de elementos nos cards de stream
export const STREAM_CARD_POS = {
	/** Label de plataforma/canal */
	LABEL: {
		top: 'top-1.5',
		left: 'left-2',
	},
	/** Botão de reload */
	RELOAD: {
		top: 'top-1.5',
		right: 'right-10',
	},
	/** Botão de remover */
	REMOVE: {
		top: 'top-1.5',
		right: 'right-1.5',
	},
} as const
