import { useState, useEffect, useCallback } from 'react'

export const STORAGE_VERSION = '1.0.0'
export const STORAGE_PREFIX = 'complaint-board'

export const getStorageKey = (key) => `${STORAGE_PREFIX}:v${STORAGE_VERSION}:${key}`

export const checkVersion = () => {
  const versionKey = `${STORAGE_PREFIX}:version`
  const storedVersion = localStorage.getItem(versionKey)

  if (storedVersion === null) {
    localStorage.setItem(versionKey, STORAGE_VERSION)
    return true
  }

  if (storedVersion !== STORAGE_VERSION) {
    console.warn(
      `[localStorage] 版本不匹配：存储版本 ${storedVersion}，当前版本 ${STORAGE_VERSION}，正在清理旧数据...`
    )
    clearAllData()
    localStorage.setItem(versionKey, STORAGE_VERSION)
    return false
  }

  return true
}

export const clearAllData = () => {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keys.push(key)
    }
  }
  keys.forEach((key) => localStorage.removeItem(key))
}

export const readFromStorage = (key, defaultValue) => {
  try {
    const storageKey = getStorageKey(key)
    const raw = localStorage.getItem(storageKey)
    if (raw === null) return defaultValue
    return JSON.parse(raw)
  } catch (error) {
    console.error(`[localStorage] 读取 ${key} 失败：`, error)
    return defaultValue
  }
}

export const writeToStorage = (key, value) => {
  try {
    const storageKey = getStorageKey(key)
    localStorage.setItem(storageKey, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`[localStorage] 写入 ${key} 失败：`, error)
    return false
  }
}

export const removeFromStorage = (key) => {
  try {
    const storageKey = getStorageKey(key)
    localStorage.removeItem(storageKey)
    return true
  } catch (error) {
    console.error(`[localStorage] 删除 ${key} 失败：`, error)
    return false
  }
}

export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    checkVersion()
    return readFromStorage(key, initialValue)
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      writeToStorage(key, value)
    }
  }, [key, value])

  const resetValue = useCallback(() => {
    removeFromStorage(key)
    setValue(initialValue)
  }, [key, initialValue])

  return [value, setValue, resetValue]
}

export default usePersistentState
