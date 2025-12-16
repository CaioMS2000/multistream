import { useEffect, useRef, useState } from 'react'

type EditableChannelLabelProps = {
	channel: string
	onCommit: (next: string) => boolean
}

export function EditableChannelLabel({
	channel,
	onCommit,
}: EditableChannelLabelProps) {
	const [editing, setEditing] = useState(false)
	const [value, setValue] = useState(channel)
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (!editing) setValue(channel)
	}, [channel, editing])

	useEffect(() => {
		if (!editing) return
		const id = window.requestAnimationFrame(() => {
			inputRef.current?.focus()
			inputRef.current?.select()
		})
		return () => window.cancelAnimationFrame(id)
	}, [editing])

	const stopPointerPropagation = (event: React.SyntheticEvent) => {
		event.stopPropagation()
	}

	const commit = () => {
		const trimmed = value.trim()
		if (!trimmed) {
			setValue(channel)
			setEditing(false)
			return
		}
		const ok = onCommit(trimmed)
		if (!ok) {
			setValue(channel)
		}
		setEditing(false)
	}

	const cancel = () => {
		setValue(channel)
		setEditing(false)
	}

	if (editing) {
		return (
			<input
				ref={inputRef}
				value={value}
				onChange={e => setValue(e.target.value)}
				onBlur={commit}
				onKeyDown={e => {
					if (e.key === 'Enter') {
						e.preventDefault()
						commit()
					} else if (e.key === 'Escape') {
						e.preventDefault()
						cancel()
					}
				}}
				onMouseDown={stopPointerPropagation}
				onPointerDown={stopPointerPropagation}
				className="bg-transparent border-b border-white/60 text-white outline-none text-xs w-28 focus-visible:border-white"
			/>
		)
	}

	return (
		<button
			type="button"
			onClick={e => {
				e.stopPropagation()
				setEditing(true)
			}}
			onMouseDown={stopPointerPropagation}
			onPointerDown={stopPointerPropagation}
			className="underline decoration-dotted underline-offset-2 hover:decoration-solid focus-visible:outline-none focus-visible:underline focus-visible:decoration-solid"
		>
			{channel}
		</button>
	)
}
