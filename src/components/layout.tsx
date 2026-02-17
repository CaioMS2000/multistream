import type React from 'react'
import { UI_INSETS } from '@/config/ui-insets'

type LayoutProps = React.PropsWithChildren<{
	cols: number
	playerWidth: number
}>

export function Layout({ children, cols, playerWidth }: LayoutProps) {
	return (
		<div
			className="h-screen w-screen"
			style={{
				paddingTop: UI_INSETS.top,
				paddingRight: UI_INSETS.right,
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
