"use client"

import { useState } from 'react'
import { Card, CardBody, CardHeader, CardFooter } from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Divider } from "@nextui-org/divider"
import { MinusIcon, PlusIcon } from 'lucide-react'

type TokenOption = {
    quantity: number
    price: number
}

const tokenOptions: TokenOption[] = [
    { quantity: 1, price: 100 },
    { quantity: 10, price: 900 },
    { quantity: 100, price: 9800 },
    { quantity: 1000, price: 90000 },
]

export default function Component() {
    const [currentTokens, setCurrentTokens] = useState(0)
    const [selectedTokens, setSelectedTokens] = useState<Record<number, number>>({})

    const updateSelectedTokens = (index: number, change: number) => {
        setSelectedTokens(prev => {
            const newQuantity = Math.max((prev[index] || 0) + change, 0)
            if (newQuantity === 0) {
                const { [index]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [index]: newQuantity }
        })
    }

    const totalCost = Object.entries(selectedTokens).reduce((sum, [index, quantity]) => {
        return sum + tokenOptions[Number(index)].price * quantity
    }, 0)

    const totalTokens = Object.entries(selectedTokens).reduce((sum, [index, quantity]) => {
        return sum + tokenOptions[Number(index)].quantity * quantity
    }, 0)

    const handlePay = () => {
        setCurrentTokens(prev => prev + totalTokens)
        setSelectedTokens({})
        alert(`Payment of ${totalCost} won successful. You've purchased ${totalTokens} tokens.`)
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl font-bold">Token Purchase</h2>
                    <p className="text-lg">Current Tokens: {currentTokens}</p>
                </CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {tokenOptions.map((option, index) => (
                            <Card key={index} className="bg-content2">
                                <CardBody className="flex flex-row items-center justify-between p-4">
                  <span className="text-lg font-medium">
                    {option.quantity} token{option.quantity > 1 ? 's' : ''} for {option.price} won
                  </span>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="bordered"
                                            onClick={() => updateSelectedTokens(index, -1)}
                                        >
                                            <MinusIcon className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center">{selectedTokens[index] || 0}</span>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="bordered"
                                            onClick={() => updateSelectedTokens(index, 1)}
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                    <Card>
                        <CardHeader>
                            <h3 className="text-xl font-bold">Receipt</h3>
                        </CardHeader>
                        <CardBody className="space-y-2">
                            {Object.entries(selectedTokens).map(([index, quantity]) => (
                                <div key={index} className="flex justify-between">
                                    <span>{tokenOptions[Number(index)].quantity} tokens x {quantity}</span>
                                    <span>{tokenOptions[Number(index)].price * quantity} won</span>
                                </div>
                            ))}
                            <Divider className="my-2" />
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>{totalCost} won</span>
                            </div>
                            <div className="flex justify-between text-sm text-default-500">
                                <span>Total Tokens</span>
                                <span>{totalTokens}</span>
                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button
                                className="w-full"
                                color="primary"
                                onClick={handlePay}
                                disabled={totalTokens === 0}
                            >
                                Pay {totalCost} won
                            </Button>
                        </CardFooter>
                    </Card>
                </CardBody>
            </Card>
        </div>
    )
}