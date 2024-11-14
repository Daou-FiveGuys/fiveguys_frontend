"use client";

import { useEffect, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable';
import ExcelDownloadButton from './download';
import { Groups } from './types';
import { getGroupData } from './getGroups';

export default function Excel() {
    let data: string[][] = [];
    for (let i = 1; i <= 50; i++) data.push(["", "", "", "", "", "", "", "", "", "", ""]);

    let colHeaders = ['그룹명', '이름', '휴대폰', '[*1*]', '[*2*]', '[*3*]', '[*4*]', '[*5*]', '[*6*]', '[*7*]', '[*8*]'];

    const contactTableRef = useRef<Handsontable | null>(null);
    const [groupData, setGroupData] = useState<Groups[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        registerAllModules();

        const container = document.getElementById("hot-app");
        if (container) {
            contactTableRef.current = new Handsontable(container, {
                language: "ko-KR.js",
                data: data,
                rowHeaders: true,
                colHeaders: colHeaders,
                height: "300",
                rowHeights: 20,
                className: 'htCenter htMiddle',
                autoWrapRow: true,
                autoWrapCol: true,
                width: "auto",
                colWidths: 110,
                licenseKey: "non-commercial-and-evaluation",
            });
        }

        // 그룹 데이터 가져오기
        fetchGroupData('userId'); // 실제 userId로 대체

        return () => {
            contactTableRef.current?.destroy();
        };
    }, []);

    const fetchGroupData = async (userId: string) => {
        setIsLoading(true);
        const data = await getGroupData(userId);
        setGroupData(data);
        setIsLoading(false);
    };

    const loggingClick = () => {
        console.log(data);
    };

    return (
        <main>
            {/* 결과값이 나올 공간 */}
            <div>
                {isLoading ? (
                    <p>그룹 데이터를 불러오는 중...</p>
                ) : groupData.length > 0 ? (
                    groupData.map((group, index) => (
                        <p key={index}>{group.groupsName}</p> // 각 groupsName을 출력
                    ))
                ) : (
                    <p>데이터가 없습니다.</p>
                )}
            </div> <br /> <br />

            <div id="hot-app" /> <br /> <br />

            <ExcelDownloadButton tableRef={contactTableRef} /> <br /> <br />

            <button onClick={loggingClick}>
                로그에 테이블 객체 상태 출력하기 (이후 저장하기로 변경)
            </button> <br /> <br />
        </main>
    );
}
