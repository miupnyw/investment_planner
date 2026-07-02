import type { SvgIconComponent } from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WorkIcon from "@mui/icons-material/Work";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PeopleIcon from "@mui/icons-material/People";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import type { AreaId } from "@/modules/wheel/wheelOfLife";

// Icon per life area, mirroring the navbar. Kept in the UI layer so the pure
// scoring logic in wheelOfLife.ts stays free of MUI imports.
export const AREA_ICONS: Record<AreaId, SvgIconComponent> = {
  financial: AccountBalanceWalletIcon,
  career: WorkIcon,
  health: HealthAndSafetyIcon,
  relationships: PeopleIcon,
  personalGrowth: SelfImprovementIcon,
  leisure: BeachAccessIcon,
};
