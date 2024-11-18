'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { motion } from 'framer-motion'
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
import { FolderTree } from '@/components/ui/folder'
import { Contact2, SearchResult, Group2, Folder2 } from './entity'
import {api} from './service' 
import AddressListView from './address-list-view';

// Sample data
const sampleData: Folder2[] = [
      {
        "folderId": 1,
        "name": "폴더1",
        "group2s": [
          {
            "groupsId": 1,
            "name": "group1",
            "contact2s": [
              {
                "contactId": 1,
                "name": "contact11",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              },
              {
                "contactId": 2,
                "name": "contact12",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              },
              {
                "contactId": 3,
                "name": "contact13",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              }
            ]
          },
          {
            "groupsId": 2,
            "name": "group12",
            "contact2s": [
              {
                "contactId": 4,
                "name": "contact21",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              },
              {
                "contactId": 5,
                "name": "contact22",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              },
              {
                "contactId": 6,
                "name": "contact23",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              }
            ]
          },
          {
            "groupsId": 3,
            "name": "group13",
            "contact2s": []
          }
        ]
      },
      {
        "folderId": 2,
        "name": "폴더2",
        "group2s": [
          {
            "groupsId": 4,
            "name": "group21",
            "contact2s": [
              {
                "contactId": 7,
                "name": "contact41",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              },
              {
                "contactId": 8,
                "name": "contact42",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              },
              {
                "contactId": 9,
                "name": "contact43",
                "telNum": "string",
                "var1": "string",
                "var2": "string",
                "var3": "string",
                "var4": "string",
                "var5": "string",
                "var6": "string",
                "var7": "string",
                "var8": "string"
              }
            ]
          },
          {
            "groupsId": 5,
            "name": "group22",
            "contact2s": []
          },
          {
            "groupsId": 6,
            "name": "group23",
            "contact2s": []
          }
        ]
      },
      {
        "folderId": 3,
        "name": "폴더3",
        "group2s": [
          {
            "groupsId": 7,
            "name": "group31",
            "contact2s": []
          },
          {
            "groupsId": 8,
            "name": "group32",
            "contact2s": []
          },
          {
            "groupsId": 9,
            "name": "group33",
            "contact2s": []
          }
        ]
      },
      {
        "folderId": 4,
        "name": "폴더4",
        "group2s": []
      }
    ]

    /**
     * 드롭다운 방식 셀렉트 박스 컴포넌트이다.
     * 
     * 버튼을 누르면, 열린다. (Q. 뭐가 열리는지?)
     * 폴더 내부 정보, 확장 축소 기능을 하는 컴포넌트로 추측된다.
     * @param value // 모르겠음
     * @param onChange // 모르겠음
     * @param option // 모르겠음
     * @param className // 모르겠음
     * @returns 
     */
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
        className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-nvar1 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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

/**
 * 주소록 창을 보여주는 함수이다.
 * searchTerm 검색어
 * searchFilter 검색 필터, 조사할 연관 검색어가 [이름, 전화번호, 둘다]인지 구분하는 함수
 * 
 * folder 폴더 리스트. 최상위 폴더 개념??
 * currentFolder 초기 생성에서는 최상위 폴더를 의미한다.
 * isAddingContact2 주소록 추가하는 다이얼로그를 닫는 플래스
 * newAddress 새로운 주소를 추가하는 것으로 추정 Patial을 사용한다.
 * searchResults 검색 결과 리스트를 반환하는 변수 <- 매번 새로운 객체로 변경되는 변수.
 * isLoading 다른 작업이 진행중인지 판단하는 플래그
 * 
 * @returns 
 */
