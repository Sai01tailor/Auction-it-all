/**
 * Login.jsx — legacy entry point.
 * The unified auth UI now lives in AuthPage.jsx.
 * This re-export keeps the existing /login route working.
 */
import AuthPage from './AuthPage'
const Login = () => <AuthPage initialView="login" />
export default Login