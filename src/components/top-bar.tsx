import { STREAM_OPTION } from '@/@types'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

const routeApi = getRouteApi('/')

import { Button } from './ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from './ui/collapsible'
import { Input } from './ui/input'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select'

const formSchema = z.object({
	username: z.string(),
	platform: z.string(),
	cols: z.number().min(1),
	muted: z.boolean(),
})

export function TopBar() {
	const [open, setOpen] = useState(false)
	const search = routeApi.useSearch()
	const navigate = useNavigate()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			platform: undefined,
			cols: search.cols,
			muted: search.muted,
		},
	})

	const cols = form.watch('cols')
	const muted = form.watch('muted')

	useEffect(() => {
		if (!cols || cols < 1) return
		navigate({
			to: '/',
			search: { cols, muted, streams: search.streams },
		})
	}, [cols, muted, navigate, search.streams])

	function onSubmit(data: z.infer<typeof formSchema>) {
		const hasPlatform = STREAM_OPTION.includes(data.platform as STREAM_OPTION)
		const hasUsername = data.username.trim().length > 0

		if (hasPlatform && hasUsername) {
			const newStream = `${data.platform}:${data.username.trim()}`
			const streams = search.streams
				? `${search.streams},${newStream}`
				: newStream
			navigate({
				to: '/',
				search: {
					cols: data.cols,
					muted: data.muted,
					streams,
				},
			})
			form.reset({
				username: '',
				platform: '',
				cols: data.cols,
				muted: data.muted,
			})
		}
	}

	return (
		<Collapsible open={open} onOpenChange={setOpen} className="absolute w-full">
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="relative flex flex-col p-2">
					<div className="flex justify-end">
						<CollapsibleTrigger asChild className="absolute">
							<Button>{open ? <ChevronUp /> : <ChevronDown />}</Button>
						</CollapsibleTrigger>
					</div>
					<CollapsibleContent className="flex gap-2">
						<Controller
							control={form.control}
							name="platform"
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value || undefined}
								>
									<SelectTrigger className="w-45">
										<SelectValue placeholder="Platform" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{STREAM_OPTION.map(option => (
												<SelectItem key={option} value={option}>
													{option}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							)}
						/>
						<Controller
							control={form.control}
							name="username"
							render={({ field }) => (
								<Input placeholder="Username" className="w-64" {...field} />
							)}
						/>
						<Controller
							control={form.control}
							name="cols"
							render={({ field }) => (
								<Input
									type="number"
									placeholder="Columns"
									className="w-24"
									{...field}
									onChange={e => field.onChange(Number(e.target.value))}
								/>
							)}
						/>
						<label className="flex items-center gap-1 text-sm text-white">
							<input type="checkbox" {...form.register('muted')} />
							Muted
						</label>
						<Button type="submit">Adicionar</Button>
					</CollapsibleContent>
				</div>
			</form>
		</Collapsible>
	)
}
