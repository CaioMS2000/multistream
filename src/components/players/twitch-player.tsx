export type TwitchPlayerProps = {
	channel: string
}

export function TwitchPlayer({ channel }: TwitchPlayerProps) {
	return (
		<>
			<div className="bg-purple-500 w-full h-full">
				{/* <span className="text-white">{channel}</span> */}
			</div>
		</>
	)
}
