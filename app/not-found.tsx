import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-20 text-center">
      <p className="font-serif text-sm uppercase tracking-wider text-navy/50">
        404
      </p>
      <h1 className="mt-2 font-serif text-display text-navy">
        Page not found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-navy/70">
        The page you were looking for doesn't exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-navy px-5 font-medium text-cream hover:bg-navy/90"
      >
        Go home
      </Link>
    </div>
  );
}
