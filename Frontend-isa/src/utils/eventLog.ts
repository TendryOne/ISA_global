import type { eventLogInterface } from "@/interfaces/eventLog.interface"
import axios from "axios"
// best effort logging of events
export const PostEventLog = async (eventLog: eventLogInterface) => {
    try {
        await axios.post('/api/v1/eventLogs', eventLog)
    }
    catch (error) {
        // on ignore les erreurs de logging


    }
}