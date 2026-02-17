import { useGridLayout } from '@/hooks/use-grid-layout'
import type React from 'react'

type LayoutProps = React.PropsWithChildren

export function Layout({ children }: LayoutProps) {
	const colsCount = 2
	const { cols, playerWidth } = useGridLayout(colsCount)

	return (
		<div
			className="h-screen w-screen"
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${cols}, ${playerWidth}px)`,
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			{children}
		</div>
	)
}
