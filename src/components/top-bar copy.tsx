import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { STREAM_OPTION } from '@/@types'
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from './ui/field'

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
	username: z.string().min(1),
	platform: z.enum(STREAM_OPTION),
})

function serializeStreams(streams: { platform: string; username: string }[]) {
	return streams.map(s => `${s.platform}:${s.username}`).join(',')
}

export function TopBar() {
	const [open, setOpen] = useState(false)
	const search = routeApi.useSearch()
	const navigate = useNavigate()
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

	function onSubmit(data: z.infer<typeof formSchema>) {
		const newStreams = [
			...search.streams,
			{ platform: data.platform, username: data.username },
		]
		navigate({
			to: '/',
			search: {
				cols: search.cols,
				muted: search.muted,
				streams: serializeStreams(newStreams),
			},
		})
		form.reset()
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
						<Select
							onValueChange={value =>
								form.setValue(
									'platform',
									value as z.infer<typeof formSchema>['platform']
								)
							}
							value={form.watch('platform')}
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
						<Input
							placeholder="Username"
							className="w-56"
							{...form.register('username')}
						/>
						<Button type="submit">Adicionar</Button>
					</CollapsibleContent>
				</div>
			</form>
		</Collapsible>
	)
}
