// components/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { Provider } from 'react-redux'
import { store } from '@/redux/store'

interface ProvidersProps {
  children: React.ReactNode
  attribute: string
  defaultTheme: string
  enableSystem: boolean
  disableTransitionOnChange: boolean
}

export function Providers({
  children,
  attribute,
  defaultTheme,
  enableSystem,
  disableTransitionOnChange
}: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute={attribute}
        defaultTheme={defaultTheme}
        enableSystem={enableSystem}
        disableTransitionOnChange={disableTransitionOnChange}
      >
        {children}
      </ThemeProvider>
    </Provider>
  )
}
