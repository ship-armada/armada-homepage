import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button, type ButtonSize, type ButtonVariant } from '@/components/Button'
import { IconButton, type IconButtonSize, type IconButtonVariant } from '@/components/IconButton'
import { Tag, type TagDot } from '@/components/Tag'
import {
  SegmentedControl,
  type SegmentedControlLayout,
  type SegmentedControlSize,
  type SegmentedControlSurface,
} from '@/components/SegmentedControl'
import { Steps } from '@/components/Steps'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TokenBadge } from '@/components/TokenBadge'
import { Tooltip } from '@/components/Tooltip'
import {
  BalanceActionButton,
  type BalanceActionButtonLayout,
  type BalanceActionButtonSurface,
  type BalanceActionButtonVariant,
} from '@/components/BalanceActionButton/BalanceActionButton'
import { ConfirmedScreenLayout } from '@/components/ConfirmedScreenLayout'
import { TextArea, type TextAreaSurface } from '@/components/TextArea'
import {
  TextField,
  type TextFieldSize,
  type TextFieldSurface,
  type TextFieldValueFont,
} from '@/components/TextField'
import styles from './SystemDocs.module.css'

const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'gradient', 'ink']
const BUTTON_SIZES: ButtonSize[] = ['sm', 'md', 'lg']
const ICON_VARIANTS: IconButtonVariant[] = ['solid', 'gradient', 'ghost', 'secondary', 'frosted', 'tinted']
const ICON_SIZES: IconButtonSize[] = ['sm', 'md', 'lg']
const TAG_DOTS: Array<TagDot | undefined> = [undefined, 'active', 'warning', 'error', 'neutral', 'lavender']
const SEG_SIZES: SegmentedControlSize[] = ['sm', 'md']
const SEG_LAYOUTS: SegmentedControlLayout[] = ['equal', 'scroll']
const SEG_SURFACES: SegmentedControlSurface[] = ['frost', 'raised']
const STEP_STATUS = ['default', 'error', 'confirmed'] as const
const BAB_VARIANTS: BalanceActionButtonVariant[] = ['primary', 'subtle']
const BAB_LAYOUTS: BalanceActionButtonLayout[] = ['circle', 'compact']
const BAB_SURFACES: BalanceActionButtonSurface[] = ['frost', 'tint']
const FIELD_SIZES: TextFieldSize[] = ['md', 'lg']
const FIELD_SURFACES: TextFieldSurface[] = ['frost', 'raised', 'frostRaised']
const FIELD_FONTS: TextFieldValueFont[] = ['ui', 'mono']
const AREA_SURFACES: TextAreaSurface[] = ['frostRaised', 'hover']

function CopyJsx({ code }: { code: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      showIcon={false}
      label="Copy JSX"
      onClick={() => void navigator.clipboard.writeText(code)}
    />
  )
}

