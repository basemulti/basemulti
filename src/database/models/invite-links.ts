import { RoleType } from "@/lib/types";
import Model from "./model";
import { Attribute } from "sutando";

export default class InviteLink extends Model {
  table = 'invite_links';
  static idPrefix: string = 'inv';

  appends = ['link'];

  id!: string;
  code!: string;
  role!: RoleType;
  linkable_id!: string;
  linkable_type!: 'workspace' | 'base';

  attributeLink() {
    return Attribute.make({
      get: (value: any, attribute: any) => `${process.env.NEXT_PUBLIC_URL}/invite?id=${attribute.id}&code=${attribute.code}`
    });
  }
}