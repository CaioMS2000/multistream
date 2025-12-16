import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type React from 'react'

type TooltipButtonProps = React.ComponentProps<typeof Button> & {
	tooltip: string
}

export function TooltipButton({
	tooltip,
	children,
	...buttonProps
}: TooltipButtonProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button {...buttonProps}>{children}</Button>
				</TooltipTrigger>
				<TooltipContent>{tooltip}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
