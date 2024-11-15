type ProviderType = {
  name: string;
  label: string;
  defaultValues: any;
  Icon: (props: any) => JSX.Element | null;
  ConnectionEditor?: (props: any) => JSX.Element | null;
  connectionToFormValues?: (connection: any) => any;
}

type IconProps = {
  className?: string
}

type ConnectionEditorProps = any;

type ProviderActionType = {
  name: string;
  testConnection: (connection: any) => Promise<any>;
  schemaInspector: (connection: any) => Promise<any>;
  sutandoConfig: (connection: any) => any;
}