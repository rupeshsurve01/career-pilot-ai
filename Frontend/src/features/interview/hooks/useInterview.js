import { useCallback, useContext, useEffect } from "react"
import { InterviewContext } from "../interviewContext"
import { useParams } from "react-router"
import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports, setError } = context

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

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (!interviewId) {
            getReports()
        }
    }, [ interviewId, getReports ])

 return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
