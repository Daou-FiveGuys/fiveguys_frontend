/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
        gothic: ['GothicA1-Light', 'GothicA1-Light']
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          baseLight: 'hsl(220, 15%, 20%)',
          hoverLight: 'hsl(220, 15%, 10%)',
          baseDark: 'hsl(0, 0%, 85%)',
          hoverDark: 'hsl(0, 0%, 100%)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            fontSize: '18px',
            lineHeight: '1.6',
            fontWeight: '300',
            color: theme('colors.foreground'),
            h1: {
              fontFamily: theme('fontFamily.gothic'),
              fontSize: theme('fontSize.3xl'),
              fontWeight: 'bold',
              color: theme('colors.foreground')
            },
            h2: {
              fontFamily: theme('fontFamily.gothic'),
              fontSize: theme('fontSize.2xl'),
              fontWeight: 'semibold',
              color: theme('colors.foreground')
            },
            p: {
              marginBottom: '0.4em', // 문단 간 간격 최소화
              fontWeight: '300',
              color: theme('colors.foreground'),
              lineHeight: '1.8'
            },
            strong: {
              fontWeight: 'bold',
              backgroundColor: 'transparent',
              color: theme('colors.primary.DEFAULT')
            },
            ul: {
              paddingLeft: theme('spacing.4'), // 리스트 들여쓰기
              marginBottom: '0.2em', // 리스트 간 간격 최소화
              color: theme('colors.muted.foreground'),
              fontSize: '16px'
            },
            ol: {
              paddingLeft: theme('spacing.4'),
              marginBottom: '0.2em',
              color: theme('colors.muted.foreground'),
              fontSize: '16px'
            },
            li: {
              marginBottom: '0.1em',
              lineHeight: '1.5'
            },
            'p + p': {
              marginTop: '0.2em'
            },
            pre: {
              margin: 0
            },
            'p br': {
              display: 'none'
            },
            'p + ol': {
              marginTop: '0.2em'
            },
            'p + ul': {
              marginTop: '0.2em'
            },
            a: {
              color: theme('colors.primary.baseLight'),
              '&:hover': {
                color: theme('colors.primary.hoverLight')
              }
            }
          }
        },
        dark: {
          css: {
            color: theme('colors.foreground'),
            fontWeight: '300',
            a: {
              color: theme('colors.primary.baseDark'),
              '&:hover': {
                color: theme('colors.primary.hoverDark')
              }
            },
            ul: {
              color: theme('colors.foreground'),
              fontSize: '16px'
            },
            ol: {
              color: theme('colors.foreground'),
              fontSize: '16px'
            },
            strong: {
              color: theme('colors.foreground'),
              backgroundColor: 'transparent'
            }
          }
        }
      })
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar-hide')
  ]
}
