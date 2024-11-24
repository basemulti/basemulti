import { Attribute } from "sutando";
import Model from "./model";
import { env } from "@/lib/env";

export default class Share extends Model {
  table = 'shares';
  static idPrefix: string = 'shr';

  appends = ['share_link'];

  id!: string;
  type!: string;
  base_id!: string;
  table_name!: string;
  view_id!: string | null;
  password!: string;

  attributeShareLink() {
    return Attribute.make({
      get: (value: any, attribute: any) => `${env.NEXT_PUBLIC_URL}/shares/${attribute.id}`
    })
  }
}