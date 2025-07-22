"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/app/components/ui/select";
import { useChairs } from "@/app/hooks/useChairs";
import {
  chairModalOpenAtom,
  chairEditModalOpenAtom,
  selectedChairAtom,
} from "@/app/atoms/chairAtoms";
import {
  chairSchema,
  chairUpdateSchema,
  ChairUpdateFormData,
  getStatusOptions,
  getStatusLabel,
  ChairStatusKey,
  ChairFormData,
} from "@/app/schemas/chairSchema";

const ChairModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(chairModalOpenAtom);
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(chairEditModalOpenAtom);
  const [selectedChair, setSelectedChair] = useAtom(selectedChairAtom);

  const { createChair, updateChair, createLoading, updateLoading } =
    useChairs();

  const isEdit = isEditModalOpen && selectedChair;
  const isOpen = isCreateModalOpen || isEditModalOpen;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(isEdit ? chairUpdateSchema : chairSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      status: "ACTIVE",
    },
  });

  const watchedStatus = watch("status");

  // Reset form when modal opens/closes or chair changes
  useEffect(() => {
    if (isEdit && selectedChair) {
      setValue("name", selectedChair.name);
      setValue("description", selectedChair.description || "");
      setValue("location", selectedChair.location || "");
      setValue("status", selectedChair.status);
    } else if (isCreateModalOpen) {
      reset({
        name: "",
        description: "",
        location: "",
        status: "ACTIVE",
      });
    }
  }, [isEdit, selectedChair, isCreateModalOpen, setValue, reset]);

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedChair(null);
    reset();
  };

  const onSubmit = async (data: ChairFormData) => {
    try {
      if (isEdit && selectedChair) {
        await updateChair(selectedChair.id, data as ChairUpdateFormData);
      } else {
        await createChair(data);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving chair:", error);
      alert(error instanceof Error ? error.message : "Erro ao salvar cadeira");
    }
  };

  const statusOptions = getStatusOptions();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="relative w-full max-w-[400px] min-w-[350px] sm:min-w-[400px]">
        <DialogClose onClose={handleClose} />

        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Cadeira" : "Nova Cadeira"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Edite as informações da cadeira."
              : "Preencha as informações para cadastrar uma nova cadeira."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 w-full">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Digite o nome da cadeira"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Digite uma descrição (opcional)"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="Digite a localização (opcional)"
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value)}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <span>
                  {watchedStatus
                    ? getStatusLabel(watchedStatus as ChairStatusKey)
                    : "Selecione o status"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createLoading || updateLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createLoading || updateLoading}
              className="flex-1"
            >
              {createLoading || updateLoading
                ? isEdit
                  ? "Atualizando..."
                  : "Criando..."
                : isEdit
                ? "Atualizar"
                : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChairModal;
