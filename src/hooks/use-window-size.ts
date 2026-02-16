import { useEffect, useState } from 'react'

export function useWindowSize() {
	const [size, setSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	})

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout>

		const handleResize = () => {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				setSize({ width: window.innerWidth, height: window.innerHeight })
			}, 150)
		}

		window.addEventListener('resize', handleResize)
		return () => {
			clearTimeout(timeoutId)
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	useEffect(() => {
		console.log(`Window size updated: ${size.width} x ${size.height}`)
	}, [size])

	return {
		width: size.width,
		height: size.height,
	}
}
