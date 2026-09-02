export type ItemType = 'folder' | 'app';

export interface BaseItem {
  id: string;
  userId: string;
  type: ItemType;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export interface Folder extends BaseItem {
  type: 'folder';
}

export interface AppLink extends BaseItem {
  type: 'app';
  url?: string;
  description?: string;
  username?: string;
  password?: string;
}

export type DashboardItem = Folder | AppLink;
