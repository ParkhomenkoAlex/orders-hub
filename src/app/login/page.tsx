import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
    searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { error } = await searchParams;

    return <LoginForm hasError={error === "invalid"} />;
}
