import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePersistentState, {
  STORAGE_VERSION,
  STORAGE_PREFIX,
  getStorageKey,
  checkVersion,
  clearAllData,
  readFromStorage,
  writeToStorage,
  removeFromStorage,
} from '../hooks/usePersistentState'

describe('localStorage 持久化工具函数', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getStorageKey', () => {
    it('应该生成带版本号前缀的存储键', () => {
      const key = getStorageKey('test-key')
      expect(key).toBe(`${STORAGE_PREFIX}:v${STORAGE_VERSION}:test-key`)
    })
  })

  describe('checkVersion', () => {
    it('首次访问时应该写入版本号并返回 true', () => {
      const result = checkVersion()
      expect(result).toBe(true)
      expect(localStorage.getItem(`${STORAGE_PREFIX}:version`)).toBe(STORAGE_VERSION)
    })

    it('版本号匹配时应该返回 true 且不清理数据', () => {
      localStorage.setItem(`${STORAGE_PREFIX}:version`, STORAGE_VERSION)
      const testKey = getStorageKey('test')
      localStorage.setItem(testKey, JSON.stringify({ data: 'old' }))

      const result = checkVersion()
      expect(result).toBe(true)
      expect(localStorage.getItem(testKey)).toBe(JSON.stringify({ data: 'old' }))
    })

    it('版本号不匹配时应该打印 console.warn 并清空旧数据', () => {
      const oldVersion = '0.0.1'
      localStorage.setItem(`${STORAGE_PREFIX}:version`, oldVersion)
      const testKey = getStorageKey('test')
      localStorage.setItem(testKey, JSON.stringify({ data: 'should-be-cleared' }))

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = checkVersion()

      expect(result).toBe(false)
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`版本不匹配：存储版本 ${oldVersion}`)
      )
      expect(localStorage.getItem(testKey)).toBeNull()
      expect(localStorage.getItem(`${STORAGE_PREFIX}:version`)).toBe(STORAGE_VERSION)

      warnSpy.mockRestore()
    })
  })

  describe('clearAllData', () => {
    it('应该只清理 complaint-board 前缀的所有数据', () => {
      localStorage.setItem(`${STORAGE_PREFIX}:v${STORAGE_VERSION}:a`, '1')
      localStorage.setItem(`${STORAGE_PREFIX}:v${STORAGE_VERSION}:b`, '2')
      localStorage.setItem('other-prefix:data', '3')

      clearAllData()

      expect(localStorage.getItem(`${STORAGE_PREFIX}:v${STORAGE_VERSION}:a`)).toBeNull()
      expect(localStorage.getItem(`${STORAGE_PREFIX}:v${STORAGE_VERSION}:b`)).toBeNull()
      expect(localStorage.getItem('other-prefix:data')).toBe('3')
    })
  })

  describe('readFromStorage / writeToStorage / removeFromStorage', () => {
    it('写入后应该能读取到相同数据', () => {
      const data = { id: 1, name: '测试' }
      writeToStorage('my-key', data)
      const result = readFromStorage('my-key', null)
      expect(result).toEqual(data)
    })

    it('读取不存在的键时应该返回默认值', () => {
      const result = readFromStorage('non-existent', 'default')
      expect(result).toBe('default')
    })

    it('删除后应该返回默认值', () => {
      writeToStorage('temp-key', { value: 'temp' })
      removeFromStorage('temp-key')
      const result = readFromStorage('temp-key', 'deleted')
      expect(result).toBe('deleted')
    })

    it('读取损坏的 JSON 应该返回默认值并打印错误', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem(getStorageKey('broken'), 'not-json{')
      const result = readFromStorage('broken', 'fallback')
      expect(result).toBe('fallback')
      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })
})

