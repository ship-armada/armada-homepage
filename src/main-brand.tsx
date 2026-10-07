import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/theme-overrides.css'
import { initFixedLightTheme } from '@/utils/theme'
import { initPageTransition } from '@/utils/pageTransition'
import { mountRoot } from '@/mountRoot'
import { Brand } from './pages/Brand'

initFixedLightTheme()
initPageTransition()

mountRoot(<Brand />)
