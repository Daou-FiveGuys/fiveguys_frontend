import Handsontable from 'handsontable';
import * as XLSX from 'xlsx';

interface ExcelDownloadButtonProps {
    tableRef: React.RefObject<Handsontable | null>;
}

export default function ExcelDownloadButton({ tableRef }: ExcelDownloadButtonProps) {
    // XLSX 파일 다운로드 함수
    const handleXlsxDownload = () => {
        if (!tableRef.current) return;

        // Handsontable 데이터 가져오기 (헤더 없이)
        const hotInstance = tableRef.current;
        const data = hotInstance.getData(); // 모든 데이터를 배열 형태로 가져옴

        // Handsontable 데이터를 XLSX 워크시트로 변환
        const worksheet = XLSX.utils.aoa_to_sheet(data); // 배열 데이터를 워크시트로 변환

        // 워크북 생성
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // 파일 다운로드
        XLSX.writeFile(workbook, `뿌리뿌리오_주소록_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <button onClick={handleXlsxDownload}>
            엑셀 파일 다운로드
        </button>
    );
}
