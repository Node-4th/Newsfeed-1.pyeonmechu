![image](https://github.com/Node-4th/Newsfeed-1.pyeonmechu/assets/154207883/e6969047-1d6e-489e-90b2-a567a3d397d1)


# 편메추  
편의점 음식에 한해 상품을 추천하고, 맛있는 메뉴 조합을 공유하고, 편의점과 관련한 이벤트/할인 정보를 제공하는 웹 사이트(api)  
- :point_right: <a href="https://www.youtube.com/watch?v=gSYeb3seVBw">시연 영상</a> :point_left:  
- <a href="https://drawsql.app/teams/me-662/diagrams/pyeonmechu">ERD</a>
- `.env`
  - DATABASE_URL
  - ACCESS_TOKEN_SECRET_KEY
  - REFRESH_TOKEN_SECRET_KEY
  - EMAIL_VERIFY_TOKEN_KEY
  - SMTP_ID_KEY
  - SMTP_PW_KEY
  - S3_KEY
  - S3_SECRET
  - S3_BUCKET_NAME
- ***keyword***  
📌 `express.js` `prisma` `jsonwebtoken` `multer` `nodemailer` `bcrypt` `ejs`   
➕ `node.js` `yarn` `ES6 module system` `mysql` `AWS EC2` `AWS RDS` `AWS S3`  

개발 기간 : 2024.02.07 ~ 2024.02.15 프로젝트 기간 끝

## 완희조(1조) 팀원

**오다은** https://github.com/ooheunda  
역할: 팀장, PR 관리, 좋아요/싫어요 기능

**서 린** https://github.com/slianzg  
역할: 댓글 CRUD, 팔로우 기능

**조완희** https://github.com/wanhee27  
역할: 인증/인가 관련 CRUD, access/refresh token 관련 기능

**강영우** https://github.com/young970319  
역할: 게시글 CRUD, 프론트엔드(ejs)

**박재형** https://github.com/jaecoder222  
역할: 유저 프로필 CRUD, S3 미디어 파일 넣기, 프론트엔드(ejs)

## 👔 구현 기능
- [x] 사용자 인증
  - **post** 회원가입
  - **post** 로그인 및 로그아웃
  - **post** 리프레쉬 토큰으로 액세스 토큰 재발급
  - 인가 미들웨어
- [x] 이메일 가입 및 인증 기능
- [x] 프로필 관리
  - **get** 유저 프로필 조회
  - **patch** 유저 프로필 수정
  - **get** 다른 유저 프로필 & 게시글 모아보기
  - **delete** 회원 탈퇴
- [x] 프로필에 사진 업로드 기능
- [x] 게시물 CRUD 기능
  - **post** 게시글 생성
  - **get** 게시글 상세 조회
  - **patch** 게시글 수정
  - **delete** 게시글 삭제
- [x] 댓글 CRUD 기능
  - **post** 댓글 생성
  - **get** 댓글 조회
  - **patch** 댓글 수정
  - **delete** 댓글 삭제
- [x] 뉴스 피드 기능
  - **get** 메뉴 추천 게시판 조회
  - **get** 조합 공유 게시판 조회
  - **get** 이벤트 정보 게시판 조회
  - **get** 팔로잉 유저 피드 조회
- [x] 좋아요 기능
  - **post** 게시글 좋아요/싫어요
  - **post** 댓글 좋아요/싫어요
- [x] 팔로우 기능
  - **post** 유저 팔로우/언팔로우
  - **get** 유저 팔로잉/팔로워 목록 조회
