import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bot,
  Building2,
  Calendar,
  Check,
  Clock,
  Database,
  FileText,
  Handshake,
  Hourglass,
  Layers,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  Package,
  Phone,
  Puzzle,
  Receipt,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Table2,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Wrench,
  X,
  Zap,
  ChartColumn,
  ArrowRight,
} from "lucide-react";
import type { IconName } from "../types.ts";

const ICONS: Record<IconName, LucideIcon> = {
  "chart-up": TrendingUp,
  chart: ChartColumn,
  users: Users,
  clock: Clock,
  hourglass: Hourglass,
  chat: MessageCircle,
  mail: Mail,
  phone: Phone,
  zap: Zap,
  settings: Settings,
  wrench: Wrench,
  file: FileText,
  table: Table2,
  receipt: Receipt,
  cart: ShoppingCart,
  package: Package,
  database: Database,
  workflow: Workflow,
  layers: Layers,
  puzzle: Puzzle,
  bot: Bot,
  target: Target,
  check: Check,
  x: X,
  alert: AlertTriangle,
  shield: ShieldCheck,
  megaphone: Megaphone,
  rocket: Rocket,
  handshake: Handshake,
  calendar: Calendar,
  search: Search,
  idea: Lightbulb,
  building: Building2,
  arrow: ArrowRight,
};

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}> = ({ name, size = 56, color = "currentColor", strokeWidth = 2 }) => {
  const Component = ICONS[name];
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
};
