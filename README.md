# 🖌artworks - 일상이 예술이 되다

작품을 **구매하거나 대여신청** 할 수 있는 아트갤러리 웹 서비스입니다.
HTML &middot; CSS &middot; Javascript(ES Modules)와 **Supabase**(Auth / Database / Database / Storge)로 만든 학습용 포트폴리오 프로젝트입니다.

✨ 실제 결제/예약 서비스가 아닙니다

**Demo** : 깃배포주소(배포 후 주소 교체)

---

## 주요기능
| 기능 | 설명 | 관련 파일 |
| --- | --- | --- | --- |
| 메인 | 등록된 작품을 9개씩 불러오고 **더보기** 버튼으로 추가 조회 | `index.html`,`Js/home.js` |
| 갤러리 | 작품명/작가 **검색** + 카테고리 필터, 검색결과 개수 표시 | `gallery.html`,`js/gallery.js` |
| 로그인 / 회원가입 | 이메일 + 비밀번호 인증, 로그인 상태에 따라 메뉴 변경 | `login.html`,`js/login.js`,`js/common.js` |
| 작품등록 | 이미지 미리보기 -> storage 업로드 -> 작품 정보 DB 저장 | `upload.html`,`js/upload.js` |

## 작품 등록 상세
- JPG / PNG / WEBP 형식만 허용, 최대 **3MB**
- 이미지는 `회원ID / 랜덤UUID.확장자` 경로로 storage에 저장
- DB 저장에 실패하면 업로드한 이미지를 자동으로 삭제(롤백)

---

## 기술 스택
-  **Frontend** : HTML5, CSS3, Vanilla Javascrpt(ES Modules)
- **Backend (Baas)** : [Supabase](https://supabase.com) - Auth, Database, Storage
- **Libarary** `@supabase/supabase-js@2` v2 (esm.sh CDN)
- **Deploy** : Github Pages

---
```text
artworks/
├── index.html        # 메인
├── gallery.html      # 작품 갤러리
├── login.html        # 로그인 / 회원가입
├── upload.html       # 작품 등록
├── css/
│   ├── reset.css
│   ├── fonts.css
│   └── style.css
└── js/
    ├── config.js     # Supabase URL / Key
    ├── common.js     # Supabase 클라이언트, 로그인 상태, 공통 함수
    ├── home.js
    ├── gallery.js
    ├── login.js
    ├── upload.js
```

---
## 🗄 Supabase 설정

### 1. 테이블

**`artworks`** — 작품

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | int8 (PK) | 작품 ID |
| user_id | uuid | 등록한 회원 (`auth.users`) |
| title | text | 작품명 |
| artist | text | 작가명 |
| category | text | 추상화 / 인물화 / 풍경화 / 일러스트 |
| description | text | 작품 설명 |
| price | int8 | 구매가 (원) |
| rental_price | int8 | 월 대여료 (원) |
| image_url | text | 이미지 공개 URL |

### 2. Storage
- 버킷 이름 : `artworks_images` (**Public** 버킷)

### 3. 보안 (RLS)
`config.js`의 키는 브라우저에 노출되는 **publishable(anon) key**입니다.
따라서 **모든 테이블과 Storage에 Row Level Security(RLS)를 활성화**하고 정책을 설정했습니다.

- `artworks` : 누구나 조회(SELECT), 로그인 회원만 등록(INSERT)
- `Storage` : 로그인 회원만 업로드 /조회는 공개

### 개선 예정
- [] 작품 상세 페이지 (`detail.html`)
- [] 구매/대여 신청 기능 연결
- [] 내가 등록한 작품 수정/삭제