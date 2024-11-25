'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Contact2 } from './entity'
import { CustomSelect } from './address-book'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Edit2, Eye, Trash2 } from 'lucide-react'

// AddressListView 컴포넌트의 props 타입 정의
interface AddressListViewProps {
  addresses: Contact2[]
  updateAddress: (address: Contact2) => Promise<void>
  deleteAddress: (id: number) => Promise<void>
  isLoading: boolean
  onSelectContacts: (type: number, contact2: Contact2) => void
}

export default function AddressListView({
  addresses = [],
  updateAddress,
  deleteAddress,
  isLoading,
  onSelectContacts
}: AddressListViewProps) {
  const [sortOrder, setSortOrder] = useState<'name' | 'phone'>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Contact2 | null>(null)
  const itemsPerPage = 10

  // 선택된 연락처가 변경될 때마다 부모 컴포넌트에 알림
  // useEffect(() => {
  // const selectedContacts = addresses.filter(address => selectedAddresses.includes(address.contactId));
  // onSelectContacts(selectedContacts);
  // }, [selectedAddresses, addresses, onSelectContacts]);

  // 주소 정렬
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name)
    } else {
      return a.telNum.localeCompare(b.telNum)
    }
  })

  // 페이지네이션
  const paginatedAddresses = sortedAddresses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(addresses.length / itemsPerPage)

  //onSelectContacts가 undefined일 경우를 대비한 안전장치
  const safeOnSelectContacts = (type: number, contact2: Contact2) => {
    if (typeof onSelectContacts === 'function') {
      onSelectContacts(type, contact2)
    } else {
      console.error('onSelectContacts is not a function')
    }
  }

  // 전체 선택/해제 토글
  const toggleSelectAll = () => {
    if (selectedAddresses.length === paginatedAddresses.length) {
      setSelectedAddresses([])
      safeOnSelectContacts(4, {
        contactId: 0,
        name: '',
        telNum: '',
        one: '',
        two: '',
        three: '',
        four: '',
        var5: '',
        var6: '',
        var7: '',
        var8: ''
      })
    } else {
      setSelectedAddresses(paginatedAddresses.map(a => a.contactId))
      paginatedAddresses.forEach(contact => safeOnSelectContacts(1, contact))
    }
  }

  // 개별 주소 선택/해제 토글
  const toggleSelect = (contact2: Contact2) => {
    if (selectedAddresses.includes(contact2.contactId)) {
      setSelectedAddresses(
        selectedAddresses.filter(a => a !== contact2.contactId)
      )
      safeOnSelectContacts(3, contact2)
    } else {
      setSelectedAddresses([...selectedAddresses, contact2.contactId])
      safeOnSelectContacts(1, contact2)
    }
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center space-x-4 mb-4 px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
        <Checkbox
          id="select-all"
          checked={selectedAddresses.length === paginatedAddresses.length}
          onCheckedChange={toggleSelectAll}
          className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
        <Label htmlFor="select-all" className="font-bold flex-grow-0 w-1/3">
          이름
        </Label>
        <span className="font-bold w-1/3">휴대폰</span>
        <CustomSelect
          value={sortOrder}
          onChange={(value: 'name' | 'phone') => setSortOrder(value)}
          options={[
            { value: 'name', label: '이름순' },
            { value: 'phone', label: '전화번호순' }
          ]}
          className="w-40"
        />
        <span className="w-24"></span>
      </div>

      {/* 주소 목록 */}
      <AnimatePresence>
        {paginatedAddresses.map(address => (
          <motion.div
            key={address.contactId}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-lg transition-colors duration-200"
          >
            <Checkbox
              id={`select-${address.contactId}`}
              checked={selectedAddresses.includes(address.contactId)}
              onCheckedChange={() => toggleSelect(address)}
              className="border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Label
              htmlFor={`select-${address.contactId}`}
              className="flex-grow-0 w-1/3"
            >
              {address.name}
            </Label>
            <span className="w-1/3">{address.telNum}</span>
            <div className="w-24 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full"
                onClick={() => {
                  setSelectedAddress(address)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">수정</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                onClick={() => {
                  setSelectedAddress(address)
                  setIsViewDialogOpen(true)
                }}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">상세보기</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 페이지네이션 */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => setCurrentPage(page)}
            className={`rounded-full w-10 h-10 ${
              currentPage === page ? 'bg-blue-500 text-white' : 'text-blue-500'
            }`}
          >
            {page}
          </Button>
        ))}
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주소 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <Input
                id="name"
                value={selectedAddress?.name || ''}
                onChange={e =>
                  setSelectedAddress(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telNum" className="text-right">
                전화번호
              </Label>
              <Input
                id="telNum"
                value={selectedAddress?.telNum || ''}
                onChange={e =>
                  setSelectedAddress(prev =>
                    prev ? { ...prev, telNum: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            {['one', 'two', 'three', 'four'].map((varName, index) => (
              <div
                key={varName}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor={varName} className="text-right">
                  {`변수 ${index + 1}`}
                </Label>
                <Input
                  id={varName}
                  value={selectedAddress?.[varName as keyof Contact2] || ''}
                  onChange={e =>
                    setSelectedAddress(prev =>
                      prev ? { ...prev, [varName]: e.target.value } : null
                    )
                  }
                  className="col-span-3"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={() => {
              if (selectedAddress) {
                updateAddress(selectedAddress)
                setIsEditDialogOpen(false)
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* 상세 보기 다이얼로그 */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주소 상세 정보</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {['name', 'telNum', 'one', 'two', 'three', 'four'].map(
              (field, index) => (
                <div
                  key={field}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label className="text-right font-bold">
                    {field === 'name'
                      ? '이름'
                      : field === 'telNum'
                        ? '전화번호'
                        : `변수 ${index + 1}`}
                    :
                  </Label>
                  <span className="col-span-3">
                    {selectedAddress?.[field as keyof Contact2]}
                  </span>
                </div>
              )
            )}
          </div>
          <Button
            onClick={() => {
              if (selectedAddress) {
                deleteAddress(selectedAddress.contactId)
                setIsViewDialogOpen(false)
              }
            }}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
