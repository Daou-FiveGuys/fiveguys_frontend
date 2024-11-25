import Link from 'next/dist/client/link'
import AddressBookModal from './select-contact-modal'
import { useState } from 'react'

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [method, setMethod] = useState<string>('image')
    const [file, setFile] = useState<File | null>(null)
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setFile(null)
      }


      
    return (
        <main className="container mx-auto p-4">
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