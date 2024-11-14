"use client"

import * as React from "react"
import { useEffect, useRef, useState } from 'react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable';
import * as XLSX from 'xlsx'; // xlsx 라이브러리 임포트
import ExcelDownloadButton from './download';
import { Groups } from './types';
import { getGroupData } from './getGroups';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from 'components/ui/select';

export default function Excel() {
    const initialData: string[][] = Array.from({ length: 50 }, () =>
      Array(11).fill("")
    );

    const [data, setData] = useState<string[][]>(initialData); // 초기 데이터를 기본 값으로 설정
    const [groupData, setGroupData] = useState<Groups[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const contactTableRef = useRef<Handsontable | null>(null);

    useEffect(() => {
        registerAllModules();

        const container = document.getElementById("hot-app");
        if (container && !contactTableRef.current) { // Handsontable이 없을 때만 초기화
            contactTableRef.current = new Handsontable(container, {
                data: data,
                rowHeaders: true,
                colHeaders: ['그룹명', '이름', '휴대폰', '[*1*]', '[*2*]', '[*3*]', '[*4*]', '[*5*]', '[*6*]', '[*7*]', '[*8*]'],
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
            if (contactTableRef.current && !contactTableRef.current.isDestroyed) { // 인스턴스가 존재하고 파괴되지 않은 경우에만 destroy 호출
                contactTableRef.current.destroy();
                contactTableRef.current = null; // 인스턴스를 null로 설정하여 재호출 방지
            }
        };
    }, []);

    // data 상태가 업데이트될 때 Handsontable 데이터를 동기화
    useEffect(() => {
        if (contactTableRef.current) {
            contactTableRef.current.loadData(data);
        }
    }, [data]);

    const fetchGroupData = async (userId: string) => {
        setIsLoading(true);
        const data = await getGroupData(userId);
        setGroupData(data);
        setIsLoading(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // 첫 번째 시트를 읽고, 시트 데이터를 JSON 배열로 변환
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                let jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // 각 행의 길이를 11로 고정
                jsonData = jsonData.map(row => {
                    if (row.length > 11) {
                        return row.slice(0, 11); // 11개 초과 시 잘라냄
                    } else if (row.length < 11) {
                        return [...row, ...Array(11 - row.length).fill("")]; // 11개 미만 시 빈 문자열 추가
                    }
                    return row;
                });

                // 전체 행 개수를 50개로 고정
                if (jsonData.length < 50) {
                    const rowsToAdd = 50 - jsonData.length;
                    jsonData = [...jsonData, ...Array(rowsToAdd).fill(Array(11).fill(""))];
                } else if (jsonData.length > 50) {
                    jsonData = jsonData.slice(0, 50); // 50개 초과 시 잘라냄
                }

                setData(jsonData); // 변환된 데이터를 data 상태에 주입
            };
            reader.readAsArrayBuffer(file);
        }
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
                        <SelectContent className="z-50">
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

            <div id="hot-app" className="relative z-10" /> <br /> <br />

            <label>
                엑셀 파일 업로드:
                <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" />
            </label> <br /> <br />

            <ExcelDownloadButton tableRef={contactTableRef} /> <br /> <br />

            <button onClick={loggingClick}>
                로그에 테이블 객체 상태 출력하기 (이후 저장하기로 변경)
            </button> <br /> <br />
        </main>
    );
}
