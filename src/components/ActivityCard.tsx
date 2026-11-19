import { Link } from 'react-router-dom';
import type { Activity } from '../types';
import { Icon } from './Icon';

interface ActivityCardProps {
  activity: Activity;
  saved: boolean;
  onToggle: (id: number) => void;
  showSave?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
}

export function ActivityCard({
  activity,
  saved,
  onToggle,
  showSave = true,
  selected = false,
  onSelect,
}: ActivityCardProps) {
  return (
    <article
      className={`activity-card ${activity.location ? 'activity-card--experience' : ''}`}
    >
      <Link
        className="activity-card__thumbnail"
        to={`/activities/${activity.id}`}
        aria-label={`${activity.title} 상세 보기`}
      >
        {activity.thumbnail && <img src={activity.thumbnail} alt="" />}
      </Link>
      {onSelect && (
        <label className="activity-card__select">
          <input
            type="checkbox"
            aria-label={`${activity.title} 선택`}
            checked={selected}
            onChange={() => onSelect(activity.id)}
          />
          <span aria-hidden="true">✓</span>
        </label>
      )}
      {showSave && (
        <button
          className="activity-card__save"
          type="button"
          aria-label={`${activity.title} ${saved ? '저장 해제' : '저장'}`}
          aria-pressed={saved}
          onClick={() => onToggle(activity.id)}
        >
          <Icon name={saved ? 'heartFilled' : 'heart'} />
        </button>
      )}
      <span className={`tag ${activity.location ? 'tag--location' : ''}`}>
        {activity.location ||
          (activity.duration
            ? activity.durationMin !== undefined
              ? `${activity.durationMin}–${activity.durationMax}분`
              : `${activity.duration}분`
            : '시간 미정')}
      </span>
      <Link className="activity-card__title" to={`/activities/${activity.id}`}>
        <span>[{activity.subtitle}]</span>
        {activity.title}
      </Link>
      <Link className="activity-card__price" to={`/activities/${activity.id}`}>
        <strong>{activity.price.toLocaleString('ko-KR')}원</strong>
      </Link>
    </article>
  );
}
