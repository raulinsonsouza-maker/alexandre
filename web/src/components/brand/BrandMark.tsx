import Link from "next/link";

export function BrandMark({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`brand ${className}`.trim()} aria-label="Jornada SAP EWM - início">
      <span className="brand-mark" aria-hidden="true">
        J
      </span>
      <span className="brand-copy">
        <strong>
          Jornada <em>SAP EWM</em>
        </strong>
        <small>Academy</small>
      </span>
    </Link>
  );
}
