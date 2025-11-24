"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronsUpDown, Check } from "lucide-react"
import { ProjectOwnerLite } from "@/types/project.type"
import { cn } from "@/lib/utils"

type Props = {
  owners: ProjectOwnerLite[]
  ownerId?: number
  openOwner: boolean
  setOpenOwner: (open: boolean) => void
  loading: boolean
  onOwnerChange: (ownerId: number) => void
}

export const ProjectClientSection: React.FC<Props> = ({
  owners,
  ownerId,
  openOwner,
  setOpenOwner,
  loading,
  onOwnerChange,
}) => {
  const selectedOwner = owners.find((o) => o.id === ownerId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label>Client</Label>
        <Popover open={openOwner} onOpenChange={setOpenOwner}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !ownerId && "text-muted-foreground",
              )}
              disabled={loading}
            >
              {selectedOwner
                ? selectedOwner.company || selectedOwner.name
                : "Pilih client..."}
              <ChevronsUpDown className="opacity-50 size-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-full" align="start">
            <Command>
              <CommandInput placeholder="Cari client..." />
              <CommandList>
                {owners.length === 0 && (
                  <CommandItem disabled>
                    Tidak ada owner ditemukan.
                  </CommandItem>
                )}
                {owners.map((c) => (
                  <CommandItem
                    key={c.id}
                    onSelect={() => {
                      onOwnerChange(c.id)
                      setOpenOwner(false)
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        c.id === ownerId ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c.name} — {c.company}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Penanggung Jawab</Label>
        <Input
          value={selectedOwner ? selectedOwner.name : "Pilih client terlebih dahulu"}
          disabled
        />
      </div>
    </div>
  )
}
