"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  SelectTrigger,
} from "@/app/components/ui/select";
import { useChairs } from "@/app/hooks/useChairs";
import {
  chairModalOpenAtom,
  chairEditModalOpenAtom,
  selectedChairAtom,
} from "@/app/atoms/chairAtoms";
import {
  chairZodSchema,
  chairUpdateZodSchema,
  getStatusOptions,
  getStatusLabel,
  ChairStatusKey,
  ChairZodFormData,
  ChairUpdateZodFormData,
} from "@/app/schemas/chairSchema";
import { CreateChairRequest, UpdateChairRequest } from "@/app/types/api";

const ChairModal = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useAtom(chairModalOpenAtom);
  const [isEditModalOpen, setIsEditModalOpen] = useAtom(chairEditModalOpenAtom);
  const [selectedChair, setSelectedChair] = useAtom(selectedChairAtom);

  const { createChair, updateChair, loading } = useChairs();

  const isEdit = isEditModalOpen && selectedChair;
  const isOpen = isCreateModalOpen || isEditModalOpen;

  const form = useForm<ChairZodFormData | ChairUpdateZodFormData>({
    resolver: zodResolver(isEdit ? chairUpdateZodSchema : chairZodSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (isEdit && selectedChair) {
      form.setValue("name", selectedChair.name);
      form.setValue("description", selectedChair.description || "");
      form.setValue("location", selectedChair.location || "");
      form.setValue(
        "status",
        selectedChair.status === "all" ? "ACTIVE" : selectedChair.status
      );
    } else if (isCreateModalOpen) {
      form.reset({
        name: "",
        description: "",
        location: "",
        status: "ACTIVE",
      });
    }
  }, [isEdit, selectedChair, isCreateModalOpen, form]);

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedChair(null);
    form.reset();
  };

  const onSubmit = async (
    formData: ChairZodFormData | ChairUpdateZodFormData
  ) => {
    try {
      if (isEdit && selectedChair) {
        await updateChair(selectedChair.id, formData as UpdateChairRequest);
      } else {
        await createChair(formData as CreateChairRequest);
      }
      handleClose();
    } catch (err) {
      console.error("Error saving chair:", err);
      // Toast já é gerenciado pelo hook useChairs
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da cadeira" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite uma descrição (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a localização (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <span>
                          {field.value
                            ? getStatusLabel(field.value as ChairStatusKey)
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? isEdit
                    ? "Atualizando..."
                    : "Criando..."
                  : isEdit
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChairModal;
