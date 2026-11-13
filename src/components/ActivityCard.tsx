import { Link } from 'react-router-dom';
import type { Activity } from '../types';
import { Icon } from './Icon';

interface ActivityCardProps {
  activity: Activity;
  saved: boolean;
  onToggle: (id: number) => void;
  showSave?: boolean;
}

export function ActivityCard({
  activity,
  saved,
  onToggle,
  showSave = true,
}: ActivityCardProps) {
  return (
    <article className="activity-card">
      {/* Figma 원본처럼 회색 이미지 자리표시자를 유지합니다. */}
      <Link
        className="activity-card__thumbnail"
        to={`/activities/${activity.id}`}
        aria-label={`${activity.title} 상세 보기`}
      />
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
      <span className="tag">
        {activity.duration
          ? `${activity.duration === 10 ? '5-10' : activity.duration}분`
          : '시간 미정'}
      </span>
      <Link className="activity-card__title" to={`/activities/${activity.id}`}>
        <span>[{activity.subtitle}]</span>
        {activity.title}
      </Link>
      <strong>{activity.price.toLocaleString('ko-KR')}원</strong>
    </article>
  );
}
