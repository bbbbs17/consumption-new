## 💳 Consumption Insight - AI 소비 습관 분석 및 개선 시스템 (백엔드)
단순 지출 내역을 넘어, 사용자의 소비 패턴을 의미 단위로 분석하고 절약 방안을 제시하는 소비 습관 분석 백엔드 REST API 서버입니다.
Spring Boot 3 기반으로 구현되었으며, 소비 등록, 소비 분석, 온톨로지 기반 구조 설계 등 사용자 중심 분석 기능을 제공합니다.

🔗 본 프로젝트는 개인 프로젝트이며, 전 과정을 직접 설계 및 개발 중입니다.

---

## 🛠 기술 스택

| 분류       | 기술                                           |
|------------|------------------------------------------------|
| 언어       | Java 21                                        |
| 프레임워크 | Spring Boot 3                                  |
| 빌드 도구  | Gradle                                         |
| 인증/보안  | Spring Security (JWT 기반 로그인)              |
| DB         | MySQL                                          |
| 배포 인프라 | Naver Cloud                                    |
| 메일 인증  | Naver SMTP                                     |
| API 방식   | RESTful                                        |


---

## 🔑 주요 기능 요약
### ✅ 소비 내역 관리

-소비 내역 등록, 조회, 수정, 삭제 (CRUD API)

-장소, 시간, 소비 목적 등 다양한 소비 속성 관리

## ✅ 소비 습관 분석

-습관 소비 / 루틴 소비 / 감정 소비 등 정적 규칙 기반 분류

-예시 규칙:
동일 장소 3회 이상 → 루틴 소비
오전 커피 소비 주 3회 이상 → 습관 소비

## ✅ 온톨로지 기반 소비 의미 분해

-'무엇을 샀는가'가 아닌 '왜 소비했는가'에 초점

-장소, 시간대, 반복성,등 소비 맥락 기반 데이터 구조 설계

## ✅ 외부 결제 시스템 연동

-Toss API를 통한 프리미엄 결제 기능

결제 요청 → 승인/실패 처리 → 결제 이력 저장 → 정산 로직 구현

## ✅ 실시간 기능 확장 준비

-WebSocket 기반 가족 공동 소비 피드백 시스템 설계 중

-가족 간 실시간 코멘트, 소비 항목 수정 요청 등 상호작용 구조 설계

---

## 🗂️ 폴더 구조
📁 src/main/java/com/example/ImproveConsumption

├── 📁 config
    보안 설정 (JWT, Security), CORS, WebMvc 설정 등

├── 📁 controller
    REST API 엔드포인트 정의 (소비 등록, 조회, 분석, 결제 등)

├── 📁 domain
    JPA 엔티티 클래스 (User, Consumption, Balance 등)

├── 📁 dto
    요청(Request), 응답(Response)용 데이터 전송 객체 정의

├── 📁 exception
    전역 예외 처리 및 커스텀 예외 클래스

├── 📁 payment
    외부 결제 시스템(Toss Payments) 연동 로직

├── 📁 repository
    JPA Repository 인터페이스

├── 📁 service
    핵심 비즈니스 로직 (소비 분석, 규칙 엔진, 결제 처리 등)

📁 src/main/resources

├── 📁 ontology
    정적 규칙(JSON 등), 온톨로지 설계 데이터 파일

└── application.yml
    프로젝트 전역 설정 파일 (DB, 보안, 외부 API 등)
    
---
