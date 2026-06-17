/**
 * SignUp.jsx — legacy entry point.
 * The unified auth UI now lives in AuthPage.jsx.
 * This re-export keeps the existing /sign-up route working.
 */
import AuthPage from './AuthPage'
const SignUp = () => <AuthPage initialView="signup" />
export default SignUp