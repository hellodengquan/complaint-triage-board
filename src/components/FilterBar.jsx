import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, PRIORITIES } from '../data/mockData'
import { useState } from 'react'

export default function FilterBar({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  selectedPriority, 
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  assignees
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const clearFilters = () => {
    onSearchChange('')
    onCategoryChange('all')
    onPriorityChange('all')
    onAssigneeChange('all')
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedAssignee !== 'all'

  return (
    <div className="filter-bar">
      <div className="filter-main">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="搜索客诉编号、标题、客户..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => onSearchChange('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <div className="filter-label">
            <Filter size={16} />
            <span>分类</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">全部分类</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">
            <span style={{ color: '#ef4444' }}>!</span>
            <span>优先级</span>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">全部优先级</option>
            {PRIORITIES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <button
          className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal size={16} />
          <span>高级筛选</span>
        </button>

        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={clearFilters}>
            <X size={14} />
            <span>清除筛选</span>
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="filter-advanced">
          <div className="filter-group">
            <div className="filter-label">
              <span>处理人</span>
            </div>
            <select
              value={selectedAssignee}
              onChange={(e) => onAssigneeChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部处理人</option>
              {assignees.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="priority-quick-filters">
            <span className="quick-label">快速筛选：</span>
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                className={`priority-filter-btn ${selectedPriority === p.id ? 'active' : ''}`}
                style={{ borderColor: p.color, color: selectedPriority === p.id ? '#fff' : p.color }}
                onClick={() => onPriorityChange(selectedPriority === p.id ? 'all' : p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
