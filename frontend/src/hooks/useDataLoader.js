import { useEffect, useRef } from 'react'
import { useDataStore } from '../stores/dataStore'

/**
 * 通用数据加载 Hook，消除各页面重复的 loadAllData + useEffect 模式。
 * 同一次挂载周期只触发一次加载。
 */
export function useDataLoader() {
    const loadAllData = useDataStore((s) => s.loadAllData)
    const loading = useDataStore((s) => s.loading)
    const error = useDataStore((s) => s.error)
    const called = useRef(false)

    useEffect(() => {
        if (!called.current) {
            called.current = true
            loadAllData()
        }
    }, [loadAllData])

    return { loading, error }
}
