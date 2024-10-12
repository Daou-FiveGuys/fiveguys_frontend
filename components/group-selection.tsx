import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GroupSelectionProps {
  onGroupSelect: (group: string) => void
}

export function GroupSelection({ onGroupSelect }: GroupSelectionProps) {
  const [groupName, setGroupName] = useState('')

  const handleNoGroup = () => {
    onGroupSelect('default')
  }

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (groupName.trim()) {
      onGroupSelect(groupName.trim())
    }
  }

  return (
    <div className="mt-4">
      <p className="mb-2">그룹명을 설정하시겠습니까?</p>
      <div className="flex space-x-2">
        <Button onClick={handleNoGroup} variant="outline">아니오</Button>
        <form onSubmit={handleGroupSubmit} className="flex space-x-2">
          <Input
            type="text"
            placeholder="그룹명 입력"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Button type="submit">설정</Button>
        </form>
      </div>
    </div>
  )
}