// mobile/src/components/Icon.tsx
// Ponto único de iconografia do app (Phosphor). Os nomes seguem o vocabulário que o app
// já usava (padrão Feather) + nomes ecológicos novos. Para trocar a biblioteca no futuro,
// basta alterar este arquivo.
import React from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { Icon as PhosphorIcon, IconWeight } from 'phosphor-react-native';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { ArrowRightIcon } from 'phosphor-react-native/src/icons/ArrowRight';
import { ArrowsOutIcon } from 'phosphor-react-native/src/icons/ArrowsOut';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BinocularsIcon } from 'phosphor-react-native/src/icons/Binoculars';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CameraIcon } from 'phosphor-react-native/src/icons/Camera';
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { CaretUpIcon } from 'phosphor-react-native/src/icons/CaretUp';
import { ChatCircleIcon } from 'phosphor-react-native/src/icons/ChatCircle';
import { ChatTeardropTextIcon } from 'phosphor-react-native/src/icons/ChatTeardropText';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { CircleIcon } from 'phosphor-react-native/src/icons/Circle';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { ClockCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ClockCounterClockwise';
import { CrosshairIcon } from 'phosphor-react-native/src/icons/Crosshair';
import { CrownIcon } from 'phosphor-react-native/src/icons/Crown';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { EyeIcon } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';
import { FunnelIcon } from 'phosphor-react-native/src/icons/Funnel';
import { GlobeHemisphereWestIcon } from 'phosphor-react-native/src/icons/GlobeHemisphereWest';
import { HashIcon } from 'phosphor-react-native/src/icons/Hash';
import { HeartIcon } from 'phosphor-react-native/src/icons/Heart';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { ImageIcon } from 'phosphor-react-native/src/icons/Image';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { LeafIcon } from 'phosphor-react-native/src/icons/Leaf';
import { LightningIcon } from 'phosphor-react-native/src/icons/Lightning';
import { LinkIcon } from 'phosphor-react-native/src/icons/Link';
import { ListBulletsIcon } from 'phosphor-react-native/src/icons/ListBullets';
import { LockIcon } from 'phosphor-react-native/src/icons/Lock';
import { MagnifyingGlassIcon } from 'phosphor-react-native/src/icons/MagnifyingGlass';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { MapTrifoldIcon } from 'phosphor-react-native/src/icons/MapTrifold';
import { MedalIcon } from 'phosphor-react-native/src/icons/Medal';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { NavigationArrowIcon } from 'phosphor-react-native/src/icons/NavigationArrow';
import { PaperPlaneTiltIcon } from 'phosphor-react-native/src/icons/PaperPlaneTilt';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import { RecycleIcon } from 'phosphor-react-native/src/icons/Recycle';
import { ShieldCheckIcon } from 'phosphor-react-native/src/icons/ShieldCheck';
import { SignInIcon } from 'phosphor-react-native/src/icons/SignIn';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import { StackIcon } from 'phosphor-react-native/src/icons/Stack';
import { StarIcon } from 'phosphor-react-native/src/icons/Star';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { TargetIcon } from 'phosphor-react-native/src/icons/Target';
import { ThumbsUpIcon } from 'phosphor-react-native/src/icons/ThumbsUp';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { TrayIcon } from 'phosphor-react-native/src/icons/Tray';
import { UploadSimpleIcon } from 'phosphor-react-native/src/icons/UploadSimple';
import { UserIcon } from 'phosphor-react-native/src/icons/User';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import { XIcon } from 'phosphor-react-native/src/icons/X';

const ICONS = {
  // Navegação e ações
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'chevron-down': CaretDownIcon,
  'chevron-left': CaretLeftIcon,
  'chevron-right': CaretRightIcon,
  'chevron-up': CaretUpIcon,
  'maximize-2': ArrowsOutIcon,
  'log-in': SignInIcon,
  'log-out': SignOutIcon,
  plus: PlusIcon,
  x: XIcon,
  check: CheckIcon,
  search: MagnifyingGlassIcon,
  send: PaperPlaneTiltIcon,
  upload: UploadSimpleIcon,
  'trash-2': TrashIcon,
  link: LinkIcon,
  funnel: FunnelIcon,
  history: ClockCounterClockwiseIcon,
  // Estado e feedback
  'alert-circle': WarningCircleIcon,
  'alert-triangle': WarningIcon,
  'check-circle': CheckCircleIcon,
  'help-circle': QuestionIcon,
  info: InfoIcon,
  bell: BellIcon,
  circle: CircleIcon,
  // Conteúdo
  calendar: CalendarBlankIcon,
  camera: CameraIcon,
  clock: ClockIcon,
  'file-text': FileTextIcon,
  hash: HashIcon,
  heart: HeartIcon,
  home: HouseIcon,
  image: ImageIcon,
  inbox: TrayIcon,
  layers: StackIcon,
  list: ListBulletsIcon,
  lock: LockIcon,
  'message-circle': ChatCircleIcon,
  'message-square': ChatTeardropTextIcon,
  'thumbs-up': ThumbsUpIcon,
  user: UserIcon,
  eye: EyeIcon,
  'eye-off': EyeSlashIcon,
  sun: SunIcon,
  moon: MoonIcon,
  zap: LightningIcon,
  // Mapa e localização
  map: MapTrifoldIcon,
  'map-pin': MapPinIcon,
  navigation: NavigationArrowIcon,
  crosshair: CrosshairIcon,
  target: TargetIcon,
  // Gamificação
  award: MedalIcon,
  star: StarIcon,
  shield: ShieldCheckIcon,
  crown: CrownIcon,
  binoculars: BinocularsIcon,
  // Identidade ecológica
  leaf: LeafIcon,
  plant: PlantIcon,
  recycle: RecycleIcon,
  drop: DropIcon,
  globe: GlobeHemisphereWestIcon,
} satisfies Record<string, PhosphorIcon>;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  style?: StyleProp<ViewStyle | Omit<TextStyle, 'cursor'>>;
};

export function Icon({ name, size = 22, color, weight = 'regular', style }: IconProps) {
  const Component = ICONS[name] ?? CircleIcon;
  return <Component size={size} color={color} weight={weight} style={style} />;
}
