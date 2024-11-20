import { WebhookType } from "@/lib/types";
import Model from "./model";

export default class Webhook extends Model {
  table = 'webhooks';
  static idPrefix: string = 'whk';

  casts = {
    active: 'boolean',
  }

  id!: string;
  base_id!: string;
  table_name!: string;
  label!: string;
  method!: string;
  endpoint!: string;
  type!: WebhookType;
  active!: boolean;
}