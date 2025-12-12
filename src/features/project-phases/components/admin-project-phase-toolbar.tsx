import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  IconLayoutGrid,
  IconChevronDown,
  IconPlus,
} from "@tabler/icons-react";
import type { PhaseColumnState } from "../hooks/use-admin-project-phase-list";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  cols: PhaseColumnState;
  onToggleColumn: (key: keyof PhaseColumnState, value: boolean) => void;
  onCreateClick: () => void;
};

export const AdminProjectPhaseToolbar: React.FC<Props> = ({
  query,
  onQueryChange,
  cols,
  onToggleColumn,
  onCreateClick,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Mobile & Tablet: Stack vertically, Desktop: Single row with space-between */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        {/* Left Group: Search Input */}
        <Input
          placeholder="Filter by phase or project name..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full lg:flex-1 lg:max-w-md"
        />

        {/* Right Group: Buttons - Only visible on Desktop */}
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="flex items-center gap-2 cursor-pointer"
              >
                <IconLayoutGrid className="h-4 w-4" />
                <span>Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={cols.id}
                onCheckedChange={(v) => onToggleColumn("id", !!v)}
              >
                ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.name}
                onCheckedChange={(v) => onToggleColumn("name", !!v)}
              >
                Phase Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.projectName}
                onCheckedChange={(v) => onToggleColumn("projectName", !!v)}
              >
                Project Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.phaseStart}
                onCheckedChange={(v) => onToggleColumn("phaseStart", !!v)}
              >
                Phase Start
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.phaseEnd}
                onCheckedChange={(v) => onToggleColumn("phaseEnd", !!v)}
              >
                Phase End
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.projectDates}
                onCheckedChange={(v) => onToggleColumn("projectDates", !!v)}
              >
                Project Timeline
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.status}
                onCheckedChange={(v) => onToggleColumn("status", !!v)}
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={cols.actions}
                onCheckedChange={(v) => onToggleColumn("actions", !!v)}
              >
                Actions
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={onCreateClick}
            className="cursor-pointer"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Add Phase
          </Button>
        </div>
      </div>

      {/* Buttons Row - Only visible on Mobile & Tablet */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="self-start sm:self-auto flex items-center gap-2 cursor-pointer"
            >
              <IconLayoutGrid className="h-4 w-4" />
              <span>Columns</span>
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={cols.id}
              onCheckedChange={(v) => onToggleColumn("id", !!v)}
            >
              ID
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.name}
              onCheckedChange={(v) => onToggleColumn("name", !!v)}
            >
              Phase Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.projectName}
              onCheckedChange={(v) => onToggleColumn("projectName", !!v)}
            >
              Project Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.phaseStart}
              onCheckedChange={(v) => onToggleColumn("phaseStart", !!v)}
            >
              Phase Start
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.phaseEnd}
              onCheckedChange={(v) => onToggleColumn("phaseEnd", !!v)}
            >
              Phase End
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.projectDates}
              onCheckedChange={(v) => onToggleColumn("projectDates", !!v)}
            >
              Project Timeline
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.status}
              onCheckedChange={(v) => onToggleColumn("status", !!v)}
            >
              Status
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={cols.actions}
              onCheckedChange={(v) => onToggleColumn("actions", !!v)}
            >
              Actions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          onClick={onCreateClick}
          className="w-full sm:w-auto cursor-pointer"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add Phase
        </Button>
      </div>
    </div>
  );
};