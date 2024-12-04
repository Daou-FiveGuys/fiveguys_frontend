<div align="center">
  <h1>
    🎨 Pa·Letter
  </h1>
  <h3>AI 챗봇 기반 문자 전송, 이미지 생성·편집 서비스</h3>
  <p align="center">
    <img alt="Static Badge" src="https://img.shields.io/badge/%EB%8D%B0%EB%AA%A8_%EB%B0%94%EB%A1%9C%EA%B0%80%EA%B8%B0-000000?style=plastic&logo=YouTube&logoColor=FFFFFF&label=YouTube&labelColor=FF0000">
  </p align="center">
</div>
<br/></br>

<img alt="onboading" src="https://github.com/user-attachments/assets/0c444956-303f-4e06-b9e9-2507a66ac44a" />

### 💡 서비스 개요

본 프로젝트는 다우기술 ‘뿌리오(Purio)’ 서비스의 고도화를 목표로, **LLM**과 **이미지 생성 AI(Flux.ai)** 를 결합한 **스마트 문자 전송 플랫폼**을 개발하였다.

기존 문자 발송 서비스는 단순한 텍스트 전송에 머물러 있어, **시각적 전달력 부족**과 **반복적인 문장 작성의 비효율성**이 존재했다.

이에 본 시스템은 대규모 언어 모델(LLM) 과 이미지 생성 모델(Flux.ai)을 활용하여  문자 내용에 적합한 문장과 **이미지를 자동 생성**하고,  사용자는 이를 수정·보완하여 고품질 마케팅 메시지를 완성할 수 있다.

또한 **RAG 기반 FAQ 챗봇 시스템**을 통해 ‘뿌리오’ 사용 관련 문의를 **실시간으로 처리**하며, AI 기반 번역·첨삭 기능을 통해 다국어 문자 발송에도 대응한다.

이미지 생성 후에는 편집 기능을 제공하여  생성된 이미지의 일부 수정, 이미지 텍스트 제거, 화질 개선 등의 세부 조정이 가능하다.  
이로써 사용자는 단일 플랫폼 내에서 `문자 작성 → 이미지 생성 → 편집 → 전송`의 전 과정을 자동화할 수 있다.

> [!NOTE]
> 🎨 Pa・letter는 LLM과 이미지 생성 AI를 결합해 문자 내용에 맞는 문장과 이미지를 자동 생성하고, 편집·전송까지 한 번에 처리할 수 있는 AI 기반 스마트 문자 전송 플랫폼입니다.

<br/>

