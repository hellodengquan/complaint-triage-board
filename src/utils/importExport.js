import { STORAGE_VERSION, STORAGE_PREFIX, writeToStorage } from '../hooks/usePersistentState'

export const EXPORT_FILE_PREFIX = 'complaint-board'

export const buildExportData = ({
  complaints,
  searchQuery = '',
  selectedCategory = 'all',
  selectedPriority = 'all',
  selectedAssignee = 'all',
  activeView = 'board',
}) => {
  return {
    schemaVersion: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    app: STORAGE_PREFIX,
    data: {
      complaints,
      filters: {
        searchQuery,
        selectedCategory,
        selectedPriority,
        selectedAssignee,
      },
      view: {
        activeView,
      },
    },
  }
}

export const generateExportFileName = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${EXPORT_FILE_PREFIX}_${year}${month}${day}_${hours}${minutes}${seconds}.json`
}

export const exportToJson = (data) => {
  const exportData = buildExportData(data)
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const fileName = generateExportFileName()

  if (typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { success: true, fileName }
  }

  return { success: false, fileName }
}

export const validateImportData = (importedData) => {
  if (!importedData || typeof importedData !== 'object') {
    return { valid: false, reason: '文件格式无效' }
  }

  if (!importedData.schemaVersion) {
    return { valid: false, reason: '缺少 schema 版本号' }
  }

  if (importedData.schemaVersion !== STORAGE_VERSION) {
    return {
      valid: false,
      reason: `Schema 版本不匹配：文件版本 ${importedData.schemaVersion}，当前版本 ${STORAGE_VERSION}`,
      fileVersion: importedData.schemaVersion,
      currentVersion: STORAGE_VERSION,
    }
  }

  if (!importedData.data || !Array.isArray(importedData.data.complaints)) {
    return { valid: false, reason: '数据格式不正确，缺少 complaints 数组' }
  }

  return { valid: true }
}

export const parseJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (err) {
        reject(new Error('JSON 解析失败'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

export const importFromJson = async (file) => {
  try {
    const importedData = await parseJsonFile(file)
    const validation = validateImportData(importedData)

    if (!validation.valid) {
      return { success: false, message: validation.reason, ...validation }
    }

    const { complaints, filters, view } = importedData.data

    writeToStorage('complaints', complaints)
    writeToStorage('searchQuery', filters?.searchQuery || '')
    writeToStorage('selectedCategory', filters?.selectedCategory || 'all')
    writeToStorage('selectedPriority', filters?.selectedPriority || 'all')
    writeToStorage('selectedAssignee', filters?.selectedAssignee || 'all')
    writeToStorage('activeView', view?.activeView || 'board')

    return {
      success: true,
      message: '导入成功',
      data: {
        complaints,
        searchQuery: filters?.searchQuery || '',
        selectedCategory: filters?.selectedCategory || 'all',
        selectedPriority: filters?.selectedPriority || 'all',
        selectedAssignee: filters?.selectedAssignee || 'all',
        activeView: view?.activeView || 'board',
      },
    }
  } catch (error) {
    return { success: false, message: error.message || '导入失败' }
  }
}
