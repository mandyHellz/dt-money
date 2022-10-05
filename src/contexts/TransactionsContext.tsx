import { ReactNode, useCallback, useEffect, useState } from 'react'
import { createContext } from 'use-context-selector'
import { api } from '../lib/axios'

interface Transaction {
  id: number
  description: string
  type: 'income' | 'outcome'
  price: number
  category: string
  createdAt: string
}
interface TransactionsProviderProps {
  children: ReactNode
}
interface CreateTransactionProps {
  description: string
  price: number
  category: string
  type: 'income' | 'outcome'
}
interface TransactionsContextType {
  transactions: Transaction[]
  getTransactions: (query?: string) => Promise<void>
  createTransaction: (data: CreateTransactionProps) => Promise<void>
}

export const TransactionsContext = createContext({} as TransactionsContextType)

export const TransactionsProvider = ({
  children,
}: TransactionsProviderProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const getTransactions = useCallback(async (query?: string) => {
    const response = await api.get('/transactions', {
      params: {
        _sort: 'createdAt',
        _order: 'desc',
        q: query,
      },
    })

    setTransactions(response.data)
  }, [])

  const createTransaction = useCallback(
    async (data: CreateTransactionProps) => {
      const response = await api.post('/transactions', {
        description: data.description,
        price: data.price,
        category: data.category,
        type: data.type,
        createdAt: new Date(),
      })

      const newTransaction = response.data

      setTransactions((transactions) => [newTransaction, ...transactions])
    },
    [],
  )

  useEffect(() => {
    getTransactions()
  }, [getTransactions])

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        getTransactions,
        createTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}
