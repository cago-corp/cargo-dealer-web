# GIT_WORKFLOW.md

# 목적

이 문서는 `cargo-web` 저장소에서의 기본 브랜치/커밋 워크플로우를 정의합니다.

## 1. 기본 원칙

- `main`에 직접 커밋하지 않는다.
- 작업은 기능 단위 브랜치에서 수행한다.
- 문서/구조/기능 변경을 한 번에 과도하게 섞지 않는다.

## 2. 브랜치 네이밍 권장

- `feature/<topic>`
- `fix/<topic>`
- `refactor/<topic>`
- `docs/<topic>`

예:
- `feature/dealer-login-page`
- `fix/chat-dock-scroll`
- `docs/architecture-bootstrap`

## 3. 커밋 원칙

- 한 커밋은 하나의 의도를 가진다.
- 리팩터링과 기능 변경을 가능하면 분리한다.
- generated file이 있다면 이유를 분명히 한다.

권장 예:
- `feat: add dealer login page shell`
- `refactor: split chat dock panel state`
- `docs: define web architecture rules`

## 4. 작업 순서 (권장)

1. 요구사항 확인
2. 관련 문서/기존 구현 확인
3. 작은 단위로 구현
4. lint / typecheck / 필요한 테스트 실행
5. 변경 이유와 검증 결과 정리

## 5. PR 설명에 포함할 항목

- 무엇을 바꿨는가
- 왜 바꿨는가
- 어떻게 검증했는가
- 남은 리스크는 무엇인가

## 6. 금지 사항

- unrelated change 끼워넣기
- 대규모 포맷팅만 있는 noisy commit
- 검증 없이 route/auth 정책 변경
