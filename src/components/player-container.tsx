import { memo } from 'react'

type PlayerContainerProps = {
	id: string
	width: number
	height: number
}

export const PlayerContainer = memo(function PlayerContainer({
	id,
	width,
	height,
}: PlayerContainerProps) {
	return (
		<div
			style={{ width, height }}
			className="border border-gray-500 rounded-lg bg-black flex items-center justify-center"
		>
			<span className="text-gray-500 text-sm">{id.slice(0, 8)}</span>
		</div>
	)
})
