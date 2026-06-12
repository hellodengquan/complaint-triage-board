import { Calendar, User, Phone, Tag, MoreHorizontal } from 'lucide-react'
import { CATEGORIES, PRIORITIES, STATUS } from '../data/mockData'
import { useState } from 'react'

export default function ComplaintCard({ complaint, onDragStart, onStatusChange, onPriorityChange }) {
  const [showActions, setShowActions] = useState(false)

  const category = CATEGORIES.find(c => c.id === complaint.category)
  const priority = PRIORITIES.find(p => p.id === complaint.priority)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('complaintId', complaint.id)
    onDragStart && onDragStart(complaint)
  }

  const handlePriorityChange = (newPriority) => {
    onPriorityChange && onPriorityChange(complaint.id, newPriority)
    setShowActions(false)
  }

  const nextStatus = () => {
    const statusOrder = ['pending', 'processing', 'resolved', 'closed']
    const currentIndex = statusOrder.indexOf(complaint.status)
    if (currentIndex < statusOrder.length - 1) {
      onStatusChange && onStatusChange(complaint.id, statusOrder[currentIndex + 1])
    }
  }

  return (
    <div
      className="complaint-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => setShowActions(!showActions)}
    >
      <div className="card-header">
        <div className="card-id">{complaint.id}</div>
        <div className="relative">
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
          >
            <MoreHorizontal size={16} />
          </button>
          {showActions && (
            <div className="action-menu" onClick={(e) => e.stopPropagation()}>
              <div className="menu-section">
                <div className="menu-title">修改状态</div>
                {STATUS.map(s => (
                  <button
                    key={s.id}
                    className={`menu-item ${complaint.status === s.id ? 'active' : ''}`}
                    onClick={() => {
                      onStatusChange && onStatusChange(complaint.id, s.id)
                      setShowActions(false)
                    }}
                  >
                    <span className="status-dot" style={{ background: s.color }}></span>
                    {s.name}
                  </button>
                ))}
              </div>
              <div className="menu-section">
                <div className="menu-title">修改优先级</div>
                {PRIORITIES.map(p => (
                  <button
                    key={p.id}
                    className={`menu-item ${complaint.priority === p.id ? 'active' : ''}`}
                    onClick={() => handlePriorityChange(p.id)}
                  >
                    <span className="priority-badge" style={{ background: p.color }}>!</span>
                    {p.name}
                  </button>
                ))}
              </div>
              <button className="menu-item quick-action" onClick={nextStatus}>
                推进到下一状态
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="card-title">{complaint.title}</h3>
      <p className="card-desc">{complaint.description}</p>

      <div className="card-meta">
        <span className="category-tag" style={{ background: category.color + '20', color: category.color }}>
          {category.name}
        </span>
        <span className="priority-badge" style={{ background: priority.color }} title={priority.name}>
          !
        </span>
      </div>

      <div className="card-tags">
        {complaint.tags.map((tag, idx) => (
          <span key={idx} className="tag-item">
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>

      <div className="card-footer">
        <div className="footer-item">
          <User size={12} />
          <span>{complaint.customer}</span>
        </div>
        <div className="footer-item">
          <Phone size={12} />
          <span>{complaint.phone}</span>
        </div>
        <div className="footer-item">
          <Calendar size={12} />
          <span>{complaint.createdAt.split(' ')[0]}</span>
        </div>
      </div>

      <div className="card-assignee">
        <span className="assignee-label">处理人：</span>
        <span className="assignee-name">{complaint.assignee}</span>
      </div>
    </div>
  )
}
