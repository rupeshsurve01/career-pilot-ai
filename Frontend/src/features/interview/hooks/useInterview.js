import { getAllInterviewReports, generateInterviewReport, getInterviewReportById } from "../services/interview.api"
import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interviewContext"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports, error, setError } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
            setError(error?.response?.data?.message || "Failed to generate interview plan.")
        } finally {
            setLoading(false)
        }

        return response?.interviewReport ?? null
    }

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
            setReport(null)
            setError(error?.response?.data?.message || "Could not load this interview plan.")
        } finally {
            setLoading(false)
        }
        return response?.interviewReport ?? null
    }, [ setLoading, setReport, setError ])

    const getReports = useCallback(async () => {
        setLoading(true)
        setError("")
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
            setReports([])
            setError(error?.response?.data?.message || "Could not load interview plans.")
        } finally {
            setLoading(false)
        }

        return response?.interviewReports ?? []
    }, [ setLoading, setReports, setError ])

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    return { loading, report, reports, error, generateReport, getReportById, getReports }

}
