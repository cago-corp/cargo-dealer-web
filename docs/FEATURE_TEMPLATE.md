# FEATURE_TEMPLATE.md

# 목적

이 문서는 `cargo-web`에서 신규 feature를 추가할 때 따르는 최소 템플릿을 정의합니다.

## 1. Feature 추가 전 확인

- 이 기능이 독립 feature인가?
- 기존 feature의 하위 섹션으로 충분한가?
- route ownership은 어디인가?
- 주요 entity / API contract는 무엇인가?
- shell state와 business state를 분리했는가?

## 2. 권장 구조

```text
src/features/<feature>/
  components/
  hooks/
  lib/
  schemas/
  types/
  <feature>-page.tsx
```

예:

```text
src/features/deals/
  components/
    deal-list.tsx
    deal-detail-panel.tsx
  hooks/
    use-deal-list-query.ts
  lib/
    deal-list-query.ts
    deal-status-mapper.ts
  schemas/
    deal-list-response-schema.ts
  types/
    deal-filter.ts
  dealer-deals-page.tsx
```

## 3. Feature Entry 책임

feature entry는 아래만 담당한다:
- query / mutation 조립
- loading / error / empty / success 상태 전환
- 주요 하위 컴포넌트 조립

금지:
- raw response parsing 상세를 모두 직접 품는 것
- unrelated feature의 UI까지 함께 소유하는 것

## 4. 신규 기능 개발 순서

1. route 위치 확정
2. schema 정의
3. entity / mapper 정의
4. query / mutation 구현
5. feature entry와 하위 component 구현
6. 테스트 / 수동 시나리오 정리

## 5. 체크리스트

- [ ] route ownership이 명확한가
- [ ] schema parse 지점이 있는가
- [ ] loading / empty / error 상태가 모두 정의되었는가
- [ ] shell state와 feature state를 섞지 않았는가
- [ ] 수동 테스트 경로를 적어둘 수 있는가
