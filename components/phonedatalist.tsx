import React, { useState, useEffect } from 'react'
import axios from 'axios'
interface PhoneNumberData {
    name: string;
    phoneNumber: string;
    groupName: string;
  }

export async function getPhoneDataList(): Promise<PhoneNumberData[] | Error> {
    try {
      const response = await axios.get<PhoneNumberData[]>("https://jsonplaceholder.typicode.com/users")//"https://jsonplaceholder.typicode.com/users"
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.message)
        return new Error('Error fetching phone data: ' + error.message)
      }
      console.log(1)
      return new Error('An unexpected error occurred')
    }
  }