import Handsontable from 'handsontable';

interface ExcelDownloadButtonProps {
    tableRef: React.RefObject<Handsontable | null>;
}

export default function ExcelDownloadButton({ tableRef }: ExcelDownloadButtonProps) {
    // 엑셀 파일 다운로드 함수
    const handleCsvDownload = () => {
        const exportPlugin = tableRef.current?.getPlugin('exportFile');
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

    return (
        <button onClick={handleCsvDownload}>
            엑셀 파일 다운로드
        </button>
    );
}
