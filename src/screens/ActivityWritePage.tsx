import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ScreenHeader } from '../components/ScreenHeader';
import { WireDialog } from '../components/WireDialog';
import { Icon } from '../components/Icon';
import type { Activity } from '../types';

export function ActivityWritePage({
  activities,
  record = false,
}: {
  activities: Activity[];
  record?: boolean;
}) {
  const { activityId } = useParams();
  const activity = activities.find((item) => item.id === Number(activityId));
  const [rating, setRating] = useState(0);
  const [reaction, setReaction] = useState('');
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dialog, setDialog] = useState<'confirm' | 'unavailable' | null>(null);
  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);
  const valid =
    !!activity &&
    (record ? photos.length > 0 && !!reaction : rating > 0 && !!text.trim());
  function submit(event: FormEvent) {
    event.preventDefault();
    if (valid) setDialog(record ? 'unavailable' : 'confirm');
  }
  return (
    <form
      className="screen"
      onSubmit={submit}
      data-figma-node={record ? '124:3294' : text ? '190:4627' : '123:2940'}
    >
      <ScreenHeader
        title={record ? '활동 인증하기' : '리뷰 쓰기'}
        backTo={record ? '/saved' : `/activities/${activityId}/reviews`}
      />
      <div className="screen-content form-stack">
        {activity ? (
          <div className="write-activity">
            <span className="write-activity__thumbnail" />
            <div>
              <p>
                [{activity.subtitle}]<br />
                {activity.title}
              </p>
              {!record && (
                <strong>{activity.price.toLocaleString('ko-KR')}원</strong>
              )}
            </div>
          </div>
        ) : (
          <p role="status">활동지를 불러올 수 없어요.</p>
        )}
        {record ? (
          <>
            <h3>아이 작품 사진</h3>
            <PhotoFields
              photos={photos}
              previews={previews}
              onChange={setPhotos}
            />
            <h3>아이 반응은 어땠나요?</h3>
            <div className="chips">
              {['아주 좋아했어요', '좋아했어요', '어려워했어요'].map(
                (label) => (
                  <button
                    type="button"
                    className={`chip ${reaction === label ? 'is-selected' : ''}`}
                    aria-pressed={reaction === label}
                    key={label}
                    onClick={() => setReaction(label)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </>
        ) : (
          <>
            <h3>아이가 좋아했나요?</h3>
            <div className="review-stars" role="group" aria-label="별점">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-label={`${value}점`}
                  aria-pressed={rating === value}
                  className={value <= rating ? 'is-selected' : ''}
                  onClick={() => setRating(value)}
                >
                  ★
                </button>
              ))}
            </div>
          </>
        )}
        <label className="wire-field">
          {record ? '메모' : '후기'}
          <textarea
            placeholder={
              record ? '오늘 놀이를 기록해 보세요' : '놀이 후기를 남겨 주세요'
            }
            maxLength={500}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <p className="character-count">{text.length} / 500</p>
        {!record && (
          <PhotoFields
            photos={photos}
            previews={previews}
            onChange={setPhotos}
          />
        )}
        <p className="wire-note">등록한 리뷰는 수정할 수 없어요.</p>
      </div>
      <div className="screen-actions">
        <button className="button button--primary" disabled={!valid}>
          {record ? '기록하기' : '등록하기'}
        </button>
        {record && (
          <Link className="button" to="/saved">
            건너뛰기
          </Link>
        )}
      </div>
      {dialog && (
        <WireDialog
          title={dialog === 'confirm' ? '리뷰 등록 확인' : '등록 안내'}
          onClose={() => setDialog(null)}
        >
          <h2>
            {dialog === 'confirm'
              ? '리뷰를 등록할까요?'
              : '등록 기능을 준비 중이에요'}
          </h2>
          <p>
            {dialog === 'confirm'
              ? '등록한 리뷰는 수정할 수 없어요.'
              : '아직 저장되지 않았어요. 입력한 내용은 이 화면에서 계속 확인할 수 있어요.'}
          </p>
          <div className="dialog-actions">
            <button
              type="button"
              className="button"
              onClick={() => setDialog(null)}
            >
              {dialog === 'confirm' ? '취소' : '확인'}
            </button>
            {dialog === 'confirm' && (
              <button
                type="button"
                className="button button--primary"
                onClick={() => setDialog('unavailable')}
              >
                등록하기
              </button>
            )}
          </div>
        </WireDialog>
      )}
    </form>
  );
}

function PhotoFields({
  photos,
  previews,
  onChange,
}: {
  photos: File[];
  previews: string[];
  onChange: (files: File[]) => void;
}) {
  return (
    <div className="photo-inputs">
      {photos.map((file, index) => (
        <div
          className="photo-placeholder write-photo"
          key={`${file.name}-${index}`}
        >
          <img src={previews[index]} alt={`첨부 사진 ${index + 1}`} />
          <button
            className="icon-button"
            type="button"
            aria-label={`사진 ${index + 1} 삭제`}
            onClick={() => onChange(photos.filter((_, i) => i !== index))}
          >
            <Icon name="close" />
          </button>
        </div>
      ))}
      {photos.length < 3 && (
        <label className="photo-add">
          <Icon name="plus" />
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            aria-label="사진 추가"
            multiple
            onChange={(event) => {
              onChange(
                [
                  ...photos,
                  ...Array.from(event.target.files || []).filter((file) =>
                    file.type.startsWith('image/'),
                  ),
                ].slice(0, 3),
              );
              event.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}
