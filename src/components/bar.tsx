export default function Bar({ children }: {
  children: React.ReactNode;
}) {
  return <div>
    <div className="h-[50px] border-b border-border px-5 flex flex-row items-center justify-between">
      {children}
    </div>
  </div>;
}