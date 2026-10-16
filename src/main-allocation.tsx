// ABOUTME: Entry point for the ARM allocation page (allocation.html, served at token.armada.blue).
// ABOUTME: Loads the shared design styles, fixes the light theme, and mounts ArmAllocation.

import './styles/global.css'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/theme-overrides.css'
import { initFixedLightTheme } from '@/utils/theme'
import { initPageTransition } from '@/utils/pageTransition'
import { mountRoot } from '@/mountRoot'
import { ArmAllocation } from './pages/ArmAllocation'

initFixedLightTheme()
initPageTransition()

mountRoot(<ArmAllocation />)
