import { useMemo } from 'react'
import { LayoutDashboard, BarChart3, RefreshCw, Bell, Settings } from 'lucide-react'
import { initialComplaints, STATUS, PRIORITIES } from './data/mockData'
import usePersistentState from './hooks/usePersistentState'
import BoardColumn from './components/BoardColumn'
import FilterBar from './components/FilterBar'
import StatsPanel from './components/StatsPanel'
import './App.css'

function App() {
  const [complaints, setComplaints, resetComplaints] = usePersistentState('complaints', initialComplaints)
  const [searchQuery, setSearchQuery, resetSearchQuery] = usePersistentState('searchQuery', '')
  const [selectedCategory, setSelectedCategory, resetCategory] = usePersistentState('selectedCategory', 'all')
  const [selectedPriority, setSelectedPriority, resetPriority] = usePersistentState('selectedPriority', 'all')
  const [selectedAssignee, setSelectedAssignee, resetAssignee] = usePersistentState('selectedAssignee', 'all')
  const [activeView, setActiveView, resetActiveView] = usePersistentState('activeView', 'board')

  const assignees = useMemo(() => {
    return [...new Set(complaints.map(c => c.assignee))]
  }, [complaints])

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchId = c.id.toLowerCase().includes(query)
        const matchTitle = c.title.toLowerCase().includes(query)
        const matchCustomer = c.customer.toLowerCase().includes(query)
        const matchOrder = c.orderNo.toLowerCase().includes(query)
        const matchDesc = c.description.toLowerCase().includes(query)
        if (!matchId && !matchTitle && !matchCustomer && !matchOrder && !matchDesc) {
          return false
        }
      }
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false
      if (selectedPriority !== 'all' && c.priority !== selectedPriority) return false
      if (selectedAssignee !== 'all' && c.assignee !== selectedAssignee) return false
      return true
    })
  }, [complaints, searchQuery, selectedCategory, selectedPriority, selectedAssignee])

  const handleDrop = (complaintId, newStatus) => {
    setComplaints(prev => prev.map(c =>
      c.id === complaintId ? { ...c, status: newStatus } : c
    ))
  }

  const handleStatusChange = (complaintId, newStatus) => {
    setComplaints(prev => prev.map(c =>
      c.id === complaintId ? { ...c, status: newStatus } : c
    ))
  }

  const handlePriorityChange = (complaintId, newPriority) => {
    setComplaints(prev => prev.map(c =>
      c.id === complaintId ? { ...c, priority: newPriority } : c
    ))
  }

  const handleDragStart = () => {
  }

  const handleReset = () => {
    resetComplaints()
    resetSearchQuery()
    resetCategory()
    resetPriority()
    resetAssignee()
    resetActiveView()
  }

  const sortedByPriority = (list) => {
    return [...list].sort((a, b) => {
      const priorityA = PRIORITIES.find(p => p.id === a.priority)?.level || 0
      const priorityB = PRIORITIES.find(p => p.id === b.priority)?.level || 0
      return priorityB - priorityA
    })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <LayoutDashboard size={24} />
            <h1>客诉处理看板</h1>
          </div>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${activeView === 'board' ? 'active' : ''}`}
              onClick={() => setActiveView('board')}
            >
              <LayoutDashboard size={16} />
              <span>看板视图</span>
            </button>
            <button
              className={`toggle-btn ${activeView === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveView('stats')}
            >
              <BarChart3 size={16} />
              <span>统计视图</span>
            </button>
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={handleReset} title="重置数据">
            <RefreshCw size={18} />
          </button>
          <button className="header-btn" title="通知">
            <Bell size={18} />
            <span className="badge">3</span>
          </button>
          <button className="header-btn" title="设置">
            <Settings size={18} />
          </button>
          <div className="user-avatar">
            <span>管</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          selectedAssignee={selectedAssignee}
          onAssigneeChange={setSelectedAssignee}
          assignees={assignees}
        />

        {activeView === 'board' ? (
          <div className="board-container">
            {STATUS.map(status => (
              <BoardColumn
                key={status.id}
                status={status}
                complaints={sortedByPriority(filteredComplaints.filter(c => c.status === status.id))}
                onDrop={handleDrop}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        ) : (
          <StatsPanel complaints={filteredComplaints} />
        )}

        {filteredComplaints.length !== complaints.length && (
          <div className="filter-info">
            <span>筛选结果：{filteredComplaints.length} 条（共 {complaints.length} 条）</span>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
