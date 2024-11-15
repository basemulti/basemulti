import { useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import ButtonLoading from "../button-loading";

export default function SubmitButton({ loading, onSubmit, action, disabled, children }: any) {
  const { getValues, formState: {
    isDirty
  } } = useFormContext();

  return <Button className="py-2 px-2 h-8" disabled={disabled} onClick={(e) => {
    // form.handleSubmit(onSubmit)()
    e.preventDefault();
    onSubmit(getValues())
  }}>
    <ButtonLoading className="mr-2" loading={loading} />
    {children}
  </Button>
}