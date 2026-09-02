import Link from "next/link";

export type CourseCardData = {
  href: string;
  title: string;
  image: string;
  label: string;
  details?: string[];
  progress?: number | null;
  badge?: string | null;
};

export function CourseCard({ href, title, image, label, details, progress, badge }: CourseCardData) {
  return (
    <Link className="course-card" href={href} aria-label={title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" width={1024} height={576} loading="lazy" />
      <span className="card-shade" aria-hidden="true" />
      {badge ? <span className="new-badge">{badge}</span> : null}
      <span className="card-play" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="m9 7 8 5-8 5Z" />
        </svg>
      </span>
      <span className="card-content">
        <span className="card-label">{label}</span>
        <strong>{title}</strong>
        {details && details.length > 0 ? (
          <span className="card-details">
            {details.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </span>
        ) : null}
      </span>
      {typeof progress === "number" && progress > 0 ? (
        <span className="card-progress" aria-label={`${progress}% concluído`}>
          <i style={{ ["--progress" as string]: `${progress}%` }} />
        </span>
      ) : null}
    </Link>
  );
}
