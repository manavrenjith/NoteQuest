import { useMemo } from 'react'
import { getStudyActivity } from '../utils/storage'

function getColor(count) {
  if (count === 0) return 'var(--color-background-secondary)'
  if (count <= 2) return '#AFA9EC'
  if (count <= 5) return '#7F77DD'
  return '#534AB7'
}

export default function StudyHeatmap() {
  const { weeks, totalDaysStudied, totalTopics, currentStreak } = useMemo(() => {
    const activity = getStudyActivity()

    const dayItems = []
    for (let i = 83; i >= 0; i -= 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dayItems.push({
        date: key,
        count: activity[key] || 0,
        dayOfWeek: d.getDay(),
      })
    }

    const weekColumns = []
    for (let i = 0; i < dayItems.length; i += 7) {
      weekColumns.push(dayItems.slice(i, i + 7))
    }

    const studiedDays = dayItems.filter((day) => day.count > 0).length
    const topics = dayItems.reduce((sum, day) => sum + day.count, 0)

    let streak = 0
    for (let i = dayItems.length - 1; i >= 0; i -= 1) {
      if (dayItems[i].count > 0) streak += 1
      else break
    }

    return {
      weeks: weekColumns,
      totalDaysStudied: studiedDays,
      totalTopics: topics,
      currentStreak: streak,
    }
  }, [])

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Study activity</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Days studied', value: totalDaysStudied },
            { label: 'Topics done', value: totalTopics },
            { label: 'Current streak', value: `${currentStreak}d` },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 24 }}>
        {weeks.map((week, weekIndex) => (
          <div
            key={week[0]?.date || weekIndex}
            style={{ width: 12, fontSize: 9, color: 'var(--color-text-secondary)', textAlign: 'center' }}
          >
            {weekIndex % 4 === 0 && week[0]?.date
              ? new Date(week[0].date).toLocaleDateString('en', { month: 'short' })
              : ''}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
            <div
              key={label + index}
              style={{
                width: 12,
                height: 12,
                fontSize: 9,
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {index % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={week[0]?.date || weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} topic${day.count !== 1 ? 's' : ''}`}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  background: getColor(day.count),
                  border: '0.5px solid var(--color-border-tertiary)',
                  cursor: day.count > 0 ? 'pointer' : 'default',
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = 'scale(1.3)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'scale(1)'
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Less</span>
        {['var(--color-background-secondary)', '#AFA9EC', '#7F77DD', '#534AB7'].map((color) => (
          <div
            key={color}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: color,
              border: '0.5px solid var(--color-border-tertiary)',
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>More</span>
      </div>
    </div>
  )
}
