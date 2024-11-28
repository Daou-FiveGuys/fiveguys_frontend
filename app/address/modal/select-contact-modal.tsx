'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import AddressBook from '../address-book'
import { Contact2 } from '../entity'
import { api, Target } from './service'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import ChatUtils from '@/components/chat/utils/ChatUtils'

interface AddressBookModalProps {
  file?: File | null // File passed from ParentComponent
  onClose: () => void // Close modal callback
  method: string
}

const AddressBookModal: React.FC<AddressBookModalProps> = ({
  file,
  onClose,
  method
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact2[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('')
  const content = useSelector(
    (state: RootState) => state.messageOption
  ).content!
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
    const messageType = file ? 'MMS' : 'LMS' // Adjust based on your requirements
    const subject = ''

    // Determine scheduled date
    const scheduledDate = isScheduled ? scheduledDateTime || null : null
    const formattedScheduledDate = scheduledDateTime
      ? new Date(scheduledDateTime).toISOString()
      : null
    api
      .sendMessage(
        {
          messageType,
          content,
          targets,
          subject,
          ...(isScheduled && formattedScheduledDate
            ? { scheduledDate: formattedScheduledDate }
            : {})
        },
        method,
        file || undefined
      )
      .then(() => {
        ChatUtils.addChat(
          'create-message',
          'assistant-animation-html',
          '<div>문자 전송을 완료했어요! 👏🏻</div>'
        )
      })
      .catch(error => {
        ChatUtils.addChat(
          'create-message',
          'assistant-animation-html',
          '<div>문자 전송에 실패했어요ㅠ 😭</div>'
        )
      })
      .finally(() => {
        onClose()
      })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="fixed bg-white dark:bg-zinc-800 rounded-2xl shadow-lg w-full max-w-[95vw] md:max-w-[1000px] z-50"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center mt-4 justify-between">
          {/* 예약 발송 스위치와 라벨 */}
          <div className="flex items-center">
            <Switch
              id="schedule-switch"
              checked={isScheduled}
              onCheckedChange={setIsScheduled}
            />
            <Label
              htmlFor="schedule-switch"
              className="ml-2 text-gray-700 dark:text-gray-300"
            >
              예약 발송
            </Label>
          </div>

          {/* 날짜/시간 입력 필드 */}
          {isScheduled && (
            <Input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={e => setScheduledDateTime(e.target.value)}
              className="w-[240px] mx-4"
            />
          )}

          {/* 전송 버튼 */}
          <Button
            onClick={handleSend}
            disabled={selectedContacts.length === 0}
            className={`text-white ${
              selectedContacts.length === 0
                ? 'bg-zinc-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            전송하기 ({selectedContacts.length})
          </Button>
        </div>

        {/* AddressBook Component */}
        <div className="mt-4">
          <AddressBook onSelectContacts={handleSelectContacts} />
        </div>

        {/* Send Button and DateTime Picker */}
      </DialogContent>
    </Dialog>
  )
}

export default AddressBookModal
