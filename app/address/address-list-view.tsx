'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Contact2 } from './entity';
import { CustomSelect } from './address-book'; // CustomSelect가 address-book에 있는 경우 수정

export default function AddressListView({
  addresses,
  updateAddress,
  deleteAddress,
  isLoading,
}: any) {
  const [sortOrder, setSortOrder] = useState<'name' | 'phone'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Contact2 | null>(null);
  const itemsPerPage = 10;

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.phoneNumber.localeCompare(b.phoneNumber);
    }
  });

  const paginatedAddresses = sortedAddresses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(addresses.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedAddresses.length === paginatedAddresses.length) {
      setSelectedAddresses([]);
    } else {
      setSelectedAddresses(paginatedAddresses.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedAddresses.includes(id)) {
      setSelectedAddresses(selectedAddresses.filter((a) => a !== id));
    } else {
      setSelectedAddresses([...selectedAddresses, id]);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="w-8 h-8 flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedAddresses.length === paginatedAddresses.length}
            onChange={toggleSelectAll}
            className="rounded text-blue-500 focus:ring-blue-500"
          />
        </div>
        <span className="font-bold flex-grow-0 w-1/3">이름</span>
        <span className="font-bold w-1/3">휴대폰</span>
        <CustomSelect
          value={sortOrder}
          onChange={(value: 'name' | 'phone') => setSortOrder(value)}
          options={[
            { value: 'name', label: '이름순' },
            { value: 'phone', label: '전화번호순' },
          ]}
          className="w-40"
        />
        <span className="w-24"></span>
      </div>
      <AnimatePresence>
        {paginatedAddresses.map((address) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectedAddresses.includes(address.id)}
                onChange={() => toggleSelect(address.id)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
            </div>
            <span className="flex-grow-0 w-1/3">{address.name}</span>
            <span className="w-1/3">{address.phoneNumber}</span>
            <div className="w-24 flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                onClick={() => {
                  setSelectedAddress(address);
                  setIsEditDialogOpen(true);
                }}
              >
                수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg"
                onClick={() => {
                  setSelectedAddress(address);
                  setIsViewDialogOpen(true);
                }}
              >
                상세보기
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => setCurrentPage(page)}
            className={`rounded-lg w-10 h-10 ${
              currentPage === page ? 'bg-blue-500 text-white' : 'text-blue-500'
            }`}
          >
            {page}
          </Button>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주소 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="이름"
              value={selectedAddress?.name || ''}
              onChange={(e) =>
                setSelectedAddress((prev) =>
                  prev ? { ...prev, name: e.target.value } : null,
                )
              }
            />
            <Input
              placeholder="전화번호"
              value={selectedAddress?.telNum || ''}
              onChange={(e) =>
                setSelectedAddress((prev) =>
                  prev ? { ...prev, phoneNumber: e.target.value } : null,
                )
              }
            />
            <Input
              placeholder="변수 1"
              value={selectedAddress?.var1 || ''}
              onChange={(e) =>
                setSelectedAddress((prev) =>
                  prev ? { ...prev, var1: e.target.value } : null,
                )
              }
            />
            <Input
              placeholder="변수 2"
              value={selectedAddress?.var2 || ''}
              onChange={(e) =>
                setSelectedAddress((prev) =>
                  prev ? { ...prev, var2: e.target.value } : null,
                )
              }
            />
            <Input
              placeholder="변수 3"
              value={selectedAddress?.var3 || ''}
              onChange={(e) =>
                setSelectedAddress((prev) =>
                  prev ? { ...prev, var3: e.target.value } : null,
                )
              }
            />
            <Input
              placeholder="변수 4"
              value={selectedAddress?.var4 || ''}
              onChange={(e) =>
                setSelectedAddress((prev) =>
                  prev ? { ...prev, var4: e.target.value } : null,
                )
              }
            />
            <Button
              onClick={() => selectedAddress && updateAddress(selectedAddress)}
              disabled={isLoading}
            >
              {isLoading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주소 상세 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>이름:</strong> {selectedAddress?.name}
            </p>
            <p>
              <strong>전화번호:</strong> {selectedAddress?.telNum}
            </p>
            <p>
              <strong>변수 1:</strong> {selectedAddress?.var1}
            </p>
            <p>
              <strong>변수 2:</strong> {selectedAddress?.var2}
            </p>
            <p>
              <strong>변수 3:</strong> {selectedAddress?.var3}
            </p>
            <p>
              <strong>변수 4:</strong> {selectedAddress?.var4}
            </p>
          </div>
          <Button
            onClick={() => {
              if (selectedAddress) {
                deleteAddress(selectedAddress.contactId);
                setIsViewDialogOpen(false);
              }
            }}
            disabled={isLoading}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
