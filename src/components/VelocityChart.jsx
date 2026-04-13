import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getStudyActivity } from '../utils/storage'

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
        }}
      >
        <div style={{ color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#7F77DD', fontWeight: 500 }}>
          {payload[0].value} topic{payload[0].value !== 1 ? 's' : ''}
        </div>
      </div>
    )
  }

  return null
}

export default function VelocityChart() {
  const activity = getStudyActivity()

  const data = []
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
    data.push({ date: label, topics: activity[key] || 0 })
  }

  const totalThisWeek = data.slice(7).reduce((sum, day) => sum + day.topics, 0)
  const totalLastWeek = data.slice(0, 7).reduce((sum, day) => sum + day.topics, 0)
  const trend = totalThisWeek >= totalLastWeek ? 'up' : 'down'
  const trendPct =
    totalLastWeek === 0 ? 100 : Math.round((Math.abs(totalThisWeek - totalLastWeek) / totalLastWeek) * 100)

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Study velocity</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            Topics completed per day - last 14 days
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: trend === 'up' ? '#639922' : '#D85A30' }}>
            {trend === 'up' ? '↑' : '↓'} {trendPct}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>vs last week</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7F77DD" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7F77DD" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="topics"
            stroke="#7F77DD"
            strokeWidth={2}
            fill="url(#purpleGrad)"
            dot={{ fill: '#7F77DD', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#7F77DD' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