describe('usePersistentState Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('新增数据后刷新页面（重新挂载）数据仍存在', () => {
    const { result, unmount } = renderHook(() =>
      usePersistentState('complaints', [{ id: 'C001', title: '初始' }])
    )

    act(() => {
      result.current[1]((prev) => [
        ...prev,
        { id: 'C999', title: '新增客诉', status: 'pending' },
      ])
    })

    expect(result.current[0]).toHaveLength(2)
    expect(result.current[0][1].title).toBe('新增客诉')

    unmount()

    const { result: result2 } = renderHook(() =>
      usePersistentState('complaints', [])
    )

    expect(result2.current[0]).toHaveLength(2)
    expect(result2.current[0][1].title).toBe('新增客诉')
    expect(result2.current[0][1].status).toBe('pending')
  })

  it('状态切换后刷新页面信息保留', () => {
    const initialData = [
      { id: 'C001', title: '商品破损', status: 'pending' },
      { id: 'C002', title: '退款问题', status: 'processing' },
    ]

    const { result, unmount } = renderHook(() =>
      usePersistentState('complaints', initialData)
    )

    act(() => {
      result.current[1]((prev) =>
        prev.map((c) =>
          c.id === 'C001' ? { ...c, status: 'resolved' } : c
        )
      )
    })

    expect(result.current[0][0].status).toBe('resolved')
    expect(result.current[0][1].status).toBe('processing')

    unmount()

    const { result: result2 } = renderHook(() =>
      usePersistentState('complaints', [])
    )

    expect(result2.current[0][0].status).toBe('resolved')
    expect(result2.current[0][1].status).toBe('processing')
  })

  it('优先级修改后刷新页面信息保留', () => {
    const initialData = [{ id: 'C001', title: '测试', priority: 'low' }]

    const { result, unmount } = renderHook(() =>
      usePersistentState('complaints', initialData)
    )

    act(() => {
      result.current[1]((prev) =>
        prev.map((c) => (c.id === 'C001' ? { ...c, priority: 'urgent' } : c))
      )
    })

    expect(result.current[0][0].priority).toBe('urgent')

    unmount()

    const { result: result2 } = renderHook(() =>
      usePersistentState('complaints', [])
    )

    expect(result2.current[0][0].priority).toBe('urgent')
  })

  it('筛选条件持久化 - 搜索关键词', () => {
    const { result, unmount } = renderHook(() =>
      usePersistentState('searchQuery', '')
    )

    act(() => {
      result.current[1]('破损')
    })

    expect(result.current[0]).toBe('破损')

    unmount()

    const { result: result2 } = renderHook(() =>
      usePersistentState('searchQuery', '')
    )

    expect(result2.current[0]).toBe('破损')
  })

  it('筛选条件持久化 - 分类和优先级', () => {
    const { result: catResult, unmount: catUnmount } = renderHook(() =>
      usePersistentState('selectedCategory', 'all')
    )
    const { result: priResult, unmount: priUnmount } = renderHook(() =>
      usePersistentState('selectedPriority', 'all')
    )

    act(() => {
      catResult.current[1]('product')
      priResult.current[1]('urgent')
    })

    catUnmount()
    priUnmount()

    const { result: catResult2 } = renderHook(() =>
      usePersistentState('selectedCategory', 'all')
    )
    const { result: priResult2 } = renderHook(() =>
      usePersistentState('selectedPriority', 'all')
    )

    expect(catResult2.current[0]).toBe('product')
    expect(priResult2.current[0]).toBe('urgent')
  })

  it('resetValue 应该重置为初始值并同步到存储', () => {
    const { result, rerender } = renderHook(() =>
      usePersistentState('test-reset', 'initial')
    )

    act(() => {
      result.current[1]('modified')
    })
    expect(result.current[0]).toBe('modified')
    expect(readFromStorage('test-reset', null)).toBe('modified')

    act(() => {
      result.current[2]()
    })
    rerender()

    expect(result.current[0]).toBe('initial')
    expect(readFromStorage('test-reset', null)).toBe('initial')
  })

  it('删除数据后刷新页面数据保持删除状态', () => {
    const initialData = [
      { id: 'C001', title: '待删除' },
      { id: 'C002', title: '保留' },
    ]

    const { result, unmount } = renderHook(() =>
      usePersistentState('complaints', initialData)
    )

    act(() => {
      result.current[1]((prev) => prev.filter((c) => c.id !== 'C001'))
    })

    expect(result.current[0]).toHaveLength(1)
    expect(result.current[0][0].id).toBe('C002')

    unmount()

    const { result: result2 } = renderHook(() =>
      usePersistentState('complaints', [])
    )

    expect(result2.current[0]).toHaveLength(1)
    expect(result2.current[0][0].id).toBe('C002')
  })
})

describe('版本号迁移完整场景', () => {
  it('版本号不匹配时清空数据并打印 console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    localStorage.setItem(`${STORAGE_PREFIX}:version`, '0.9.0-old')
    const oldKey = `${STORAGE_PREFIX}:v0.9.0-old:complaints`
    localStorage.setItem(oldKey, JSON.stringify([{ id: 'OLD001', title: '旧数据' }]))

    expect(localStorage.getItem(oldKey)).not.toBeNull()

    renderHook(() => usePersistentState('complaints', [{ id: 'NEW', title: '新数据' }]))

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('版本不匹配：存储版本 0.9.0-old，当前版本')
    )
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('正在清理旧数据...')
    )

    const currentKey = getStorageKey('complaints')
    const stored = JSON.parse(localStorage.getItem(currentKey))
    expect(stored).toEqual([{ id: 'NEW', title: '新数据' }])

    warnSpy.mockRestore()
  })

  it('升级版本号后旧版本 hook 数据被清除', () => {
    const OLD_VERSION = '0.5.0'
    const oldStorageKey = `${STORAGE_PREFIX}:v${OLD_VERSION}:complaints`

    localStorage.setItem(`${STORAGE_PREFIX}:version`, OLD_VERSION)
    localStorage.setItem(oldStorageKey, JSON.stringify([{ id: 'OLD', from: OLD_VERSION }]))
    localStorage.setItem('unrelated-data', 'should-keep')

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderHook(() => usePersistentState('complaints', [{ id: 'INIT' }]))

    expect(warnSpy).toHaveBeenCalled()
    expect(localStorage.getItem(oldStorageKey)).toBeNull()
    expect(localStorage.getItem('unrelated-data')).toBe('should-keep')

    const currentKey = getStorageKey('complaints')
    expect(JSON.parse(localStorage.getItem(currentKey))).toEqual([{ id: 'INIT' }])

    warnSpy.mockRestore()
  })
})
