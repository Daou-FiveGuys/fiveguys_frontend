"use client"

import { useEffect, useRef } from 'react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable';

export default function Excel() {
    // 50개의 행을 추가 (원래는 50,000인데, 너무 많아서 줄임)
    let data = [];
    for (let i = 1; i <= 50; i++) {
        data.push(["", "", "", "", "", "", "", "", "", "", ""]);
    }

    // 테이블의 컬럼명
    let colHeaders = ['그룹명', '이름', '휴대폰', '[*1*]', '[*2*]', '[*3*]', '[*4*]', '[*5*]', '[*6*]', '[*7*]', '[*8*]'];

    // Handsontable 인스턴스를 저장할 ref
    const myTableRef = useRef<Handsontable | null>(null); 

    useEffect(() => {
        registerAllModules();

        const container = document.getElementById("hot-app");
        if (container) {
            // Handsontable 인스턴스 생성
            myTableRef.current = new Handsontable(container, {
                data: data,
                rowHeaders: true,
                colHeaders: colHeaders,
                height: "300",
                rowHeights: 20,
                className: 'htCenter htMiddle', // row Header는 중앙정렬 안된 상태
                autoWrapRow: true,
                autoWrapCol: true,
                width: "auto",
                colWidths: 110, // 하드코딩
                licenseKey: "non-commercial-and-evaluation", // 학생은 라이선스 없이 무료로 사용 가능
            });
        }

        // 컴포넌트 언마운트 시 Handsontable 인스턴스 제거
        return () => {
            myTableRef.current?.destroy();
        };
    }, [data]); // data가 변경될 때마다 effect 실행

    // TODO: 영어만 가능
    // 테이블 정보를 csv로 반환하는 함수
    const csvDownload = () => {
        const exportPlugin = myTableRef.current?.getPlugin("exportFile");
        exportPlugin?.downloadFile('csv', {
            bom: false,
            columnDelimiter: ',',
            columnHeaders: false,
            exportHiddenColumns: true,
            exportHiddenRows: true,
            fileExtension: 'csv',
            filename: '뿌리뿌리오_주소록_[YYYY]-[MM]-[DD]', // TODO: 주소록 그룹 명으로 출력할 것
            mimeType: 'text/csv',
            rowDelimiter: '\r\n',
            rowHeaders: false,
          });
    };

    // 테이블 객체 내용을 콘솔창에 출력하는 함수
    const loggingClick = () => {
        console.log(data);
    };

    return (
        // TODO: 1. 엑셀 업로드
        
        // TODO: 테이블 자체를 중앙정렬 할 것
        <main>  
            <div id="hot-app" />
            <button onClick={csvDownload}>엑셀 파일 다운로드</button><br/>
            <button onClick={loggingClick}>로그에 테이블 객체 상태 출력하기 (이후 저장하기로 변경)</button>
        </main>
    );
}