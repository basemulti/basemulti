export default function SelectBlank({ title }: {
  title: string;
}) {
  return (
    <div className="size-full flex flex-col items-center gap-4 justify-center">
      <img className="w-48 h-48" src="/select.png" />
      <div className="text-sm">{title}</div>
    </div>
  );
}