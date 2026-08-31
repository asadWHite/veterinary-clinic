import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
      <div className="flex items-end justify-center lg:col-span-5">
        <Image
          src="/images/animals/cat-british-shorthair-white.jpg"
          alt="British shorthair cat on a pure white background"
          width={1024}
          height={1024}
          sizes="(max-width: 1024px) 80vw, 40vw"
          className="h-auto w-full max-w-[420px] select-none"
          style={{ mixBlendMode: "multiply" }}
        />
      </div>
      <div className="flex items-center lg:col-span-7 lg:border-l lg:border-[var(--line)] lg:pl-10">
        <div className="px-[var(--gutter)] py-16">
          <p className="label text-ink/40">404</p>
          <h1 className="display d1 mt-5 uppercase">
            Nothing
            <br />
            here.
          </h1>
          <p className="body-lg mt-6 max-w-md">
            The page you were looking for has moved, or never existed. The cat is unbothered.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/"
              className="label arrow-forward flex items-center gap-3 bg-ink px-8 py-5 text-white"
            >
              Back home
              <span className="arrow">→</span>
            </Link>
            <Link
              href="/booking"
              className="label flex items-center gap-3 border border-[var(--line)] px-8 py-5 hover:border-ink"
            >
              Book a visit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
