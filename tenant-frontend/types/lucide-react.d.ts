// types/lucide-react.d.ts
declare module "lucide-react" {
  import * as React from "react";

  type Icon = React.FC<React.SVGProps<SVGSVGElement>>;

  // Export individual icons (alphabetical order)
  export const AlertCircle: Icon;
  export const ArrowRight: Icon;
  export const AudioWaveform: Icon;
  export const BadgeCheck: Icon;
  export const BarChart: Icon;
  export const Bell: Icon;
  export const BookOpen: Icon;
  export const Bot: Icon;
  export const Briefcase: Icon;
  export const Building: Icon;
  export const Calendar: Icon;
  export const Check: Icon;
  export const CheckCircle: Icon;
  export const CheckIcon: Icon;
  export const CheckSquare: Icon;
  export const ChevronDown: Icon;
  export const ChevronDownIcon: Icon;
  export const ChevronRight: Icon;
  export const ChevronRightIcon: Icon;
  export const ChevronUpIcon: Icon;
  export const ChevronsUpDown: Icon;
  export const CircleIcon: Icon;
  export const Clock: Icon;
  export const Command: Icon;
  export const CreditCard: Icon;
  export const Crown: Icon;
  export const Download: Icon;
  export const Edit: Icon;
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const ExternalLink: Icon;
  export const FileText: Icon;
  export const Filter: Icon;
  export const Folder: Icon;
  export const Forward: Icon;
  export const Frame: Icon;
  export const GalleryVerticalEnd: Icon;
  export const Globe: Icon;
  export const GripVertical: Icon;
  export const HelpCircle: Icon;
  export const Home: Icon;
  export const Info: Icon;
  export const Int: Icon;
  export const Key: Icon;
  export const LayoutDashboard: Icon;
  export const LayoutGrid: Icon;
  export const Layers: Icon;
  export const Link: Icon;
  export const Loader2: Icon;
  export const Lock: Icon;
  export const LogOut: Icon;
  export const LucideIcon: Icon;
  export const Mail: Icon;
  export const Map: Icon;
  export const Menu: Icon;
  export const Moon: Icon;
  export const MoreHorizontal: Icon;
  export const MoreVertical: Icon;
  export const PieChart: Icon;
  export const Plus: Icon;
  export const RefreshCw: Icon;
  export const Search: Icon;
  export const Settings: Icon;
  export const Settings2: Icon;
  export const Share: Icon;
  export const Shield: Icon;
  export const Sparkles: Icon;
  export const SquareTerminal: Icon;
  export const Sun: Icon;
  export const Target: Icon;
  export const Trash: Icon;
  export const Trash2: Icon;
  export const TrendingUp: Icon;
  export const Upload: Icon;
  export const User: Icon;
  export const UserCircle: Icon;
  export const UserIcon: Icon;
  export const UserPlus: Icon;
  export const Users: Icon;
  export const X: Icon;
  export const XCircle: Icon;
  export const XIcon: Icon;
  export const ChevronLeft: Icon;
  export const Github: Icon;
  export const Apple: Icon;

  // Note: Some icons like "Trash2" and "ChevronsUpDown" don't exist in lucide-react
  // They should be replaced with "Trash" and appropriate alternatives

  // Type for dynamic imports
  export type IconType = Icon;

  // Export default if needed for dynamic imports
  const icons: { [key: string]: Icon };
  export default icons;
}
