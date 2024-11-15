import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EnhancedError({ details }: { details: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <svg
            className="mx-auto h-32 w-auto text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M24 8V4m0 40v-4m16-16h4M4 24h4m34.293-13.707l2.828-2.828M6.879 41.121l2.828-2.828M41.121 41.121l-2.828-2.828M6.879 6.879l2.828 2.828M24 30a6 6 0 100-12 6 6 0 000 12z"
            />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Oops! Something went wrong
          </h2>
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            We're working on fixing this issue. Please try again later.
          </p> */}
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="px-4 py-5 bg-white sm:p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Error Details</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  {details}
                </p>
              </div>
            </div>
          </div>
          <div>
            <Button asChild className="w-full h-8">
              <Link href="/">
                Return to Homepage
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <span className="text-sm text-gray-500">
            Need help?
          </span>
          <a href="#" className="ml-1 text-sm text-primary hover:text-primary-dark">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}