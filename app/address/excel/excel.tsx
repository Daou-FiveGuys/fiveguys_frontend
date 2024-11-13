"use client"

import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { useEffect } from 'react';

export default function Excel() {
    // 50개의 행을 추가 (원래는 50,000인데, 너무 많아서 줄임)
    let data = []
    for (let i = 1; i <= 50; i++) {
        data.push(["", "", "", "", "", "", "", "", "", "", ""]);
    }

    // 
    let colHeaders = ['그룹명', '이름', '휴대폰', '[*1*]', '[*2*]', '[*3*]', '[*4*]', '[*5*]', '[*6*]', '[*7*]', '[*8*]']

    const loggingClick = () => {
        console.log(data);
    };
    
    useEffect(() => {
        registerAllModules();
    }, []);

    console.log("테스트")
    return (
        // TODO: 1. 엑셀 업로드
        
        // TODO: 2. 엑셀 다운로드

        // TODO: 테이블 자체를 중앙정렬 할 것
        <main>  
            <HotTable
                data={data}
                rowHeaders={true}
                colHeaders={colHeaders}
                height="300"
                rowHeights={20}
                className={'htCenter htMiddle'} // row Header는 중앙정렬 안된 상태
                autoWrapRow={true}
                autoWrapCol={true}
                width="auto"
                colWidths={110} // 하드코딩
                licenseKey="non-commercial-and-evaluation" // 학생은 라이선스 없이 무료로 사용 가능
            />
            {/* TODO: 3. 변수 추가 누를 시 [*8*] 까지 늘리기 <그냥 8까지 늘림>*/}
            <button onClick={loggingClick}>로그에 테이블 객체 상태 출력하기 (이후 저장하기로 변경)</button>
        </main>
    );
}