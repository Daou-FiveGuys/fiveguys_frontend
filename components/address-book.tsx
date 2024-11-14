'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Folder, FolderTree } from '@/components/ui/folder'

export type AddressEntry = {
  id: string
  name: string
  phoneNumber: string
  var1?: string
  var2?: string
  var3?: string
  var4?: string
}

type SearchResult = {
  folder: Folder
  addresses: AddressEntry[]
}

export const CustomSelect = ({
  value,
  onChange,
  options,
  className = ''
}: any) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      >
        {options.find((opt: any) => opt.value === value)?.label}
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {options.map((option: any) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AddressBook() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilter, setSearchFilter] = useState<'name' | 'phone' | 'both'>(
    'both'
  )
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'root', name: '기본 폴더', subFolders: [], addresses: [] }
  ])
  const [currentFolder, setCurrentFolder] = useState<Folder>(folders[0])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState<Partial<AddressEntry>>({})
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const handleSearch = useCallback(() => {
    const results: SearchResult[] = []

    const searchFolder = (folder: Folder) => {
      const matchedAddresses = folder.addresses.filter(address => {
        if (searchFilter === 'name' || searchFilter === 'both') {
          if (address.name.toLowerCase().includes(searchTerm.toLowerCase()))
            return true
        }
        if (searchFilter === 'phone' || searchFilter === 'both') {
          if (address.phoneNumber.includes(searchTerm)) return true
        }
        return false
      })

      if (matchedAddresses.length > 0) {
        results.push({ folder, addresses: matchedAddresses })
      }

      folder.subFolders.forEach(searchFolder)
    }

    folders.forEach(searchFolder)
    setSearchResults(results)
  }, [searchTerm, searchFilter, folders])

  const handleReset = useCallback(() => {
    setSearchTerm('')
    setSearchFilter('both')
    setSearchResults([])
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      } else if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        handleReset()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSearch, handleReset])

  const addFolder = (name: string) => {
    if (name.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: name.trim(),
        subFolders: [],
        addresses: []
      }
      setFolders([...folders, newFolder])
    }
  }

  const addAddress = () => {
    if (newAddress.name && newAddress.phoneNumber) {
      const address: AddressEntry = {
        id: Date.now().toString(),
        name: newAddress.name,
        phoneNumber: newAddress.phoneNumber,
        var1: newAddress.var1,
        var2: newAddress.var2,
        var3: newAddress.var3,
        var4: newAddress.var4
      }
      currentFolder.addresses.push(address)
      setFolders([...folders])
      setNewAddress({})
      setIsAddingAddress(false)
    }
  }

  const getBreadcrumbPath = (folder: Folder): Folder[] => {
    const path: Folder[] = []
    let currentFolder: Folder | undefined = folder

    const findParent = (
      folders: Folder[],
      targetId: string
    ): Folder | undefined => {
      for (const f of folders) {
        if (f.subFolders.some(sf => sf.id === targetId)) {
          return f
        }
        const found = findParent(f.subFolders, targetId)
        if (found) return found
      }
      return undefined
    }

    while (currentFolder) {
      path.unshift(currentFolder)
      currentFolder = findParent(folders, currentFolder.id)
    }
    return path
  }

  return (
    <div className="p-8 flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex space-x-4 mb-8"
      >
        <CustomSelect
          value={searchFilter}
          onChange={(value: any) => setSearchFilter(value)}
          options={[
            { value: 'name', label: '이름' },
            { value: 'phone', label: '전화번호' },
            { value: 'both', label: '이름과 전화번호' }
          ]}
          className="w-48"
        />
        <div className="relative flex-grow">
          <Input
            className="pl-12 pr-20 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            placeholder="검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearch}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>검색 Enter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>초기화 Ctrl+R</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>
      <div className="flex flex-grow bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4">
          <FolderTree
            folders={folders}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            addFolder={addFolder}
            setFolders={setFolders}
          />
        </div>
        <div className="w-2/3 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{currentFolder.name}</h2>
            <Button
              onClick={() => setIsAddingAddress(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              주소 추가
            </Button>
          </div>
          <div className="flex items-center space-x-4 mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="font-bold flex-grow">이름</span>
            <span className="font-bold w-1/3">휴대폰</span>
            <span className="w-24"></span>
          </div>
          <Breadcrumb>
            {getBreadcrumbPath(currentFolder).map((folder, index, array) => (
              <BreadcrumbItem key={folder.id}>
                <BreadcrumbLink onClick={() => setCurrentFolder(folder)}>
                  {folder.name}
                </BreadcrumbLink>
                {index < array.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
          {searchResults.length > 0 ? (
            <SearchResultsView
              searchResults={searchResults}
              setFolders={setFolders}
              folders={folders}
              setCurrentFolder={setCurrentFolder}
            />
          ) : (
            <AddressListView
              addresses={currentFolder.addresses}
              setFolders={setFolders}
              folders={folders}
              currentFolder={currentFolder}
            />
          )}
        </div>
      </div>
      <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              새 주소 추가
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="이름"
              value={newAddress.name || ''}
              onChange={e =>
                setNewAddress({ ...newAddress, name: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="전화번호"
              value={newAddress.phoneNumber || ''}
              onChange={e =>
                setNewAddress({ ...newAddress, phoneNumber: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 1"
              value={newAddress.var1 || ''}
              onChange={e =>
                setNewAddress({ ...newAddress, var1: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 2"
              value={newAddress.var2 || ''}
              onChange={e =>
                setNewAddress({ ...newAddress, var2: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 3"
              value={newAddress.var3 || ''}
              onChange={e =>
                setNewAddress({ ...newAddress, var3: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 4"
              value={newAddress.var4 || ''}
              onChange={e =>
                setNewAddress({ ...newAddress, var4: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddingAddress(false)}
                className="rounded-lg"
              >
                취소
              </Button>
              <Button
                onClick={addAddress}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SearchResultsView({
  searchResults,
  setFolders,
  folders,
  setCurrentFolder
}: any) {
  return (
    <div>
      {searchResults.map((result: any, index: any) => (
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{result.folder.name}</h3>
          <AddressListView
            addresses={result.addresses}
            setFolders={setFolders}
            folders={folders}
            currentFolder={result.folder}
            setCurrentFolder={setCurrentFolder}
          />
        </div>
      ))}
    </div>
  )
}

function AddressListView({
  addresses,
  setFolders,
  folders,
  currentFolder,
  setCurrentFolder
}: any) {
  const [sortOrder, setSortOrder] = useState<'name' | 'phone'>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<AddressEntry | null>(
    null
  )
  const itemsPerPage = 10

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name)
    } else {
      return a.phoneNumber.localeCompare(b.phoneNumber)
    }
  })

  const paginatedAddresses = sortedAddresses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(addresses.length / itemsPerPage)

  const toggleSelectAll = () => {
    if (selectedAddresses.length === paginatedAddresses.length) {
      setSelectedAddresses([])
    } else {
      setSelectedAddresses(paginatedAddresses.map(a => a.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedAddresses.includes(id)) {
      setSelectedAddresses(selectedAddresses.filter(a => a !== id))
    } else {
      setSelectedAddresses([...selectedAddresses, id])
    }
  }

  const updateAddress = (updatedAddress: AddressEntry) => {
    const updatedAddresses = currentFolder.addresses.map((addr: any) =>
      addr.id === updatedAddress.id ? updatedAddress : addr
    )
    const updatedFolders = folders.map((folder: any) =>
      folder.id === currentFolder.id
        ? { ...folder, addresses: updatedAddresses }
        : folder
    )
    setFolders(updatedFolders)
    setIsEditDialogOpen(false)
  }

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
        <CustomSelect
          value={sortOrder}
          onChange={(value: 'name' | 'phone') => setSortOrder(value)}
          options={[
            { value: 'name', label: '이름순' },
            { value: 'phone', label: '전화번호순' }
          ]}
          className="w-40"
        />
        <span className="font-bold flex-grow">이름</span>
        <span className="font-bold w-1/3">휴대폰</span>
        <span className="w-24"></span>
      </div>
      <AnimatePresence>
        {paginatedAddresses.map(address => (
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
            <span className="flex-grow">{address.name}</span>
            <span className="w-1/3">{address.phoneNumber}</span>
            <div className="w-24 flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                onClick={() => {
                  setSelectedAddress(address)
                  setIsEditDialogOpen(true)
                }}
              >
                수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg"
                onClick={() => {
                  setSelectedAddress(address)
                  setIsViewDialogOpen(true)
                }}
              >
                상세보기
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => setCurrentPage(page)}
            className={`rounded-lg w-10 h-10 ${currentPage === page ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
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
              onChange={e =>
                setSelectedAddress(prev =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
            />
            <Input
              placeholder="전화번호"
              value={selectedAddress?.phoneNumber || ''}
              onChange={e =>
                setSelectedAddress(prev =>
                  prev ? { ...prev, phoneNumber: e.target.value } : null
                )
              }
            />
            <Input
              placeholder="변수 1"
              value={selectedAddress?.var1 || ''}
              onChange={e =>
                setSelectedAddress(prev =>
                  prev ? { ...prev, var1: e.target.value } : null
                )
              }
            />
            <Input
              placeholder="변수 2"
              value={selectedAddress?.var2 || ''}
              onChange={e =>
                setSelectedAddress(prev =>
                  prev ? { ...prev, var2: e.target.value } : null
                )
              }
            />
            <Input
              placeholder="변수 3"
              value={selectedAddress?.var3 || ''}
              onChange={e =>
                setSelectedAddress(prev =>
                  prev ? { ...prev, var3: e.target.value } : null
                )
              }
            />
            <Input
              placeholder="변수 4"
              value={selectedAddress?.var4 || ''}
              onChange={e =>
                setSelectedAddress(prev =>
                  prev ? { ...prev, var4: e.target.value } : null
                )
              }
            />
            <Button
              onClick={() => selectedAddress && updateAddress(selectedAddress)}
            >
              저장
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
              <strong>전화번호:</strong> {selectedAddress?.phoneNumber}
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
        </DialogContent>
      </Dialog>
    </div>
  )
}