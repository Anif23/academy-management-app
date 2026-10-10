import { httpClient, toErrorMessage } from './httpClient';

export interface PermissionRow {
  key: string;
  roles: { ADMIN: boolean; STAFF: boolean; COUNSELLOR: boolean; STUDENT: boolean };
}

export interface PermissionGroup {
  label: string;
  permissions: PermissionRow[];
}

export const permissionsApi = {
  async getMatrix(): Promise<PermissionGroup[]> {
    try {
      const response = await httpClient.get('/admin/permissions');
      return response.data.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
  async update(role: 'ADMIN' | 'STAFF' | 'COUNSELLOR' | 'STUDENT', permission: string, enabled: boolean): Promise<PermissionGroup[]> {
    try {
      const response = await httpClient.patch('/admin/permissions', { role, permission, enabled });
      return response.data.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