### 🚀 핵심 기능 
| 이미지 생성 | 이미지 수정 |
| --- | --- |
| ![이미지 생성](https://github.com/user-attachments/assets/b31d5b3c-9642-428c-9077-4a67ad1b2605)| ![이미지 수정](https://github.com/user-attachments/assets/7839f3b2-012b-4d9f-907a-00360567b2e1) |
| AI 이미지 생성	Flux.ai 모델을 활용해 문자 맥락에 맞는 이미지를 자동 생성 | AI 이미지 보완	텍스트 제거(OpenCV, Photoroom API), 부분 수정(SDXL Inpaint), 화질 업그레이드(Real-ESRGAN) 기능 제공 | 


| RAG 챗봇 | AI 문자 추천 |
| --- | --- |
| ![RAG](https://github.com/user-attachments/assets/dd1fd196-f0bd-4bd4-940e-48e372733212) | ![추천](https://github.com/user-attachments/assets/e86d97ad-8bfd-4cab-ab87-f623e2a93ded) |
| RAG 기반 FAQ 챗봇	‘뿌리오’ 서비스 데이터를 활용하여 즉각적인 질의응답 및 서비스 안내 | AI 문자 추천 및 첨삭	대상과 목적에 맞는 문장 자동 생성, 수정, 다국어 번역 지원 | 

| 주소록 관리 | 문자 내역 |
| --- | --- |
| ![주소록](https://github.com/user-attachments/assets/e8554923-de2a-402c-85e5-749d9c423818) | ![문자내역](https://github.com/user-attachments/assets/3a49bff1-6fe2-4b56-a43a-dac6bd41f9d7) |
| 검색 기능과 필터링 기능을 추가하여 기능 보완 | 캘린더 기반 문자내역 관리 |

<br/>

### 📌 기대효과


| **효과** | **설명** |
|-----------|-----------|
| **업무 효율성 향상** | AI 기반 문자 작성 및 이미지 자동화를 통해 마케팅 콘텐츠 제작 시간을 대폭 단축 |
| **고객 응대 품질 개선** | FAQ 챗봇으로 문의 대응 속도 향상, 상담원 업무 부담 완화 |
| **시각적 전달력 강화** | 문자 내용에 최적화된 이미지 자동 생성으로 메시지 이해도 및 클릭률 향상 |
| **서비스 접근성 확장** | 다국어 번역 및 자동 추천 기능으로 다양한 사용자층 대응 |
| **운영비 절감** | 인력 중심의 상담 및 콘텐츠 제작 과정을 자동화하여 비용 절감 실현 |
| **사용자 경험 향상** | 직관적인 편집 UI와 실시간 피드백으로 높은 사용 만족도 제공 |

<br/>

### 🪏 기술 스택 및 시스템 아키텍쳐
<br/>
<div align="">
  
![Static Badge](https://img.shields.io/badge/Next.js-000000?style=plastic&logo=nextdotjs)
![Static Badge](https://img.shields.io/badge/Nginx-000000?style=plastic&logo=nginx&logoColor=009639)
![Static Badge](https://img.shields.io/badge/SpringBoot-000000?style=plastic&logo=springboot)
![Static Badge](https://img.shields.io/badge/Spring_Security-000000?style=plastic&logo=springsecurity)

![Static Badge](https://img.shields.io/badge/MariaDB-000000?style=plastic&logo=mariadb)
![Static Badge](https://img.shields.io/badge/Redis-000000?style=plastic&logo=stackbit&logoColor=FF4438)
![Static Badge](https://img.shields.io/badge/docker-000000?style=plastic&logo=docker)
![Static Badge](https://img.shields.io/badge/GitHub_Actions-000000?style=plastic&logo=githubactions)

![Static Badge](https://img.shields.io/badge/JIRA-000000?style=plastic&logo=jira&logoColor=0052CC)
![Static Badge](https://img.shields.io/badge/Figma-000000?style=plastic&logo=figma)
![Static Badge](https://img.shields.io/badge/Slack-000000?style=plastic&logo=slack)
![Static Badge](https://img.shields.io/badge/Confluence-000000?style=plastic&logo=confluence)

</div>
<br/>

![시스템 아키텍쳐](https://github.com/user-attachments/assets/2e8dc551-fc10-4dcb-93fa-b9f356ac2c18)



<br/>

### 🦊 팀 정보

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://github.com/6-keem.png" width="150" height="150" style="object-fit: cover;"><br>
        <a href="https://github.com/6-keem">@6-keem</a>
      </td>
      <td align="center">
        <img src="https://github.com/gomj-repo.png" width="150" height="150" style="object-fit: cover;"><br>
        <a href="https://github.com/junni01kim">@junni01kim</a>
      </td>
      <td align="center">
        <img src="https://github.com/KJH0506.png" width="150" height="150" style="object-fit: cover;"><br>
        <a href="https://github.com/KJH0506">@KJH0506</a>
      </td>
      <td align="center">
        <img src="https://github.com/HS-JNYLee.png" width="150" height="150" style="object-fit: cover;"><br>
        <a href="https://github.com/HS-JNYLee">@HS-JNYLee</a>
      </td>
      <td align="center">
        <img src="https://github.com/codingsimul.png" width="150" height="150" style="object-fit: cover;"><br>
        <a href="https://github.com/codingsimul">@codingsimul</a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <strong>PM & Full Stack</strong>
      </td>
      <td align="center">
        <strong>Full Stack</strong>
      </td>
      <td align="center">
        <strong>AI & Backend</strong>
      </td>
      <td align="center">
        <strong>Frontend & DevOps</strong>
      </td>
      <td align="center">
        <strong>Frontend</strong>
      </td>
    </tr>
  </table>
</div>

