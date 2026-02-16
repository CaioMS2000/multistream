import { PlayerContainer } from '@/components/player-container'
import { useGridLayout } from '@/hooks/use-grid-layout'
import { useWindowSize } from '@/hooks/use-window-size'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: Index,
})

function Index() {
	const { width: screenWidth, height: screenHeight } = useWindowSize()
	const playersCount = 4
	const { cols, rows, playerWidth, playerHeight } = useGridLayout(playersCount)
	return (
		<>
			<div className="max-w-screen max-h-screen w-screen h-screen">
				<PlayerContainer />
			</div>
		</>
	)
}
