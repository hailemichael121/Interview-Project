// types/lucide-react.d.ts
declare module "lucide-react" {
  import * as React from "react";

  type Icon = React.FC<React.SVGProps<SVGSVGElement>>;

  // Export individual icons
  export const Eye: Icon;
  export const EyeOff: Icon;
  export const Mail: Icon;
  export const Lock: Icon;
  export const ArrowRight: Icon;
  export const FileText: Icon;
  export const Users: Icon;
  export const LayoutGrid: Icon;
  export const Layers: Icon;
  export const Menu: Icon;
  export const Search: Icon;
  export const Home: Icon;
  export const X: Icon;
  export const Int: Icon;
  export const Settings: Icon;
  export const LogOut: Icon;
  export const User: Icon;
  export const UserCircle: Icon;
  export const UserIcon: Icon;
  export const Building: Icon;
  export const Briefcase: Icon;
  export const Folder: Icon;
  export const ChevronRight: Icon;
  export const ChevronDown: Icon;
  export const Plus: Icon;
  export const MoreVertical: Icon;
  export const Edit: Icon;
  export const Trash: Icon;
  export const Check: Icon;
  export const Clock: Icon;
  export const AlertCircle: Icon;
  export const BarChart: Icon;
  export const Bell: Icon;
  export const Calendar: Icon;
  export const Filter: Icon;
  export const Download: Icon;
  export const Upload: Icon;
  export const Share: Icon;
  export const Link: Icon;
  export const Globe: Icon;
  export const Shield: Icon;
  export const Key: Icon;
  export const HelpCircle: Icon;
  export const Info: Icon;
  export const ExternalLink: Icon;

  // Export default if needed for dynamic imports
  const icons: { [key: string]: Icon };
  export default icons;
}
