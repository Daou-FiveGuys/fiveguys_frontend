'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddressBook from '../address-book'

export default function AddressBookModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClose = () => setIsModalOpen(false)

  return (
    <div className="p-8">
      {/* Trigger Button */}
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
        onClick={() => setIsModalOpen(true)}
      >
        주소록 열기
      </Button>

      {/* Conditional Rendering for Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
    
          {/* Modal Content */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent
              className="fixed bg-white dark:bg-gray-400 rounded-2xl shadow-lg w-full max-w-[95vw] md:max-w-[1000px] z-50"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()} // Prevent background click propagation
            >
              {/* AddressBook Component */}
              <div className="mt-4">
                <AddressBook />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}
