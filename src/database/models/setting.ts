import Model from "./model";
import { v4 as uuid } from 'uuid';

export default class Setting extends Model {
  timestamps = false;

  casts = {
    allow_registration: 'boolean',
    allow_create_workspace: 'boolean',
    storage_s3_config: 'json',
    storage_webhook_config: 'json',
  }

  declare id: string;
  declare allow_registration: boolean;
  declare allow_create_workspace: boolean;
  declare storage_driver: string;
  declare storage_s3_config: any;
  declare storage_webhook_config: any;

  newUniqueId() {
    return uuid();
  }
}