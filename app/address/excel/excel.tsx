"use client"

import * as React from "react"
import { useEffect, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable';
import ExcelDownloadButton from './download';
import { Groups } from './types';
import { getGroupData } from './getGroups';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from 'components/ui/select' // Select 컴포넌트 경로

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
            <div>
                {isLoading ? (
                    <p>그룹 데이터를 불러오는 중...</p>
                ) : groupData.length > 0 ? (
                    <Select>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Group by" />
                        </SelectTrigger>
                        <SelectContent className="z-50"> {/* 높은 z-index 적용 */}
                            {groupData.map((group) => (
                                <SelectItem key={group.groupsId} value={group.groupsId.toString()}>
                                    {group.groupsName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <p>데이터가 없습니다.</p>
                )}
            </div> <br /> <br />

            <div id="hot-app" className="relative z-10" /> <br /> <br /> {/* z-index 낮게 설정 */}

            <ExcelDownloadButton tableRef={contactTableRef} /> <br /> <br />

            <button onClick={loggingClick}>
                로그에 테이블 객체 상태 출력하기 (이후 저장하기로 변경)
            </button> <br /> <br />
        </main>
    );
}
