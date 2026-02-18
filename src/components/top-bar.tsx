import { STREAM_OPTION } from '@/@types'
import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { useStreamsStore } from '@/store/streams'
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
import { Separator } from './ui/separator'

const formSchema = z.object({
	channel: z.string(),
	platform: z.string(),
	cols: z.number().min(1),
	muted: z.boolean(),
})

const routeApi = getRouteApi('/')

export function TopBar() {
	const streams = useStreamsStore(state => state.streams)
	const [open, setOpen] = useState(streams.length === 0)
	const search = routeApi.useSearch()
	const navigate = useNavigate()
	const addStream = useStreamsStore(state => state.addStream)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			channel: '',
			platform: '',
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
		const hasChannel = data.channel.trim().length > 0

		if (hasPlatform && hasChannel) {
			addStream({
				platform: data.platform as STREAM_OPTION,
				channel: data.channel.trim(),
			})
			form.reset({
				channel: '',
				cols: data.cols,
				muted: data.muted,
			})
		}
	}

	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className="absolute w-full z-10"
		>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="relative flex flex-col p-2">
					<div className="flex justify-end">
						<CollapsibleTrigger asChild className="absolute z-20">
							<Button>{open ? <ChevronUp /> : <ChevronDown />}</Button>
						</CollapsibleTrigger>
					</div>
					<CollapsibleContent>
						<div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
							<Controller
								control={form.control}
								name="platform"
								render={({ field }) => (
									<Select onValueChange={field.onChange} value={field.value}>
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
								name="channel"
								render={({ field }) => (
									<Input placeholder="Channel" className="w-64" {...field} />
								)}
							/>
							<Button type="submit">Adicionar</Button>
							<Separator orientation="vertical" className="h-5 mx-1" />
							<Controller
								control={form.control}
								name="cols"
								render={({ field }) => (
									<Input
										type="number"
										placeholder="Columns"
										className="w-12"
										{...field}
										onChange={e => field.onChange(Number(e.target.value))}
									/>
								)}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => form.setValue('muted', !muted)}
							>
								{muted ? <VolumeX /> : <Volume2 />}
							</Button>
						</div>
					</CollapsibleContent>
				</div>
			</form>
		</Collapsible>
	)
}
