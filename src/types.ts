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
  githubUrl?: string;
  vercelUrl?: string;
  description?: string;
}

export type DashboardItem = Folder | AppLink;
