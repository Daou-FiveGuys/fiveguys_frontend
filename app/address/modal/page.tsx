'use client'

import AddressBookModal from './select-contact-modal'
import { ChangeEvent, useState } from 'react'
import { Input } from '@/components/ui/input'

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [method, setMethod] = useState<string>('image')
    const [file, setFile] = useState<File | null>(null)
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setFile(null)
      }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null
        setFile(selectedFile)
        if (selectedFile) {
            setIsModalOpen(true) // 파일 선택 시 모달 열기
        }
    }
      
    return (
        <main className="container mx-auto p-4">
            {/* ※ 임시코드!!!! 모달 적용하는 사람은 해당 정보 삭제할 것 */}
            <label htmlFor="file-upload" className="cursor-pointer">
                업로드할 파일 선택
            </label>
            <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".jpg, .jpeg"
                className="hidden"
            />

            {isModalOpen && file && (
                <AddressBookModal
                    file={file}
                    onClose={handleCloseModal}
                    method={method}
                />
            )}
        </main>
    )
}