export default function AddressBook() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilter, setSearchFilter] = useState<'name' | 'phone' | 'both'>(
    'both'
  )
  const [folder2s, setFolder2s] = useState<Folder2[]>(sampleData)
  const [currentFolder2, setCurrentFolder2] = useState<Folder2>(sampleData[0])
  const [isAddingContact2, setIsAddingContact2] = useState(false)
  const [newContact2, setNewContact2] = useState<Partial<Contact2>>({})
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Contact2를 기반으로 검색을 주관하는 핸들러이다.
   * 
   * 현재 폴더의 가장 최상위의 정보를 하위로 검색한다.
   */
  const handleSearch = useCallback(() => {
    const results: SearchResult[] = [];

    // 1. 폴더 계층에서 모든 루프를 발생시킨다.
    folder2s.forEach((folder2) => {
      // 2. 그룹 계층에서 모든 루프를 발생시킨다.
        folder2.group2s.forEach((group2) => {
          // 3. 그룹 내 연락처에서 동일한 속성 정보가 존재한다면, 포함한다.
          const matchedContacts = group2.contact2s.filter((contact2) => {
            // 4. 검색 필터에 맞는 연락처 정보에서만 조회한다.
            if (searchFilter === 'name' || searchFilter === 'both') {
              // 5. (정확도 상승을 위함 - 소문자로 변환했을 때) contact2 안에 해당 검색어의 문자가 포함되는 경우 참
              if (contact2.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
            }
            // 4,5. 동일
            if (searchFilter === 'phone' || searchFilter === 'both') {
              if (contact2.telNum.includes(searchTerm)) return true;
            }
            return false;
          });

          // 5.에서 true가 반환된 경우에만 results에 해당 정보를 push
          if (matchedContacts.length > 0) {
              results.push({
                  folder2,
                  group2,
                  contact2s: matchedContacts,
              });
          }
        });
    });

    // 6. 새로운 객체를 저장한다.
    setSearchResults(results);

    /**
     * 반복적으로 실행되어야 하는 경우
     * 1. 검색어가 바뀐 경우
     * 2. 검색 필터 [이름, 전화번호, 모두] 중 하나로 변경된 경우
     * 3. 선택된 폴더 정보가 변경된 경우
     */
  }, [searchTerm, searchFilter, folder2s]);

  /**
   * 모든 검색어 정보를 초기화하는 핸들러이다.
   */
  const handleReset = useCallback(() => {
    setSearchTerm('')
    setSearchFilter('both')
    setSearchResults([])
  }, [])

  /**
   * 검색어를 어떻게 관리하는지 명시(구현)하는 useEffect
   * 1. 엔터를 누를 시 검색을 진행한다. (handleSearch 핸들러 실행)
   * 2. ctrl + r을 누를 시 검색 정보를 초기화 한다. (handleReset 핸들러 실행)
   */
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

  /**
   * 폴더를 추가하는 함수
   * 
   * ※ 기존에는 모든 영역이 폴더였지만, 현재는 그룹도 포함되었기에, 수정되어야 한다.
   * @param name 추가될 폴더(or 그룹)의 이름
   * @param parentFolder 폴더의 유무 ※ 만약 해당 변수가 null이라면, 폴더로 간주 아니면 그룹으로 판단한다.
   */
  const addFolder2AndGroup2 = async (
    name: string,
    parentFolder2: Folder2 | null = null
  ) => {
    // [에러처리] 추가한 이름이 공백인 경우는 실행되지 않는다.
    if (name.trim()) {
      // 현재 동작을 수행중임을 명시
      setIsLoading(true);
      try {
        // 부모 폴더가 있다면, (추가할 객체가 그룹인 경우)
        if (parentFolder2) {
          // 새로운 그룹을 생성한다.
          const newGroup =  {  // 그룹 생성 API 연결할 것!!!
            groupsId: Date.now(),
            name: name.trim(),
            contact2s: []
          };
          
          // 새로운 그룹을 추가한다.
          // 최상위 그룹 folder2s에서 parentFolder와 동일한 폴더를 순회하여 찾은 후, 해당 객체에 삽입한다.
          // Q. 왜 바로 parentFolder에 추가하지 않은 것?
          const updatedFolder2s = folder2s.map((folder) => {
            // 최상위 폴더에서 동일한 폴더를 발견한 경우
            if (folder.folderId === parentFolder2.folderId) {
                return {
                    ...folder,
                    group2s: [...folder.group2s, newGroup],
                };
            }
            // 조회되지 않은 경우 변경하지 않고, 반환한다
            return folder;
          });
          // 폴더 수정 후 업데이트
          setFolder2s(updatedFolder2s);
        } else { // 부모 폴더가 없다면
          // 새로운 폴더를 생성한다.
          const newFolder = { // 폴더 생성 API 연결할 것!!!
            folderId: Date.now(),
            name: name.trim(),
            group2s: []
          }

          // 폴더 리스트에 폴더 추가
          setFolder2s([...folder2s, newFolder]);
        }
      } catch (error) {
          console.error('Failed to create folder:', error);
      } finally {
          setIsLoading(false);
      }
    }
  };

  const updateFolderRecursively = ( // TODO: 최후에 수정할 것
    folders: Folder2[],
    folderId: string,
    updateFn: (folder: Folder2) => Folder2
  ): Folder2[] => {
    return folders.map(folder => {
      // if (folder.id === folderId) {
      //   return updateFn(folder)
      // }
      // if (folder.subFolders.length > 0) {
      //   return {
      //     ...folder,
      //     subFolders: updateFolderRecursively(
      //       folder.subFolders,
      //       folderId,
      //       updateFn
      //     )
      //   }
      // }
      return folder
    })
  }

  /**
   * 주소를 추가하는 함수
   */
  const addContact2 = async () => {
    // newAddress.name, newAddress.telNum이 추가되는 경우 실행되는 것으로 추정???
    if (newContact2.name && newContact2.telNum) {
      // 현재 동작을 수행중임을 명시
      setIsLoading(true)
      try {
        const contact2 = { // 폴더 생성 API 연결할 것!!!
          number: Date.now(),
          name: "testName",
          telNum: "testNumber",
          var1: "test1",
          var2: "test2",
          var3: "test3",
          var4: "test4",
          var5: "test5",
          var6: "test6",
          var7: "test7",
          var8: "test8",
        }
        
        // 주소록을 추가한 새로운 폴더를 생성
        // TODO: 현재는 폴더인데, 원래는 그룹이 되어야한다!!
        const updatedFolders = updateFolderRecursively(
          folder2s,
          currentFolder2.folderId, // TODO: 오류!!
          folder => ({
            ...folder,
            addresses: [...folder.addresses, contact2] // TODO: 오류!!
          })
        )
        setFolder2s(updatedFolders)

        // Q. currentFolder2와 Folder2의 차이
        setCurrentFolder2(prev => ({
          ...prev,
          addresses: [...prev.addresses, address] // TODO: 오류!!
        }))
        setNewContact2({}) // Q. 역할 무엇인지 모름
        setIsAddingContact2(false)
      } catch (error) {
        console.error('Failed to add address:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  /**
   * 주소록을 수정하는 함수
   * 
   * @param updatedAddress  수정할 주소록 객체
   */
  const updateAddress = async (updatedAddress: Contact2) => {
    // 현재 동작을 수행중임을 명시
    setIsLoading(true)
    try {
      const address = { // 폴더 수정 API 연결할 것!!!
        number: Date.now(),
        name: "testNameUpdated",
        telNum: "testNumberUpdated",
        var1: "test1Updated",
        var2: "test2Updated",
        var3: "test3Updated",
        var4: "test4Updated",
        var5: "test5Updated",
        var6: "test6Updated",
        var7: "test7Updated",
        var8: "test8Updated",
      }

      // 폴더 정보를 수정한다.
      const updatedFolders = updateFolderRecursively(  // TODO: 오류!!
        folder2s,
        currentFolder2.id,
        folder => ({
          ...folder,
          addresses: folder.addresses.map(addr =>
            addr.id === address.id ? address : addr
          )
        })
      )

      // 폴더 정보 저장
      setFolder2s(updatedFolders)

      // 현재 폴더 정보를 수정한다.
      setCurrentFolder2(prev => ({
        ...prev,
        addresses: prev.addresses.map(addr => // TODO: 오류!!
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
    // 현재 동작을 수행중임을 명시
    setIsLoading(true)
    try {
      // TODO: 폴더 생성 API 연결할 것!!!
      //await api.deleteAddress(addressId)

      const updatedFolders = updateFolderRecursively( // TODO: 오류!!
        folder2s,
        currentFolder2.id,
        folder => ({
          ...folder,
          addresses: folder.addresses.filter(addr => addr.id !== addressId)
        })
      )

      // 폴더 정보 저장
      setFolder2s(updatedFolders)

      // 현재 폴더 정보를 수정한다.
      setCurrentFolder2(prev => ({ // TODO: 오류!!
        ...prev,
        addresses: prev.addresses.filter(addr => addr.id !== addressId)
      }))
    } catch (error) {
      console.error('Failed to delete address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 매개변수에 있는 폴더를 찾아가는 함수 ???????????????????
   * 
   * 업데이트 될 구조에서는 필요없는 함수이다.
   * 
   * @param folder 경로를 얻을 Folder2 객체
   * @returns folder 매개변수가 어디 들어있는지(부모 folder 리스트)
   */
  const getBreadcrumbPath = (folder: Folder2): Folder2[] => {
    // 새로운 경로 생성??
    const path: Folder2[] = []
    
    // 현재 폴더??
    let currentFolder: Folder2 | undefined = folder

    const findParent = (
      folders: Folder2[],
      targetId: string
    ): Folder2 | undefined => {
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
      currentFolder = findParent(folder2s, currentFolder.id)
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
            { value: 'phvar1', label: '전화번호' },
            { value: 'both', label: '이름과 전화번호' }
          ]}
          className="w-48"
        />
        <div className="relative flex-grow">
          {/* 검색어를 작성하는 TextField*/}
          <Input
            className="pl-12 pr-20 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            placeholder="검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {/* TODO: 뭔진 모르겠는데 암튼 검색 버튼 */}
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />

          {/* 검색 버튼 및 초기화 버튼 */}
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
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          {/* 폴더 정보가 나타날 좌측 공간 */}
          <FolderTree
            folders={folder2s}
            currentFolder={currentFolder2}
            setCurrentFolder={setCurrentFolder2}
            addFolder={addFolder2AndGroup2}
            setFolders={setFolder2s}
            isLoading={isLoading}
          />
        </div>
        <div className="w-2/3 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          
          {/* 현재 폴더에 대한 정보가 나타난다. */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{currentFolder2.name}</h2>
            <Button
              onClick={() => setIsAddingContact2(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              주소 추가
            </Button>
          </div>
          <Breadcrumb>
            {getBreadcrumbPath(currentFolder2).map((folder, index, array) => (
              <BreadcrumbItem key={folder.folderId}>
                <BreadcrumbLink onClick={() => setCurrentFolder2(folder)}>
                  {folder.name}
                </BreadcrumbLink>
                {index < array.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>

          {/* 검색한 결과가 나올 우측 공간 */}
          {searchResults.length > 0 ? (
            <SearchResultsView
              searchResults={searchResults}
              setFolders={setFolder2s}
              folders={folder2s}
              setCurrentFolder={setCurrentFolder2}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
              isLoading={isLoading}
            />
          ) : (
            <AddressListView
              addresses={currentFolder2.group2s[0].contact2s} // TODO: 수정할 것
              setFolders={setFolder2s}
              folders={folder2s}
              currentFolder={currentFolder2}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
      {/* 새 주소 추가 버튼을 누를 시 나오는 다이얼로그 */}
      <Dialog open={isAddingContact2} onOpenChange={setIsAddingContact2}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              새 주소 추가
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="이름"
              value={newContact2.name || ''}
              onChange={e =>
                setNewContact2({ ...newContact2, name: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="전화번호"
              value={newContact2.telNum || ''}
              onChange={e =>
                setNewContact2({ ...newContact2, telNum: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 1"
              value={newContact2.var1 || ''}
              onChange={e =>
                setNewContact2({ ...newContact2, var1: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 2"
              value={newContact2.var2 || ''}
              onChange={e =>
                setNewContact2({ ...newContact2, var2: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 3"
              value={newContact2.var3 || ''}
              onChange={e =>
                setNewContact2({ ...newContact2, var3: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <Input
              placeholder="변수 4"
              value={newContact2.var4 || ''}
              onChange={e =>
                setNewContact2({ ...newContact2, var4: e.target.value })
              }
              className="rounded-lg bg-gray-100 dark:bg-gray-700"
            />
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddingContact2(false)}
                className="rounded-lg"
              >
                취소
              </Button>
              <Button
                onClick={addContact2}
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
