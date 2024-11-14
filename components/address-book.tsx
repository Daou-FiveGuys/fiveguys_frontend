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

// Sample data
const sampleData: Folder[] = [
  {
    id: 'root',
    name: '기본 폴더',
    subFolders: [
      {
        id: 'work',
        name: '직장',
        subFolders: [],
        addresses: [
          {
            id: 'w1',
            name: '김대리',
            phoneNumber: '010-1234-5678',
            var1: '영업부',
            var2: '사원',
            var3: 'kim@company.com',
            var4: '서울'
          },
          {
            id: 'w2',
            name: '이과장',
            phoneNumber: '010-2345-6789',
            var1: '인사부',
            var2: '과장',
            var3: 'lee@company.com',
            var4: '경기'
          }
        ]
      },
      {
        id: 'family',
        name: '가족',
        subFolders: [],
        addresses: [
          {
            id: 'f1',
            name: '아버지',
            phoneNumber: '010-9876-5432',
            var1: '60대',
            var2: '회사원',
            var3: 'father@family.com',
            var4: '서울'
          },
          {
            id: 'f2',
            name: '어머니',
            phoneNumber: '010-8765-4321',
            var1: '50대',
            var2: '주부',
            var3: 'mother@family.com',
            var4: '서울'
          }
        ]
      }
    ],
    addresses: [
      {
        id: 'p1',
        name: '홍길동',
        phoneNumber: '010-1111-2222',
        var1: '30대',
        var2: '자영업',
        var3: 'hong@personal.com',
        var4: '부산'
      },
      {
        id: 'p2',
        name: '김철수',
        phoneNumber: '010-3333-4444',
        var1: '40대',
        var2: '회사원',
        var3: 'kim@personal.com',
        var4: '대구'
      }
    ]
  }
]

// API control code
const api = {
  createFolder: async (
    name: string,
    parentId: string | null
  ): Promise<Folder> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulated delay
    return { id: Date.now().toString(), name, subFolders: [], addresses: [] }
  },
  updateFolder: async (
    id: string,
    name: string
  ): Promise<{ id: string; name: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulated delay
    return { id, name }
  },
  deleteFolder: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulated delay
    return true
  },
  createAddress: async (
    address: Omit<AddressEntry, 'id'>,
    folderId: string
  ): Promise<AddressEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulated delay
    return { ...address, id: Date.now().toString() }
  },
  updateAddress: async (address: AddressEntry): Promise<AddressEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulated delay
    return address
  },
  deleteAddress: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulated delay
    return true
  }
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
  const [folders, setFolders] = useState<Folder[]>(sampleData)
  const [currentFolder, setCurrentFolder] = useState<Folder>(sampleData[0])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState<Partial<AddressEntry>>({})
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const addFolder = async (
    name: string,
    parentFolder: Folder | null = null
  ) => {
    if (name.trim()) {
      setIsLoading(true)
      try {
        const newFolder = await api.createFolder(
          name.trim(),
          parentFolder?.id || null
        )
        if (parentFolder) {
          const updatedFolders = updateFolderRecursively(
            folders,
            parentFolder.id,
            folder => ({
              ...folder,
              subFolders: [...folder.subFolders, newFolder]
            })
          )
          setFolders(updatedFolders)
        } else {
          setFolders([...folders, newFolder])
        }
      } catch (error) {
        console.error('Failed to create folder:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateFolderRecursively = (
    folders: Folder[],
    folderId: string,
    updateFn: (folder: Folder) => Folder
  ): Folder[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return updateFn(folder)
      }
      if (folder.subFolders.length > 0) {
        return {
          ...folder,
          subFolders: updateFolderRecursively(
            folder.subFolders,
            folderId,
            updateFn
          )
        }
      }
      return folder
    })
  }

  const addAddress = async () => {
    if (newAddress.name && newAddress.phoneNumber) {
      setIsLoading(true)
      try {
        const address = await api.createAddress(
          newAddress as Omit<AddressEntry, 'id'>,
          currentFolder.id
        )
        const updatedFolders = updateFolderRecursively(
          folders,
          currentFolder.id,
          folder => ({
            ...folder,
            addresses: [...folder.addresses, address]
          })
        )
        setFolders(updatedFolders)
        setCurrentFolder(prev => ({
          ...prev,
          addresses: [...prev.addresses, address]
        }))
        setNewAddress({})
        setIsAddingAddress(false)
      } catch (error) {
        console.error('Failed to add address:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateAddress = async (updatedAddress: AddressEntry) => {
    setIsLoading(true)
    try {
      const address = await api.updateAddress(updatedAddress)
      const updatedFolders = updateFolderRecursively(
        folders,
        currentFolder.id,
        folder => ({
          ...folder,
          addresses: folder.addresses.map(addr =>
            addr.id === address.id ? address : addr
          )
        })
      )
      setFolders(updatedFolders)
      setCurrentFolder(prev => ({
        ...prev,
        addresses: prev.addresses.map(addr =>
          addr.id === address.id ? address : addr
        )
      }))
    } catch (error) {
      console.error('Failed to update address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAddress = async (addressId: string) => {
    setIsLoading(true)
    try {
      await api.deleteAddress(addressId)
      const updatedFolders = updateFolderRecursively(
        folders,
        currentFolder.id,
        folder => ({
          ...folder,
          addresses: folder.addresses.filter(addr => addr.id !== addressId)
        })
      )
      setFolders(updatedFolders)
      setCurrentFolder(prev => ({
        ...prev,
        addresses: prev.addresses.filter(addr => addr.id !== addressId)
      }))
    } catch (error) {
      console.error('Failed to delete address:', error)
    } finally {
      setIsLoading(false)
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
            isLoading={isLoading}
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
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
              isLoading={isLoading}
            />
          ) : (
            <AddressListView
              addresses={currentFolder.addresses}
              setFolders={setFolders}
              folders={folders}
              currentFolder={currentFolder}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
              isLoading={isLoading}
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
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
              >
                {isLoading ? '추가 중...' : '추가'}
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
  setCurrentFolder,
  updateAddress,
  deleteAddress,
  isLoading
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
            updateAddress={updateAddress}
            deleteAddress={deleteAddress}
            isLoading={isLoading}
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
  updateAddress,
  deleteAddress,
  isLoading
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
          <Button
            onClick={() => {
              if (selectedAddress) {
                deleteAddress(selectedAddress.id)
                setIsViewDialogOpen(false)
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
  )
}
