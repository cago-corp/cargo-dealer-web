# DEPENDENCY_POLICY.md

# 목적

이 문서는 `cargo-web`의 의존성 선언 정책과 패키지 추가 기준을 정의합니다.

핵심 목표:
- 버전 관리 일원화
- 역할별 라이브러리 중복 방지
- 러닝커브가 큰 스택 확산 방지

## 1. 외부 패키지 버전 선언 정책

원칙:
- 외부 패키지 버전은 루트 `package.json`에서만 관리한다.
- workspace를 도입하기 전까지 lockfile은 하나만 유지한다.
- 같은 역할의 패키지를 2개 이상 도입하지 않는다.

예:
- server state는 TanStack Query 하나로 통일
- validation은 Zod 하나로 통일
- styling foundation은 Tailwind CSS 하나로 통일

## 2. 기본 허용 스택

기본 허용:
- `next`
- `react`
- `typescript`
- `@tanstack/react-query`
- `zod`
- `tailwindcss`

승인 후 도입:
- 상태관리 라이브러리 (`zustand`, `redux`, `jotai`)
- 폼 라이브러리 (`react-hook-form`, `formik`)
- 컴포넌트 라이브러리 (`shadcn/ui`, `mui`, `chakra`)
- 데이터 그리드 / 가상화 라이브러리

원칙:
- 도입 이유가 명확하지 않으면 추가하지 않는다.

## 3. 의존성 추가 전 확인사항

새 패키지를 추가하기 전에:
- [ ] Next.js / React 기본 기능으로 해결 가능한가?
- [ ] 이미 사용 중인 패키지로 해결 가능한가?
- [ ] 이 패키지가 server/client 경계를 복잡하게 만들지 않는가?
- [ ] 팀이 유지 가능한 러닝커브인가?
- [ ] 번들 크기 / 접근성 / 라이선스 문제가 없는가?

## 4. 금지 또는 비권장 추가

금지:
- 동일 역할 라우터 추가
- 전역 상태관리 라이브러리 중복
- CSS-in-JS와 Tailwind 혼용을 기본 전략으로 도입
- API client abstraction을 과도하게 여러 층으로 겹치는 구조

비권장:
- 이유 없는 UI kit 추가
- 서버에서 가능한 로직을 client helper 라이브러리로 우회

## 5. 패키지 선택 원칙

우선순위:
1. 플랫폼 기본 기능
2. 현재 채택 스택
3. 추가 라이브러리

예:
- routing -> Next App Router
- server state -> TanStack Query
- validation -> Zod
- styles -> Tailwind

## 6. 환경 변수 정책

- 외부 공개 가능 값은 `NEXT_PUBLIC_*`
- 민감 값은 서버 전용 env로 유지
- env parsing helper를 통해 누락을 조기 실패시킨다

## 7. 변경 절차 (권장)

1. 요구사항 확인
2. 기존 의존성 재사용 가능성 검토
3. `package.json` 수정
4. 설치
5. 변경 범위 lint / typecheck / test
6. 왜 추가했는지 문서 또는 PR 설명에 남김
