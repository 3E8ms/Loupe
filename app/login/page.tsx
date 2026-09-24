import { AuthForm } from "../components/AuthForm";
import { login } from "../lib/actions";
export default function Page() { return <AuthForm mode="login" action={login} />; }
