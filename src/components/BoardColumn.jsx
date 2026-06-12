import { useState } from 'react'
import ComplaintCard from './ComplaintCard'

export default function BoardColumn({ 
  status, 
  complaints, 
  onDrop, 
  onStatusChange, 
  onPriorityChange,
  onDragStart 
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const complaintId = e.dataTransfer.getData('complaintId')
    if (complaintId) {
      onDrop && onDrop(complaintId, status.id)
    }
  }

  const urgentCount = complaints.filter(c => c.priority === 'urgent').length
  const highCount = complaints.filter(c => c.priority === 'high').length

  return (
    <div
      className={`board-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-wrapper">
          <span className="column-status-dot" style={{ background: status.color }}></span>
          <h3 className="column-title">{status.name}</h3>
          <span className="column-count">{complaints.length}</span>
        </div>
        <div className="column-stats">
          {urgentCount > 0 && (
            <span className="stat-badge urgent">
              !{urgentCount}
            </span>
          )}
          {highCount > 0 && (
            <span className="stat-badge high">
              ↑{highCount}
            </span>
          )}
        </div>
      </div>

      <div className="column-content">
        {complaints.length === 0 ? (
          <div className="empty-column">
            <p>暂无客诉</p>
            <span>拖拽卡片到此处</span>
          </div>
        ) : (
          complaints.map(complaint => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onDragStart={onDragStart}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
            />
          ))
        )}
      </div>
    </div>
  )
}
