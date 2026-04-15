import { useMemo, useState } from 'react'
import { getStudyActivity } from '../utils/storage'

function getColor(count) {
  if (count === 0) return '#111111'  // subtle dark gray — visible on black
  if (count <= 2) return '#2D2B5E'  // very dark purple
  if (count <= 5) return '#534AB7'  // medium purple
  return '#7F77DD'                   // bright purple for most active days
}

function isTouchDevice() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
}

export default function StudyHeatmap() {
  const [tooltip, setTooltip] = useState(null)

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

  const TOOLTIP_WIDTH = 146
  const tooltipLeft = tooltip
    ? Math.max(8, Math.min(tooltip.x - 58, tooltip.containerWidth - TOOLTIP_WIDTH - 8))
    : 0
  const tooltipTop = tooltip ? Math.max(8, tooltip.y - 72) : 0

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

      <div className="heatmap-wrap" style={{ position: 'relative' }}>
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
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    background: getColor(day.count),
                    border: `0.5px solid ${day.count === 0 ? '#1a1a1a' : 'transparent'}`,
                    cursor: day.count > 0 ? 'pointer' : 'default',
                    transition: 'transform 0.1s',
                    position: 'relative',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.transform = 'scale(1.3)'
                    if (isTouchDevice()) {
                      return
                    }

                    const rect = event.currentTarget.getBoundingClientRect()
                    const parent = event.currentTarget.closest('.heatmap-wrap')
                    if (!parent) {
                      return
                    }

                    const parentRect = parent.getBoundingClientRect()
                    setTooltip({
                      date: day.date,
                      count: day.count,
                      x: rect.left - parentRect.left + 6,
                      y: rect.top - parentRect.top - 8,
                      containerWidth: parentRect.width,
                    })
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.transform = 'scale(1)'
                    setTooltip(null)
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {tooltip ? (
          <div
            style={{
              position: 'absolute',
              left: tooltipLeft,
              top: tooltipTop,
              width: TOOLTIP_WIDTH,
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 12,
              pointerEvents: 'none',
              zIndex: 50,
              boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
            }}
          >
            <div
              style={{
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                marginBottom: 3,
              }}
            >
              {new Date(tooltip.date).toLocaleDateString('en', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>

            <div
              style={{
                color: tooltip.count > 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                marginBottom: 6,
              }}
            >
              {tooltip.count > 0 ? `${tooltip.count} topic${tooltip.count !== 1 ? 's' : ''} done` : 'No activity'}
            </div>

            {tooltip.count > 0 ? (
              <>
                <div
                  style={{
                    height: 3,
                    borderRadius: 99,
                    background: 'var(--color-border-tertiary)',
                    marginBottom: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min((tooltip.count / 10) * 100, 100)}%`,
                      background: '#7F77DD',
                      borderRadius: 99,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#7F77DD',
                    fontWeight: 500,
                  }}
                >
                  +{tooltip.count * 10} XP earned
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Less</span>
        {['#111111', '#2D2B5E', '#534AB7', '#7F77DD'].map((c) => (
          <div
            key={c}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: c,
              border: c === '#111111' ? '0.5px solid #2a2a2a' : 'none',
            }}
          />
        ))}
        <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>More</span>
      </div>
    </div>
  )
}
