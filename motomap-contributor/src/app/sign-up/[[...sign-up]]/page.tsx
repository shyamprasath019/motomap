import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Join Motomap</h1>
          <p className="text-sm text-muted-foreground">
            Help build India&apos;s motorcycle knowledge base
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
