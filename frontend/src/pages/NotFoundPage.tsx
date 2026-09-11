import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
          <SearchX className="w-10 h-10 text-blue-700 dark:text-blue-400" aria-hidden="true" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Pagina no encontrada</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          La pagina que buscas no existe o fue movida a otra ubicacion.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}