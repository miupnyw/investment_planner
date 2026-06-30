import type { SvgIconComponent } from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WorkIcon from "@mui/icons-material/Work";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import ParkIcon from "@mui/icons-material/Park";
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

// Top-level "Wheel of Life" areas shown in the navbar. Finance holds the
// calculators as a submenu.
export const NAV_LINKS: NavItem[] = [
  {
    href: "/finance",
    labelKey: "navFinance",
    icon: AccountBalanceWalletIcon,
    children: [
      { href: "/dca", labelKey: "navDCA", icon: TrendingUpIcon },
      { href: "/tax", labelKey: "navTax", icon: ReceiptLongIcon },
    ],
  },
  { href: "/work", labelKey: "navWork", icon: WorkIcon },
  { href: "/health", labelKey: "navHealth", icon: HealthAndSafetyIcon },
  {
    href: "/relationships",
    labelKey: "navRelationships",
    icon: PeopleIcon,
  },
  { href: "/learning", labelKey: "navLearning", icon: SchoolIcon },
  { href: "/mind", labelKey: "navMind", icon: SelfImprovementIcon },
  { href: "/recreation", labelKey: "navRecreation", icon: BeachAccessIcon },
  { href: "/environment", labelKey: "navEnvironment", icon: ParkIcon },
];
