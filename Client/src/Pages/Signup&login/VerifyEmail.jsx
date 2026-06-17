/**
 * VerifyEmail.jsx — legacy entry point.
 * The unified auth UI now lives in AuthPage.jsx.
 * This re-export keeps the existing /Verify-email route working.
 */
import AuthPage from './AuthPage'
const VerifyEmail = () => <AuthPage initialView="verify" />
export default VerifyEmail