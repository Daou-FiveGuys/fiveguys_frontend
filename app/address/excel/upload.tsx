import React from 'react';

import * as XLSX from 'xlsx';

interface ExcelUploadProps {
    onFileUpload: (data: string[][]) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onFileUpload }) => {
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

                onFileUpload(jsonData); // 데이터를 상위 컴포넌트로 전달
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <label>
            엑셀 파일 업로드:
            <input type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" />
        </label>
    );
};

export default ExcelUpload;
