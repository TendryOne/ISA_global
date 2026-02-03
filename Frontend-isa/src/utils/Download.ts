import axios from 'axios'

export async function downloadByPathAxios(dbPath: string) {
  const url = `/api/v1/upload/materials/by-path?path=${encodeURIComponent(dbPath)}`
  const res = await axios.get(url, { responseType: 'blob', withCredentials: true })
  const blob = res.data
  const cd = res.headers['content-disposition'] || ''
  const filename = cd.match(/filename="?([^"]+)"?/i)?.[1] || dbPath.split('/').pop()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
