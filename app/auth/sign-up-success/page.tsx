export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-slate-600">
              We&apos;ve sent you an email with a confirmation link. Please click the link to verify your account before
              signing in.
            </p>
          </div>

          <div className="pt-6 border-t">
            <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Return to login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
