export type TwitchPlayerProps = {
	username: string
}

export function TwitchPlayer({ username }: TwitchPlayerProps) {
	return (
		<>
			<div className="bg-purple-500 w-full h-full">
				<span className="text-white">{username}</span>
			</div>
		</>
	)
}
