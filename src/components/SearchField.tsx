import { useRef, useState } from 'react';
import { Icon } from './Icon';

// 한글 조합 중에는 입력값만 보관합니다. URL 변경과 검색은 제출할 때만 실행합니다.
// IME Enter는 조합 확정용일 수 있으므로 검색 제출과 구분합니다.
export function SearchField({
  initialValue = '',
  onSubmit,
  onDraftChange,
  autoFocus = false,
}: {
  initialValue?: string;
  onSubmit: (value: string) => void;
  onDraftChange?: (value: string) => void;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState(initialValue);
  const composing = useRef(false);
  return (
    <form
      className="search-field"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (!composing.current && draft.trim()) onSubmit(draft.trim());
      }}
    >
      <input
        aria-label="활동지 검색"
        value={draft}
        autoFocus={autoFocus}
        enterKeyHint="search"
        autoComplete="off"
        placeholder="놀이 키워드를 입력해보세요.(자동차, 공룡)"
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          const value = event.currentTarget.value;
          setDraft(value);
          onDraftChange?.(value);
        }}
        onChange={(event) => {
          const value = event.target.value;
          setDraft(value);
          if (!composing.current) onDraftChange?.(value);
        }}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            (composing.current ||
              event.nativeEvent.isComposing ||
              event.nativeEvent.keyCode === 229)
          )
            event.preventDefault();
        }}
      />
      <button type="submit" className="search-submit" aria-label="검색 실행">
        <Icon name="search" />
      </button>
    </form>
  );
}
