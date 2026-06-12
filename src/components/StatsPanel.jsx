import { AlertTriangle, Clock, CheckCircle, TrendingUp, Users } from 'lucide-react'
import { CATEGORIES } from '../data/mockData'

export default function StatsPanel({ complaints }) {
  const totalCount = complaints.length
  const pendingCount = complaints.filter(c => c.status === 'pending').length
  const processingCount = complaints.filter(c => c.status === 'processing').length
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length
  const urgentCount = complaints.filter(c => c.priority === 'urgent').length
  const highCount = complaints.filter(c => c.priority === 'high').length

  const stats = [
    { label: '总客诉', value: totalCount, icon: TrendingUp, color: '#6366f1' },
    { label: '待处理', value: pendingCount, icon: Clock, color: '#f59e0b' },
    { label: '处理中', value: processingCount, icon: AlertTriangle, color: '#3b82f6' },
    { label: '已解决', value: resolvedCount, icon: CheckCircle, color: '#10b981' },
    { label: '紧急', value: urgentCount, icon: AlertTriangle, color: '#ef4444' },
    { label: '高优', value: highCount, icon: AlertTriangle, color: '#f97316' },
  ]

  const categoryStats = CATEGORIES.map(cat => ({
    ...cat,
    count: complaints.filter(c => c.category === cat.id).length
  }))

  const assigneeStats = [...new Set(complaints.map(c => c.assignee))].map(name => ({
    name,
    count: complaints.filter(c => c.assignee === name).length,
    pending: complaints.filter(c => c.assignee === name && c.status === 'pending').length
  })).sort((a, b) => b.count - a.count)

  const resolveRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ background: stat.color + '20', color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-details">
        <div className="detail-card">
          <h4 className="detail-title">分类分布</h4>
          <div className="category-bars">
            {categoryStats.map(cat => (
              <div key={cat.id} className="category-bar-row">
                <div className="category-bar-label">
                  <span className="bar-dot" style={{ background: cat.color }}></span>
                  <span>{cat.name}</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{
                      width: `${totalCount > 0 ? (cat.count / totalCount) * 100 : 0}%`,
                      background: cat.color
                    }}
                  ></div>
                </div>
                <span className="category-bar-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-card">
          <h4 className="detail-title">解决率</h4>
          <div className="resolve-rate">
            <div className="rate-circle">
              <svg className="rate-svg" viewBox="0 0 100 100">
                <circle
                  className="rate-bg"
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  className="rate-fill"
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${resolveRate * 2.51} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="rate-text">
                <span className="rate-value">{resolveRate}%</span>
                <span className="rate-label">已解决</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h4 className="detail-title">处理人负载</h4>
          <div className="assignee-list">
            {assigneeStats.map((a, idx) => (
              <div key={idx} className="assignee-row">
                <div className="assignee-avatar">
                  <Users size={14} />
                </div>
                <span className="assignee-name">{a.name}</span>
                <div className="assignee-stats">
                  <span className="assignee-total">{a.count} 条</span>
                  {a.pending > 0 && (
                    <span className="assignee-pending">{a.pending} 待处理</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
