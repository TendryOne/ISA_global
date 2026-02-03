import axios from 'axios'
export const PostReportLog = async (body: object) => {
  try {
    await axios.post('/api/v1/report', body)
  } catch (error) {
    throw error
  }
}
