import { api } from "@openteam/backend/convex/_generated/api"
import type { Id } from "@openteam/backend/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { PlusIcon } from "lucide-react"
import posthog from "posthog-js"
import * as React from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function NewChannel() {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="size-7" title="Create channel">
          <PlusIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent backdrop="opaque" className="p-2">
        <NewChannelForm onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

export function NewChannelForm(props: { onClose: () => void }) {
  const { teamId } = useParams<{ teamId: Id<"teams"> }>()
  const [newChannelName, setNewChannelName] = React.useState("")
  const createChannel = useMutation(api.channels.create)
  const navigate = useNavigate()

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!teamId) return
    if (!newChannelName.trim()) return

    try {
      const channelId = await createChannel({ name: newChannelName.toLowerCase().trim(), teamId })
      props.onClose()
      posthog.capture("channel_created", { teamId })
      await navigate(`/${teamId}/${channelId}`)
    } catch {
      toast.error("Failed to create channel")
    }
  }
  return (
    <form onSubmit={handleCreateChannel} className="flex flex-col gap-2">
      <Input
        type="text"
        placeholder="Channel name"
        value={newChannelName}
        onChange={(e) => setNewChannelName(e.target.value.toLowerCase())}
        autoFocus
      />
      <div className="flex justify-between gap-2">
        <Button type="button" size="sm" variant="outline" className="flex-1" onClick={props.onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" className="flex-1">
          Create
        </Button>
      </div>
    </form>
  )
}
