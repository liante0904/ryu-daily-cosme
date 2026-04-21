# RYU_ROUTINE Dashboard

RYU_ROUTINE은 지뜽(Ryu)의 효율적인 업무 루틴을 위한 미니멀리스트 대시보드입니다. 조나단 아이브 스타일의 정갈한 디자인과 강력한 키워드 관리 도구를 제공합니다.

🌐 **배포 사이트**: [https://ryu-cosme.netlify.app/](https://ryu-cosme.netlify.app/)

## ✨ 주요 기능

- **마피아 (네이버 키워드 도구)**:
  - 단일 및 일괄(쉼표 구분) 키워드 입력 지원
  - 드래그 앤 드롭을 통한 실시간 순서 변경
  - 스마트 수정 (수정 시 쉼표로 구분하면 여러 아이템으로 자동 분할 추가)
  - 일괄 추출 및 삭제 기능 (백업 지원)
  - 서버 연동용 파라미터 생성 기능
- **디자인 & UX**:
  - **The White Room**: 조나단 아이브 스타일의 고대비 미니멀 디자인
  - **The Dark Room**: 완벽하게 튜닝된 다크 모드 지원
  - **Frosted Glass**: 헤더 및 사이드바 블러 효과 적용
  - **Zero Flash**: 페이지 새로고침 시 테마 깜빡임 방지 로직 적용
  - **Dynamic Input**: 내용 길이에 따라 자동으로 확장되는 입력창

## 🚀 시작하기

### 설치
```bash
npm install
```

### 로컬 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 🛠 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS Modules (Apple Minimalist Style)
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable

---
Developed by Ryu. Minimalist Design, Maximum Efficiency.
