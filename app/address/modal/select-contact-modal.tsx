'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import AddressBook from '../address-book'
import { Contact2 } from '../entity'
import { api, Target } from './service'

interface AddressBookModalProps {
  file: File // File passed from ParentComponent
  onClose: () => void // Close modal callback
  method: string
}

const AddressBookModal: React.FC<AddressBookModalProps> = ({
  file,
  onClose,
  method
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact2[]>([])
  const [inputValue, setInputValue] = useState('') // Sender's phone number

  /**
   * Handle contact selection based on type:
   * 1. Add
   * 2. Update
   * 3. Remove
   * 4. Clear All
   */
  const handleSelectContacts = (type: number, contact2: Contact2) => {
    setSelectedContacts(prevContacts => {
      let contacts = [...prevContacts]
      switch (type) {
        case 1: // Add
          if (
            !contacts.some(contact => contact.contactId === contact2.contactId)
          ) {
            contacts.push(contact2)
          }
          break
        case 2: // Update
          contacts = contacts.map(contact =>
            contact.contactId === contact2.contactId ? contact2 : contact
          )
          break
        case 3: // Remove
          contacts = contacts.filter(
            contact => contact.contactId !== contact2.contactId
          )
          break
        case 4: // Clear All
          contacts = []
          break
        default:
          break
      }
      return contacts
    })
  }

  /**
   * Handle sending the message with the selected contacts and file.
   */
  const handleSend = () => {
    if (!file) {
      alert('No file selected!')
      return
    }

    if (!inputValue) {
      alert("Please enter the sender's phone number.")
      return
    }

    const targets: Target[] = selectedContacts.map(contact => ({
      toNumber: contact.telNum,
      changeWord: {
        var1: contact.one || '',
        var2: contact.two || '',
        var3: contact.three || '',
        var4: contact.four || '',
        var5: contact.var5 || '',
        var6: contact.var6 || '',
        var7: contact.var7 || '',
        var8: contact.var8 || ''
      },
      name: contact.name
    }))

    // Define message parameters
    const messageType = 'MMS' // Adjust based on your requirements
    const fromNumber = inputValue
    const subject = '전송할 제목입니다.'
    const content = '안녕하세요 테스트중입니다.'

    api
      .sendMessage(
        {
          messageType,
          content,
          fromNumber,
          targets,
          subject
        },
        method,
        file
      )
      .then(() => {
        console.log('Message sent successfully.')
        onClose() // Close the modal after sending
      })
      .catch(error => {
        console.error('Error sending message:', error)
        alert('메시지 전송에 실패했습니다.')
      })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="fixed bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-[95vw] md:max-w-[1000px] z-50"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* AddressBook Component */}
        <div className="mt-4">
          <AddressBook onSelectContacts={handleSelectContacts} />
        </div>
        {/* Send Button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSend}
            disabled={selectedContacts.length === 0}
            className={`text-white ${
              selectedContacts.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            전송하기 ({selectedContacts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddressBookModal
