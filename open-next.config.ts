import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// ISR·데이터 캐시를 쓰지 않으므로 R2 증분 캐시는 연결하지 않습니다.
// 필요해지면 https://opennext.js.org/cloudflare/caching 을 참고해 추가합니다.
export default defineCloudflareConfig({});
