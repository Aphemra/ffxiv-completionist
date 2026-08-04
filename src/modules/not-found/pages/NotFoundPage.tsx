import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="simple-page">
      <p className="page-header__eyebrow">Navigation Error</p>
      <h1>Page not found</h1>

      <p>
        The requested tracker page does not exist or has not been implemented
        yet.
      </p>

      <Link className="text-link" to="/">
        Return to the dashboard
      </Link>
    </div>
  );
}