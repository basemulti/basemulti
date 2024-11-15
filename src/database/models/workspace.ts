import Model from "./model";
import Base from "./base";
import type { Collection } from "sutando";
import User from "./user";
import { RoleType } from "@/lib/types";
import InviteLink from "./invite-links";

export default class Workspace extends Model {
  table = 'workspaces';
  static idPrefix: string = 'wsp';

  id!: string;
  label!: string;
  schema_data!: any;
  bases!: Collection<Base>;
  role!: RoleType;

  casts = {
    schema_data: "json",
  }

  static async getAll() {
    return Workspace.query().with({
      bases: q => q.select('id', 'workspace_id', 'label', 'created_at').orderBy('created_at', 'asc')
    }).orderBy('created_at', 'asc').get();
  }

  relationBases() {
    return this.hasMany(Base, 'workspace_id');
  }

  relationCollaborators() {
    return this.belongsToMany(
      User,
      'collaborators',
      'collaboratorable_id',
      'user_id',
    )
    .withPivot('id', 'role')
    .withTimestamps()
    .where('collaborators.collaboratorable_type', '=', 'workspace');
  }

  relationInviteLinks() {
    return this.hasMany(InviteLink, 'linkable_id')
      .where('linkable_type', '=', 'workspace');
  }

  async getCollaborators() {
    return this.relationCollaborators().orderByPivot('created_at', 'asc').get();
  }

  async isLastOwner() {
    const count = await this.relationCollaborators().where('role', 'owner').count();
    return count === 1;
  }
}