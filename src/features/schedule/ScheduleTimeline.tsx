import type { ScheduleEvent } from './types'

interface ScheduleTimelineProps {
  events: readonly ScheduleEvent[]
  onDateChange: (id: string, field: 'startDate' | 'endDate', date: string) => void
}

export function ScheduleTimeline({ events, onDateChange }: ScheduleTimelineProps) {
  if (events.length === 0) {
    return <p className="schedule-empty">当前没有可展示的建议时间窗口。</p>
  }

  return (
    <ol className="schedule-timeline">
      {events.map((event) => (
        <li key={event.id} className="schedule-event">
          <div>
            <p className="schedule-event-category">{event.category === 'vaccine' ? '疫苗复核' : '驱虫复核'}</p>
            <h3>{event.label}</h3>
            <p>建议窗口：{event.startDate} 至 {event.endDate}；须由执业兽医确认。</p>
          </div>
          <label>
            窗口开始（可编辑）
            <input type="date" value={event.startDate} onChange={(change) => onDateChange(event.id, 'startDate', change.currentTarget.value)} />
          </label>
          <label>
            窗口结束（可编辑）
            <input type="date" value={event.endDate} onChange={(change) => onDateChange(event.id, 'endDate', change.currentTarget.value)} />
          </label>
        </li>
      ))}
    </ol>
  )
}
