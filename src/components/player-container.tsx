import type { Stream } from '@/@types'
import { memo } from 'react'

type PlayerContainerProps = {
	stream: Stream
}

export const PlayerContainer = memo(function PlayerContainer({
	stream,
}: PlayerContainerProps) {
	return (
		<span className="text-gray-500 text-sm cursor-grab active:cursor-grabbing">
			{stream.platform}:{stream.username}
		</span>
	)
})
