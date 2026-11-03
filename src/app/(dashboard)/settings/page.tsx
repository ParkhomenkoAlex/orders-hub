import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/auth/cookie";
import { verifyAuthToken } from "@/auth/jwt";
import { AuthSettings } from "@/components/auth/AuthSettings";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const session = await verifyAuthToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);

    if (!session) {
        redirect("/login");
    }

    return <AuthSettings username={session.username} />;
}
