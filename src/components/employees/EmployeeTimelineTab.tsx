import { UserPlus, Award, UserCog, AlertTriangle, FileText, FileX, CalendarPlus, CalendarCheck, CalendarX } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface EventItem {
  id: string; type: string; title: string; description: string | null; createdAt: string
}
interface Props { events: EventItem[] }

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  HIRED: UserPlus,
  GRADE_CHANGED: Award,
  STATUS_CHANGED: UserCog,
  WARNING_ADDED: AlertTriangle,
  DOCUMENT_ADDED: FileText,
  DOCUMENT_REMOVED: FileX,
  LEAVE_REQUESTED: CalendarPlus,
  LEAVE_APPROVED: CalendarCheck,
  LEAVE_REJECTED: CalendarX,
}

export default function EmployeeTimelineTab({ events }: Props) {
  if (events.length === 0) {
    return <Card className="p-10 text-center"><p className="text-muted-foreground">Aucun événement pour l'instant</p></Card>
  }

  return (
    <div className="space-y-2">
      {events.map(ev => {
        const Icon = ICONS[ev.type] ?? UserCog
        return (
          <Card key={ev.id}>
            <CardContent className="p-3.5 flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{ev.title}</p>
                {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
              </div>
              <p className="text-[11px] text-muted-foreground shrink-0">{formatDate(ev.createdAt)}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
