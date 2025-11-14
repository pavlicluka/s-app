import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function IncidentRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to cyber incident report page
    navigate('/cyber-incident-report', { replace: true })
  }, [navigate])

  return <div>Preusmerjanje...</div>
}