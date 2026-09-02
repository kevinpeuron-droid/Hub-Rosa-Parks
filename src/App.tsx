/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-[#FCFCFC] items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="flex h-screen w-full bg-[#FCFCFC] items-center justify-center text-[#1A1A1A]">Erreur d'authentification.</div>;
  }

  return <Dashboard user={user} />;
}

