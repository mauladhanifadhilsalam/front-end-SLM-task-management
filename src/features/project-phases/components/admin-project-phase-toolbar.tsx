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
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Input
          placeholder="Filter by phase or project name..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full sm:max-w-xs md:w-80"
        />
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:justify-end md:ml-auto md:w-auto">
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
      </div>
      <Button
        size="sm"
        onClick={onCreateClick}
        className="w-full cursor-pointer sm:w-auto"
      >
        <IconPlus className="mr-2 h-4 w-4" />
        Add Phase
      </Button>
    </div>
  );
};
