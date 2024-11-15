import Model from "./model";
import Workspace from "./workspace";

export default class Base extends Model {
  table = 'bases';
  static idPrefix: string = 'bse';

  id!: string;
  workspace_id!: string;
  label!: string;
  prefix!: string;
  provider!: string;
  schema_data!: any;

  casts = {
    schema_data: "json",
  }

  relationWorkspace() {
    return this.belongsTo(Workspace, 'workspace_id');
  }
}