export function ComponentPlayground({ name }: { name: string }) {
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>('primary')
  const [buttonSize, setButtonSize] = useState<ButtonSize>('md')
  const [iconVariant, setIconVariant] = useState<IconButtonVariant>('frosted')
  const [iconSize, setIconSize] = useState<IconButtonSize>('md')
  const [tagDot, setTagDot] = useState<string>('none')
  const [seg, setSeg] = useState('a')
  const [segSize, setSegSize] = useState<SegmentedControlSize>('md')
  const [segLayout, setSegLayout] = useState<SegmentedControlLayout>('equal')
  const [segSurface, setSegSurface] = useState<SegmentedControlSurface>('raised')
  const [stepStatus, setStepStatus] = useState<(typeof STEP_STATUS)[number]>('default')
  const [babVariant, setBabVariant] = useState<BalanceActionButtonVariant>('primary')
  const [babLayout, setBabLayout] = useState<BalanceActionButtonLayout>('circle')
  const [babSurface, setBabSurface] = useState<BalanceActionButtonSurface>('frost')
  const [fieldValue, setFieldValue] = useState('')
  const [fieldSize, setFieldSize] = useState<TextFieldSize>('md')
  const [fieldSurface, setFieldSurface] = useState<TextFieldSurface>('raised')
  const [fieldFont, setFieldFont] = useState<TextFieldValueFont>('mono')
  const [areaValue, setAreaValue] = useState('')
  const [areaSurface, setAreaSurface] = useState<TextAreaSurface>('frostRaised')

  if (name === 'Button') {
    const code = `<Button variant="${buttonVariant}" size="${buttonSize}" label="Button" />`
    return (
      <>
        <p className={styles.lead}>Pick a variant and size. Hover and keyboard-focus the live control.</p>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={BUTTON_VARIANTS.map((id) => ({ id, label: id }))}
            value={buttonVariant}
            onChange={setButtonVariant}
            size="sm"
            layout="scroll"
            surface="raised"
            aria-label="Button variant"
          />
          <SegmentedControl
            options={BUTTON_SIZES.map((id) => ({ id, label: id }))}
            value={buttonSize}
            onChange={setButtonSize}
            size="sm"
            surface="raised"
            aria-label="Button size"
          />
          <CopyJsx code={code} />
        </div>
        <div className={styles.playground}>
          <Button variant={buttonVariant} size={buttonSize} label="Button" />
          <Button variant={buttonVariant} size={buttonSize} label="Disabled" disabled />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'IconButton') {
    const code = `<IconButton variant="${iconVariant}" size="${iconSize}" aria-label="Add" icon={<PlusIcon />} />`
    return (
      <>
        <p className={styles.lead}>Icon stays the same size; the hit target changes with size.</p>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={ICON_VARIANTS.map((id) => ({ id, label: id }))}
            value={iconVariant}
            onChange={setIconVariant}
            size="sm"
            layout="scroll"
            surface="raised"
            aria-label="IconButton variant"
          />
          <SegmentedControl
            options={ICON_SIZES.map((id) => ({ id, label: id }))}
            value={iconSize}
            onChange={setIconSize}
            size="sm"
            surface="raised"
            aria-label="IconButton size"
          />
          <CopyJsx code={code} />
        </div>
        <div className={styles.playground}>
          <IconButton
            variant={iconVariant}
            size={iconSize}
            aria-label="Add"
            icon={<PlusIcon strokeWidth={1.5} />}
          />
          <IconButton
            variant={iconVariant}
            size={iconSize}
            aria-label="Add disabled"
            icon={<PlusIcon strokeWidth={1.5} />}
            disabled
          />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'Tag') {
    const dot = tagDot === 'none' ? undefined : (tagDot as TagDot)
    const code = dot ? `<Tag label="${dot}" dot="${dot}" />` : '<Tag label="Label" />'
    return (
      <>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={TAG_DOTS.map((id) => ({ id: id ?? 'none', label: id ?? 'none' }))}
            value={tagDot}
            onChange={setTagDot}
            size="sm"
            layout="scroll"
            surface="raised"
            aria-label="Tag dot"
          />
          <CopyJsx code={code} />
        </div>
        <div className={styles.playground}>
          <Tag label={dot ?? 'Label'} dot={dot} />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'SegmentedControl') {
    const options = [
      { id: 'a', label: 'One' },
      { id: 'b', label: 'Two' },
      { id: 'c', label: 'Three' },
    ]
    const code = `<SegmentedControl size="${segSize}" layout="${segLayout}" surface="${segSurface}" options={…} />`
    return (
      <>
        <p className={styles.lead}>
          Use frost on the dashboard wash and raised on opaque sheets. Scroll layout for many options.
        </p>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={SEG_SURFACES.map((id) => ({ id, label: id }))}
            value={segSurface}
            onChange={setSegSurface}
            size="sm"
            surface="raised"
            aria-label="Surface"
          />
          <SegmentedControl
            options={SEG_SIZES.map((id) => ({ id, label: id }))}
            value={segSize}
            onChange={setSegSize}
            size="sm"
            surface="raised"
            aria-label="Size"
          />
          <SegmentedControl
            options={SEG_LAYOUTS.map((id) => ({ id, label: id }))}
            value={segLayout}
            onChange={setSegLayout}
            size="sm"
            surface="raised"
            aria-label="Layout"
          />
          <CopyJsx code={code} />
        </div>
        <div className={styles.playground}>
          <SegmentedControl
            options={options}
            value={seg}
            onChange={setSeg}
            size={segSize}
            layout={segLayout}
            surface={segSurface}
            aria-label="Demo segmented control"
          />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'Steps') {
    const code = `<Steps steps={['Connect','Commit','Confirm']} currentStep={2} status="${stepStatus}" />`
    return (
      <>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={STEP_STATUS.map((id) => ({ id, label: id }))}
            value={stepStatus}
            onChange={setStepStatus}
            size="sm"
            surface="raised"
            aria-label="Steps status"
          />
          <CopyJsx code={code} />
        </div>
        <div className={styles.playground}>
          <Steps steps={['Connect', 'Commit', 'Confirm']} currentStep={2} status={stepStatus} />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'ThemeToggle') {
    return (
      <>
        <p className={styles.lead}>Same control as the docs header. It writes data-theme on the document.</p>
        <div className={styles.toolbar}>
          <CopyJsx code="<ThemeToggle />" />
        </div>
        <div className={styles.playground}>
          <ThemeToggle />
        </div>
      </>
    )
  }

  if (name === 'TokenBadge') {
    return (
      <>
        <div className={styles.toolbar}>
          <CopyJsx code="<TokenBadge />" />
        </div>
        <div className={styles.playground}>
          <TokenBadge />
        </div>
      </>
    )
  }

  if (name === 'Tooltip') {
    return (
      <>
        <p className={styles.lead}>Hover or focus the buttons. Variants: centered, rich, action.</p>
        <div className={styles.toolbar}>
          <CopyJsx code={`<Tooltip variant="centered" content="Hint"><Button /></Tooltip>`} />
        </div>
        <div className={styles.playground}>
          <Tooltip variant="centered" content="Hint">
            <Button label="Centered" showIcon={false} />
          </Tooltip>
          <Tooltip variant="rich" title="Title" description="Description">
            <Button label="Rich" showIcon={false} variant="secondary" />
          </Tooltip>
          <Tooltip variant="action" content="Action hint">
            <Button label="Action" showIcon={false} variant="ghost" />
          </Tooltip>
        </div>
      </>
    )
  }

  if (name === 'BalanceActionButton') {
    const code = `<BalanceActionButton label="Shield" variant="${babVariant}" layout="${babLayout}" surface="${babSurface}" />`
    return (
      <>
        <p className={styles.lead}>Frost on the dashboard gem wash; tint on opaque panels.</p>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={BAB_SURFACES.map((id) => ({ id, label: id }))}
            value={babSurface}
            onChange={setBabSurface}
            size="sm"
            surface="raised"
            aria-label="Surface"
          />
          <SegmentedControl
            options={BAB_VARIANTS.map((id) => ({ id, label: id }))}
            value={babVariant}
            onChange={setBabVariant}
            size="sm"
            surface="raised"
            aria-label="Variant"
          />
          <SegmentedControl
            options={BAB_LAYOUTS.map((id) => ({ id, label: id }))}
            value={babLayout}
            onChange={setBabLayout}
            size="sm"
            surface="raised"
            aria-label="Layout"
          />
          <CopyJsx code={code} />
        </div>
        <div className={styles.playground}>
          <BalanceActionButton
            label="Shield"
            icon={<PlusIcon strokeWidth={1.5} />}
            variant={babVariant}
            layout={babLayout}
            surface={babSurface}
          />
          <BalanceActionButton
            label="Shield"
            icon={<PlusIcon strokeWidth={1.5} />}
            variant={babVariant}
            layout={babLayout}
            surface={babSurface}
            disabled
          />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'TextField') {
    const code = `<TextField size="${fieldSize}" surface="${fieldSurface}" valueFont="${fieldFont}" />`
    return (
      <>
        <p className={styles.lead}>
          Search uses md + raised + mono. Address uses lg + frostRaised + mono + clearable.
        </p>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={FIELD_SIZES.map((id) => ({ id, label: id }))}
            value={fieldSize}
            onChange={setFieldSize}
            size="sm"
            surface="raised"
            aria-label="TextField size"
          />
          <SegmentedControl
            options={FIELD_SURFACES.map((id) => ({ id, label: id }))}
            value={fieldSurface}
            onChange={setFieldSurface}
            size="sm"
            layout="scroll"
            surface="raised"
            aria-label="TextField surface"
          />
          <SegmentedControl
            options={FIELD_FONTS.map((id) => ({ id, label: id }))}
            value={fieldFont}
            onChange={setFieldFont}
            size="sm"
            surface="raised"
            aria-label="TextField value font"
          />
          <CopyJsx code={code} />
        </div>
        <div className={`${styles.playground} ${styles.playgroundStack}`}>
          <TextField
            size={fieldSize}
            surface={fieldSurface}
            valueFont={fieldFont}
            value={fieldValue}
            onChange={(event) => setFieldValue(event.target.value)}
            placeholder="Enter address"
            aria-label="Demo text field"
            clearable
            onClear={() => setFieldValue('')}
            leading={<PlusIcon strokeWidth={1.75} />}
          />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'TextArea') {
    const code = `<TextArea surface="${areaSurface}" showCount />`
    return (
      <>
        <p className={styles.lead}>Request note field. Hover surface is for the mobile details sheet.</p>
        <div className={styles.toolbar}>
          <SegmentedControl
            options={AREA_SURFACES.map((id) => ({ id, label: id }))}
            value={areaSurface}
            onChange={setAreaSurface}
            size="sm"
            surface="raised"
            aria-label="TextArea surface"
          />
          <CopyJsx code={code} />
        </div>
        <div className={`${styles.playground} ${styles.playgroundStack}`}>
          <TextArea
            surface={areaSurface}
            value={areaValue}
            onChange={(event) => setAreaValue(event.target.value)}
            placeholder="For invoice #123"
            rows={2}
            maxLength={80}
            showCount
            aria-label="Demo note"
          />
        </div>
        <pre className={styles.code}>{code}</pre>
      </>
    )
  }

  if (name === 'ConfirmedScreenLayout') {
    return (
      <>
        <p className={styles.lead}>Shared chrome for deposit, send, earn, and payment confirmed steps.</p>
        <div className={styles.toolbar}>
          <CopyJsx code='<ConfirmedScreenLayout title="USDC shield confirmed" amountLabel="$100.00" />' />
        </div>
        <div className={styles.playground}>
          <ConfirmedScreenLayout
            title="USDC shield confirmed"
            amountLabel="$100.00"
            onViewExplorer={() => undefined}
            onGoToDashboard={() => undefined}
          >
            <p className={styles.lead}>Review summary goes here.</p>
          </ConfirmedScreenLayout>
        </div>
      </>
    )
  }

  return null
}
