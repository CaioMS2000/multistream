export type KickPlayerProps = {
	username: string
}

export function KickPlayer({ username }: KickPlayerProps) {
	return (
		<>
			<div className="bg-green-500 w-full h-full">
				<span className="text-white">{username}</span>
			</div>
		</>
	)
}
