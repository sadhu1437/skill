import { useLocation } from 'react-router-dom'
import { isAdEligiblePath } from '../utils/adEligibility'

export default function AdEligibility({ children, surface, contentEligible = true }) {
  const { pathname } = useLocation()
  if (!contentEligible || !isAdEligiblePath(pathname, surface)) return null
  return children
}
