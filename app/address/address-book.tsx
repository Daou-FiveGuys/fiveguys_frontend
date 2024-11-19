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
import AddressListView from './address-list-view'

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
                "telNum": "01000000000",
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
                "telNum": "01000000001",
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
                "telNum": "01000000002",
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
                "telNum": "01000000003",
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
                "telNum": "01000000004",
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
      }
    ]

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
  // 유저가 가진 모든 폴더를 관리하는 객체이다.
  const [topFolder2s, setTopFolder2s] = useState<Folder2[]>(sampleData)
  const [currentGroup2, setCurrentGroup2] = useState<Group2>(sampleData[0].group2s[0]) // 초기값은 가장 빠른 값.
  const [isAddingContact2, setIsAddingContact2] = useState(false)
  const [newContact2, setNewContact2] = useState<Partial<Contact2>>({})
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoading(true);
      try {
        const userData = await api.readFolder(); // 비동기 호출
        if (userData) {
          setTopFolder2s(userData); // API 데이터로 상태 업데이트
        }
      } catch (error) {
        console.error('Failed to fetch folders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, []); // 컴포넌트가 마운트될 때 실행

  /**
   * Contact2를 기반으로 검색을 주관하는 핸들러이다.
   * 
   * 현재 폴더의 가장 최상위의 정보를 하위로 검색한다.
   */
  const handleSearch = useCallback(() => {
    const results: SearchResult[] = [];
  
    // 1. 폴더 계층에서 모든 루프를 발생시킨다.
    topFolder2s.forEach((folder2) => {
      // 2. 그룹 계층에서 모든 루프를 발생시킨다.
      folder2.group2s.forEach((group2) => {
        // 3. 그룹 내 연락처에서 동일한 속성 정보가 존재한다면, 포함한다.
        const matchedContacts = group2.contact2s.filter((contact2) => {
          // 4. 검색 필터에 맞는 연락처 정보에서만 조회한다.
          if (searchFilter === 'name' || searchFilter === 'both') {
            if (contact2.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
          }
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
  }, [searchTerm, searchFilter, topFolder2s]);
  
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
  if (name.trim()) {
    setIsLoading(true);
    try {
      if (parentFolder2) {
        // 부모 폴더가 있는 경우 (그룹 추가 로직)
        const newGroup = await api.createGroup(name, parentFolder2);
        if(newGroup == undefined) return

        const updatedFolders = topFolder2s.map((folder) =>
          folder.folderId === parentFolder2.folderId
            ? { ...folder, group2s: [...folder.group2s, newGroup] }
            : folder
        );

        setTopFolder2s(updatedFolders);
      } else {
        // 부모 폴더가 없는 경우 (새 폴더 생성)
        const newFolder = await api.createFolder(name);
        if(newFolder == undefined) return

        setTopFolder2s([...topFolder2s, newFolder]);
      }
    } catch (error) {
      console.error("Failed to create folder or group:", error);
    } finally {
      setIsLoading(false);
    }
  }
};


  // 그룹에 관한 수정 함수
const updateFolderRecursively = (
  folder2s: Folder2[],
  group2Id: number,
  updateFn: (group2: Group2) => Group2
): Folder2[] => {
  return folder2s.map(folder2 => {
    const updatedGroups = updateGroup(folder2.group2s, group2Id, updateFn);
    if (updatedGroups) {
      return {
        ...folder2,
        group2s: updatedGroups, // 업데이트된 그룹 배열로 교체
      };
    }
    return folder2; // 그룹이 업데이트되지 않은 경우 원래의 Folder2 반환
  });
};

// 그룹 배열 수정 함수
const updateGroup = (
  group2s: Group2[],
  group2Id: number,
  updateFn: (group2: Group2) => Group2
): Group2[] | null => {
  let isUpdated = false; // 업데이트 여부를 추적
  const updatedGroups = group2s.map(group2 => {
    if (group2.groupsId === group2Id) {
      isUpdated = true; // 업데이트 발생
      return updateFn(group2); // 업데이트 함수 적용
    }
    return group2;
  });

  return isUpdated ? updatedGroups : null; // 업데이트가 발생했을 경우에만 반환
};

  /**
   * 주소를 추가하는 함수
   */
  const addContact2 = async () => {
    if (newContact2.name && newContact2.telNum) {
      setIsLoading(true);
      try {
        const contact2 = await api.createAddress({
          contactId: -1,
          name: newContact2.name,
          telNum: newContact2.telNum,
          var1: newContact2.var1 || "",
          var2: newContact2.var2 || "",
          var3: newContact2.var3 || "",
          var4: newContact2.var4 || "",
          var5: newContact2.var5 || "",
          var6: newContact2.var6 || "",
          var7: newContact2.var7 || "",
          var8: newContact2.var8 || "",
        }, currentGroup2.groupsId);
        
        if (contact2 == undefined) return;
  
        // Update topFolder2s
        const updatedFolders = updateFolderRecursively(
          topFolder2s,
          currentGroup2.groupsId,
          group2 => ({
            ...group2,
            contact2s: [...group2.contact2s, contact2]
          })
        );
  
        setTopFolder2s(updatedFolders);
  
        // Update currentGroup2
        setCurrentGroup2(prev => ({
          ...prev,
          contact2s: [...prev.contact2s, contact2]
        }));
  
        setNewContact2({});
        setIsAddingContact2(false);
      } catch (error) {
        console.error('Failed to add address:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * 주소록을 수정하는 함수
   * 
   * @param updatedAddress  수정할 주소록 객체
   */
  const updateAddress = async (updatedAddress: Contact2) => {
    // 현재 동작을 수행중임을 명시
    setIsLoading(true)
    try {
      const contact2 = await api.updateAddress({
        contactId: updatedAddress.contactId,
        name: updatedAddress.name,
        telNum: updatedAddress.telNum,
        var1: updatedAddress.var1,
        var2: updatedAddress.var2,
        var3: updatedAddress.var3,
        var4: updatedAddress.var4,
        var5: updatedAddress.var5,
        var6: updatedAddress.var6,
        var7: updatedAddress.var7,
        var8: updatedAddress.var8,
      })

      if(contact2 == undefined) return

      // 폴더 정보를 수정한다.
      const updatedFolders = updateFolderRecursively(  
        topFolder2s,
        currentGroup2.groupsId,
        group2 => ({
          ...group2,
          contact2s: group2.contact2s.map(ct2 =>
            ct2.contactId === contact2.contactId ? contact2 : ct2
          )
        })
      )

      // 폴더 정보 저장
      setTopFolder2s(updatedFolders)

      // 현재 폴더 정보를 수정한다.
      setCurrentGroup2(prev => ({
        ...prev,
        contact2s: prev.contact2s.map(ct2 => 
          ct2.contactId === contact2.contactId ? contact2 : ct2
        )
      }))
    } catch (error) {
      console.error('Failed to update address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAddress = async (contact2Id: number) => {
    // 현재 동작을 수행중임을 명시
    setIsLoading(true)
    try {
      const state = await api.deleteAddress(contact2Id)
      if(!state) return

      const updatedFolders = updateFolderRecursively(
        topFolder2s,
        currentGroup2.groupsId,
        group2 => ({
          ...group2,
          contact2s: group2.contact2s.filter(ct2 => ct2.contactId !== contact2Id)
        })
      )

      // 폴더 정보 저장
      setTopFolder2s(updatedFolders)

      // 현재 폴더 정보를 수정한다.
      setCurrentGroup2(prev => ({
        ...prev,
        contact2s: prev.contact2s.filter(ct2 => ct2.contactId !== contact2Id)
      }))
    } catch (error) {
      console.error('Failed to delete address:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 매개변수에 있는 폴더를 찾아가는 함수
   * 
   * 업데이트 될 구조에서는 필요없는 함수이다.
   * 
   * @param folder 경로를 얻을 Folder2 객체
   * @returns folder 매개변수가 어디 들어있는지(부모 folder 리스트)
   */
  const getBreadcrumbPath = (group: Group2): Folder2[] => {
      for (const f of topFolder2s) {
        if (f.group2s.some(sf => sf.groupsId === group.groupsId)) {
          return [f]
        }
      }
    return []
  }

  return (
    <div className="p-8 flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex space-x-4 mb-8 z-20"
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
            topFolder2s={topFolder2s}
            currentGroup2={currentGroup2}
            setCurrentGroup2={setCurrentGroup2}
            addFolder2AndGroup2={addFolder2AndGroup2}
            setFolders={setTopFolder2s}
            isLoading={isLoading}
          />
        </div>
        <div className="w-2/3 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
          
          {/* 현재 폴더에 대한 정보가 나타난다. */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{currentGroup2.name}</h2>
            <Button
              onClick={() => setIsAddingContact2(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition-colors duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              주소 추가
            </Button>
          </div>
          <Breadcrumb>
            {getBreadcrumbPath(currentGroup2).map((folder, index, array) => (
              <BreadcrumbItem key={folder.folderId}>
                <BreadcrumbLink onClick={() => setCurrentGroup2(currentGroup2)}>
                  {folder.name}
                </BreadcrumbLink>
              <BreadcrumbSeparator />
              </BreadcrumbItem>
            ))}
            <BreadcrumbItem key={currentGroup2.groupsId}>
                <BreadcrumbLink onClick={() => setCurrentGroup2(currentGroup2)}>
                  {currentGroup2.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
          </Breadcrumb>

          {/* 검색한 결과가 나올 우측 공간 */}
          {searchResults.length > 0 ? (
            <SearchResultsView
              searchResults={searchResults}
              setFolders={setTopFolder2s}
              folders={topFolder2s}
              setCurrentFolder={setCurrentGroup2}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
              isLoading={isLoading}
            />
          ) : (
            <AddressListView
              addresses={currentGroup2.contact2s}
              setFolders={setTopFolder2s}
              folders={topFolder2s}
              currentFolder={currentGroup2}
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
  isLoading,
}: any) {
  if (!searchResults || searchResults.length === 0) {
    return <p>검색 결과가 없습니다.</p>;
  }

  return (
    <div>
      {searchResults.map((result: any, index: number) => (
        <div key={result.folder?.folderId || index} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            {result.group2.name}
          </h3>
          <AddressListView
            addresses={result.contact2s || []} // contact2s가 없으면 빈 배열로 설정
            setFolders={setFolders}
            folders={folders}
            currentFolder={result.folder || {}}
            setCurrentFolder={setCurrentFolder}
            updateAddress={updateAddress}
            deleteAddress={deleteAddress}
            isLoading={isLoading}
          />
        </div>
      ))}
    </div>
  );
}
