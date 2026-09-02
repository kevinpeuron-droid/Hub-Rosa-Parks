import { useState, useEffect } from 'react';
import { getItems, createItem, deleteItem, updateItem } from '../lib/api';
import { DashboardItem, Folder, AppLink } from '../types';
import { AppUser } from '../hooks/useAuth';
import { 
  Folder as FolderIcon, 
  LayoutGrid, 
  Plus, 
  MoreVertical, 
  Trash2,
  ChevronRight,
  Home,
  ExternalLink,
  Key,
  Eye,
  EyeOff,
  Loader2,
  Lock
} from 'lucide-react';

function CredentialRow({ app, onUpdate }: { app: AppLink, onUpdate: (id: string, updates: Partial<DashboardItem>) => Promise<void> }) {
  const [username, setUsername] = useState(app.username || '');
  const [password, setPassword] = useState(app.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (username !== app.username || password !== app.password) {
      setSaving(true);
      await onUpdate(app.id, { username, password });
      setSaving(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-gray-500" />
        </div>
        {app.name}
      </td>
      <td className="px-6 py-4">
        <input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          onBlur={handleSave}
          placeholder="Aucun identifiant"
          className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none placeholder-gray-400"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            onBlur={handleSave}
            placeholder="Aucun mot de passe"
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none font-mono placeholder-gray-400"
          />
          <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-black">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
      </td>
    </tr>
  );
}

interface DashboardProps {
  user: AppUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'folder' | 'app'>('folder');
  const [currentView, setCurrentView] = useState<'explorer' | 'credentials'>('explorer');

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getItems(user.uid);
      setItems(data);
    } catch (error) {
      console.error("Error loading items", error);
    } finally {
      setLoading(false);
    }
  };

  const currentItems = items.filter(item => item.parentId === currentFolderId);
  
  // Build breadcrumbs
  const breadcrumbs = [];
  let curr = currentFolderId;
  while (curr) {
    const folder = items.find(i => i.id === curr) as Folder;
    if (folder) {
      breadcrumbs.unshift(folder);
      curr = folder.parentId;
    } else {
      break;
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    if (createType === 'folder') {
      await createItem({
        userId: user.uid,
        type: 'folder',
        name,
        parentId: currentFolderId
      });
    } else {
      await createItem({
        userId: user.uid,
        type: 'app',
        name,
        description: formData.get('description') as string,
        url: formData.get('url') as string,
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        parentId: currentFolderId
      } as Omit<AppLink, 'id' | 'createdAt'>);
    }
    
    setIsCreateModalOpen(false);
    loadItems();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id, items);
      loadItems();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FCFCFC] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[#E5E5E5] bg-[#F8F9FA] flex flex-col hidden md:flex h-full">
        <div className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span className="font-bold text-xl tracking-tight">ProjectHub</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#999] font-semibold mb-4">Infrastructure</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#555]">
              <div className="w-4 h-4 bg-orange-100 rounded text-orange-600 flex items-center justify-center text-[10px]">F</div>
              <span>Firebase Cloud</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-[#999] font-semibold mb-4 px-2">Vues</div>
          <div className="space-y-1 mb-6">
            <button 
              onClick={() => { setCurrentView('explorer'); setCurrentFolderId(null); }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${currentView === 'explorer' && currentFolderId === null ? 'bg-white border border-gray-200 shadow-sm font-semibold text-[#444]' : 'text-[#666] font-medium hover:bg-gray-200 hover:text-black'}`}
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </button>
            <button 
              onClick={() => setCurrentView('credentials')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${currentView === 'credentials' ? 'bg-white border border-gray-200 shadow-sm font-semibold text-[#444]' : 'text-[#666] font-medium hover:bg-gray-200 hover:text-black'}`}
            >
              <Key className="w-4 h-4" />
              <span>Mots de passe</span>
            </button>
          </div>

          <div className="text-[10px] uppercase tracking-widest text-[#999] font-semibold mb-4 px-2">Dossiers</div>
          <div className="space-y-1">
            {items.filter(i => i.type === 'folder').map(folder => (
              <button
                key={folder.id}
                onClick={() => { setCurrentView('explorer'); setCurrentFolderId(folder.id); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${currentView === 'explorer' && currentFolderId === folder.id ? 'bg-white border border-gray-200 shadow-sm font-semibold text-[#444]' : 'text-[#666] font-medium hover:bg-gray-200 hover:text-black'}`}
              >
                <FolderIcon className="w-4 h-4" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-black text-white p-4 rounded-xl text-xs flex items-center justify-between">
            <span>Workspace Actif</span>
            <span className="bg-white/20 px-2 py-1 rounded">Auto-sync</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="h-16 px-8 border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => setCurrentFolderId(null)} className="text-gray-400 hover:text-black transition-colors">
              Home
            </button>
            {breadcrumbs.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="text-gray-300">/</span>
                <button 
                  onClick={() => setCurrentFolderId(b.id)}
                  className="font-semibold text-[#1A1A1A] hover:text-black transition-colors truncate max-w-[150px]"
                >
                  {b.name}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setCreateType('app'); setIsCreateModalOpen(true); }}
              className="bg-[#F3F4F6] hover:bg-gray-200 text-black px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New App</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 overflow-hidden shadow-inner">
            </div>
          </div>
        </header>

        {/* Content */}
        {currentView === 'explorer' ? (
          <section className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {currentFolderId ? breadcrumbs[breadcrumbs.length - 1]?.name : 'Root Projects'}
                </h2>
                <p className="text-gray-500 mt-1">
                  {currentItems.length} active {currentItems.length === 1 ? 'application' : 'applications'} in this sub-folder
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCreateType('folder'); setIsCreateModalOpen(true); }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <FolderIcon className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentItems.length === 0 ? (
              <div 
                onClick={() => { setCreateType('app'); setIsCreateModalOpen(true); }}
                className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-gray-50 group transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-sm font-semibold text-gray-400">New Application</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.filter(i => i.type === 'folder').map(folder => (
                  <div 
                    key={folder.id}
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="group bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:shadow-xl transition-all border-b-4 border-b-gray-400 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600">
                        <FolderIcon className="w-6 h-6" />
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(folder.id); }}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{folder.name}</h3>
                    <p className="text-xs text-gray-500 mb-6">
                      {items.filter(i => i.parentId === folder.id).length} items inside
                    </p>
                    <button className="w-full py-2.5 bg-[#F9FAFB] hover:bg-black hover:text-white rounded-xl text-sm font-semibold transition-colors">Open Folder</button>
                  </div>
                ))}

                {currentItems.filter(i => i.type === 'app').map(app => (
                  <div 
                    key={app.id}
                    className="group bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:shadow-xl transition-all border-b-4 border-b-blue-500 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <LayoutGrid className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{app.name}</h3>
                    <p className="text-xs text-gray-500 mb-6 line-clamp-2 flex-1">
                      {app.type === 'app' && app.description ? app.description : 'No description provided.'}
                    </p>
                    <div className="flex gap-2 mb-4">
                      {app.type === 'app' && app.url && (
                        <div className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium text-gray-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Lien externe
                        </div>
                      )}
                    </div>
                    {(app.type === 'app' && app.url) ? (
                       <a href={app.url} target="_blank" rel="noopener noreferrer" className="block w-full mt-auto">
                         <button className="w-full py-2.5 bg-[#F9FAFB] hover:bg-black hover:text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                           <ExternalLink className="w-4 h-4" /> Ouvrir l'application
                         </button>
                       </a>
                    ) : (
                      <button className="w-full py-2.5 bg-[#F9FAFB] text-gray-400 cursor-not-allowed rounded-xl text-sm font-semibold transition-colors mt-auto">Aucun lien</button>
                    )}
                  </div>
                ))}
                
                <div 
                  onClick={() => { setCreateType('app'); setIsCreateModalOpen(true); }}
                  className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-gray-50 group transition-colors min-h-[260px]"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-sm font-semibold text-gray-400">New Application</span>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="flex-1 p-8 overflow-y-auto bg-gray-50">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Mots de passe</h2>
                <p className="text-gray-500 mt-1">Gérez les identifiants de toutes vos applications.</p>
              </div>
            </div>
            {items.filter(i => i.type === 'app').length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-12">
                <Lock className="w-12 h-12 text-gray-300 mb-4" />
                <span className="text-sm font-semibold text-gray-500">Aucune application n'a été ajoutée.</span>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-[#E5E5E5] text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Application</th>
                      <th className="px-6 py-4 font-medium">Identifiant</th>
                      <th className="px-6 py-4 font-medium">Mot de passe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {items.filter(i => i.type === 'app').map(app => (
                      <CredentialRow 
                        key={app.id} 
                        app={app as AppLink} 
                        onUpdate={async (id, updates) => { 
                          await updateItem(id, updates); 
                          loadItems(); 
                        }} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-neutral-900">
                {createType === 'folder' ? 'Create Folder' : 'Add Application'}
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  placeholder={createType === 'folder' ? "e.g. My Next.js Apps" : "e.g. E-commerce Dashboard"}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {createType === 'app' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
                    <textarea 
                      name="description"
                      rows={2}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">URL de l'application</label>
                    <input 
                      type="url" 
                      name="url"
                      placeholder="https://..."
                      className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Identifiant (optionnel)</label>
                      <input 
                        type="text" 
                        name="username"
                        placeholder="admin..."
                        className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Mot de passe (optionnel)</label>
                      <input 
                        type="password" 
                        name="password"
                        placeholder="••••••••"
                        className="w-full border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
