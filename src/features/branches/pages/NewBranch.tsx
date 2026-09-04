import { z } from "zod";
import { EntityForm, FieldConfig } from "@/components/crud/EntityForm";
import { createEntity } from "@/services/api/entities.api";
import { useMutation } from "@tanstack/react-query";
import { CreateBranchRequest } from "@/types/dtos/Branch.dto";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ApiUrls } from "@/common/constants";
import { useToast } from "@/hooks/useToast";
import { handleError } from "@/utils";

const createBranchSchema: z.ZodType<CreateBranchRequest> = z.object({
  name: z.string({
    required_error: "الفرع مطلوب",
    invalid_type_error: "الفرع مطلوب",
  })
  .refine((val) => val.trim() !== "", { message: "الفرع مطلوب" }),
});

export function NewBranch() {
  const axiosPrivate = useAxiosPrivate();
  const { showToast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: CreateBranchRequest) =>
      createEntity(
        axiosPrivate,
        ApiUrls.createBranchRequest,
        data
      ),
    onSuccess: () => {
      showToast("تم انشاء الفرع بنجاح", { type: "success" });
    },
    onError: (error: any) => {
      handleError(error);
      showToast("حدث خطأ أثناء إنشاء الفرع", { type: "error" });
    },
  });

  const handleSubmit = async (data: CreateBranchRequest) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error: any) {
      handleError(error);
    }
  };

  const fields: FieldConfig<CreateBranchRequest>[] = [
    {
      name: "name",
      label: "اسم الفرع",
      type: "text",
      required: true,
      fullWidth: true,
    },
  ];

  return (
    <EntityForm<CreateBranchRequest>
      mode="create"
      schema={createBranchSchema}
      fields={fields}
      onSubmitHandler={handleSubmit}
      localization={{
        title: "فرع جديد",
        createButtonText: "اضافة",
      }}
    />
  );
}
