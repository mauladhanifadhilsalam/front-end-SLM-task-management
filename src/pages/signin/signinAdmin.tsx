
import { LoginForm } from "@/components/login-form"

export default function SigninAdminPage() {
    return(
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm roleType="admin"/>
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Image"
                className=""
                />
            </div>
        </div>
    )
}