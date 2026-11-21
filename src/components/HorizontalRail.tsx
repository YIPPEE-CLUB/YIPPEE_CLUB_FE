import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

export function HorizontalRail({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: true });
  function measure() {
    const node = track.current;
    if (node)
      setPosition({
        start: node.scrollLeft < 2,
        end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2,
      });
  }
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    measure();
    return () => observer.disconnect();
  }, [children]);
  function move(direction: number) {
    const node = track.current;
    if (!node) return;
    const first = node.firstElementChild as HTMLElement | null;
    const step = first
      ? first.offsetWidth + parseFloat(getComputedStyle(node).gap || '0')
      : node.clientWidth;
    node.scrollBy({
      left: direction * step,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  return (
    <div className="horizontal-rail" role="region" aria-label={label}>
      <div className="rail-actions">
        <button
          type="button"
          aria-label={`${label} 이전`}
          disabled={position.start}
          onClick={() => move(-1)}
        >
          <span className="carousel-arrow--previous">
            <Icon name="chevron" size={18} />
          </span>
        </button>
        <button
          type="button"
          aria-label={`${label} 다음`}
          disabled={position.end}
          onClick={() => move(1)}
        >
          <Icon name="chevron" size={18} />
        </button>
      </div>
      <div
        ref={track}
        className={className}
        onScroll={measure}
        tabIndex={0}
        aria-label={`${label} 가로 목록`}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            ['ArrowLeft', 'ArrowRight'].includes(event.key)
          ) {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
