export type KickPlayerProps = {
	channel: string
}

export function KickPlayer({ channel }: KickPlayerProps) {
	return (
		<>
			<div className="bg-green-500 w-full h-full">
				{/* <span className="text-white">{channel}</span> */}
			</div>
		</>
	)
}
