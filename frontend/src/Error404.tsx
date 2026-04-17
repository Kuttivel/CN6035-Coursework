export function Error404() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page Not Found</p>
            <a href="/" className="text-emerald-500 hover:text-emerald-400">
                Go back home
            </a>
        </div>
    );
}