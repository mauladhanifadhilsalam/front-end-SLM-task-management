"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { IconCheck } from "@tabler/icons-react"
import {
  type ProjectOwnerField,
} from "@/schemas/project-owner.schema"
import { useCreateProjectOwnerForm } from "../hooks/use-create-project-owner-form"

type Props = {
  onSuccess?: () => void
}

export const CreateProjectOwnerForm: React.FC<Props> = ({ onSuccess }) => {
    const {
        form,
        errors,
        saving,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useCreateProjectOwnerForm({
        onSuccess: () => {
        if (onSuccess) onSuccess()
        },
    })

    const handleInputChange =
        (field: ProjectOwnerField) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleChange(field, e.target.value)
        }

    const handleInputBlur = (field: ProjectOwnerField) => () =>
        handleBlur(field)

    return (
        <Card>
        <CardHeader>
            <CardTitle>Informasi Owner</CardTitle>
            <CardDescription>
            Isi data owner yang akan ditambahkan.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
            >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input
                    id="name"
                    value={form.name}
                    onChange={handleInputChange("name")}
                    onBlur={handleInputBlur("name")}
                    placeholder="Nama lengkap"
                    disabled={saving}
                    aria-invalid={!!errors.name}
                    required
                />
                {errors.name && (
                    <p className="text-xs text-red-600 mt-1">
                    {errors.name}
                    </p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                    id="company"
                    value={form.company}
                    onChange={handleInputChange("company")}
                    onBlur={handleInputBlur("company")}
                    placeholder="Nama perusahaan"
                    disabled={saving}
                    aria-invalid={!!errors.company}
                    required
                />
                {errors.company && (
                    <p className="text-xs text-red-600 mt-1">
                    {errors.company}
                    </p>
                )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange("email")}
                    onBlur={handleInputBlur("email")}
                    placeholder="owner@company.id"
                    disabled={saving}
                    aria-invalid={!!errors.email}
                    required
                />
                {errors.email && (
                    <p className="text-xs text-red-600 mt-1">
                    {errors.email}
                    </p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                    id="phone"
                    value={form.phone}
                    onChange={handleInputChange("phone")}
                    onBlur={handleInputBlur("phone")}
                    placeholder="+62xxxxxxxxx / 08xxxxxxxxx"
                    disabled={saving}
                    aria-invalid={!!errors.phone}
                    required
                />
                {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">
                    {errors.phone}
                    </p>
                )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                id="address"
                value={form.address}
                onChange={handleInputChange("address")}
                onBlur={handleInputBlur("address")}
                placeholder="Tulis alamat lengkap di sini"
                disabled={saving}
                aria-invalid={!!errors.address}
                required
                className="min-h-[100px] resize-y"
                />
                {errors.address && (
                <p className="text-xs text-red-600 mt-1">
                    {errors.address}
                </p>
                )}
            </div>

            <div className="flex justify-end space-x-3">
                <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer"
                >
                <IconCheck className="mr-2 h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Owner"}
                </Button>
            </div>
            </form>
        </CardContent>
        </Card>
    )
}
