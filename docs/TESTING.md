# TESTING.md

# 목적

이 문서는 변경 범위에 맞는 테스트 선택 기준과 최소 검증 정책을 정의합니다.

원칙:
- "가능한 모든 테스트"보다 "변경 영향에 맞는 최소 충분 테스트"
- 회귀 가능성이 높은 경계부터 검증

## 1. 기본 정책

- 변경한 레이어와 가장 가까운 테스트를 우선 작성/실행한다.
- 테스트가 없더라도 최소한 lint/typecheck는 가능한 범위에서 실행한다.
- 테스트를 생략하면 이유를 명확히 남긴다.

## 2. 변경 유형별 권장 검증

### 2.1 UI 텍스트/레이아웃만 변경

권장:
- component test
- story 또는 visual check
- 최소 `lint` / `typecheck`

### 2.2 Query / Mutation 로직 변경

권장:
- hook unit test
- success / failure / empty 상태 검증
- invalidation 여부 검증

### 2.3 Schema / Mapper 변경

권장:
- parse success / parse failure test
- DTO -> entity mapper test

### 2.4 Route / Redirect 변경

강하게 권장:
- route guard test
- middleware or route-level auth behavior test
- search params 유지 검증

### 2.5 Chat / Real-time 변경

권장:
- room list / room detail fallback test
- optimistic update rollback test
- polling or subscription event handling test

## 3. 테스트 파일 네이밍 규칙

- `<target>.test.ts`
- `<target>.test.tsx`

예:
- `deal-list-query.test.ts`
- `dealer-login-form.test.tsx`
- `chat-room-mapper.test.ts`

## 4. E2E 사용 기준

다음 경우에만 선택적으로 사용:
- auth redirect
- 핵심 거래 생성/변경 플로우
- 채팅 도크와 route 상호작용
- 회귀 비용이 큰 주요 업무 플로우

주의:
- 작은 UI 수정마다 E2E를 요구하지 않는다.

## 5. 최소 검증 체크리스트

- [ ] 변경 범위 기준 lint 실행
- [ ] 변경 범위 기준 typecheck 실행
- [ ] 데이터 경계 변경 시 schema/mapper 테스트 확인
- [ ] 라우팅 변경 시 redirect/search params 확인
- [ ] 주요 상호작용 변경 시 최소 수동 테스트 시나리오 정리

## 6. 권장 명령 예시

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test -- deal-list-query
pnpm exec playwright test
```

## 7. 수동 테스트 문서화 규칙

수동 테스트만 가능한 경우 아래를 남긴다:
- 진입 경로
- 기대 결과
- 실제 결과
- 미검증 항목

## 8. 테스트가 부족한 상태에서의 응답 규칙 (에이전트용)

에이전트는 결과 보고 시 반드시 구분해서 말한다:
- 실행한 테스트
- 실행하지 못한 항목
- 남은 리스크
