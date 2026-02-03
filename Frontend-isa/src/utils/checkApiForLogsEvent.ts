import axios from "axios"

export const checkApiForLogsEvent = async (entityType: string, entityId: string) => {
    try {
        const response = await axios.get(`/api/v1/eventLogs/eventDetails/${entityId}/${entityType}`)
        return response.data
    } catch (error) {
        throw error
    }
}