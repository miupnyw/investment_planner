import type { SvgIconComponent } from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WorkIcon from "@mui/icons-material/Work";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PeopleIcon from "@mui/icons-material/People";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export type NavChild = {
  href: string;
  labelKey: string;
  icon: SvgIconComponent;
};

export type NavItem = {
  href: string;
  labelKey: string;
  icon: SvgIconComponent;
  children?: NavChild[];
};

// Top-level life areas shown in the navbar. Financial holds the calculators as
// a submenu.
export const NAV_LINKS: NavItem[] = [
  {
    href: "/finance",
    labelKey: "navFinancial",
    icon: AccountBalanceWalletIcon,
    children: [
      { href: "/finance/dca", labelKey: "navDCA", icon: TrendingUpIcon },
      { href: "/finance/tax", labelKey: "navTax", icon: ReceiptLongIcon },
    ],
  },
  { href: "/career", labelKey: "navCareer", icon: WorkIcon },
  { href: "/health", labelKey: "navHealth", icon: HealthAndSafetyIcon },
  {
    href: "/relationships",
    labelKey: "navRelationships",
    icon: PeopleIcon,
  },
  {
    href: "/personal-growth",
    labelKey: "navPersonalGrowth",
    icon: SelfImprovementIcon,
  },
  { href: "/leisure", labelKey: "navLeisure", icon: BeachAccessIcon },
];
