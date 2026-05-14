import { db } from '@/lib/db';

export default async function AdminDashboard() {
  const usersCount = await db.execute('SELECT COUNT(*) as count FROM users');
  const presCount = await db.execute('SELECT COUNT(*) as count FROM presentations');
  const logsCount = await db.execute('SELECT COUNT(*) as count FROM access_logs');

  const logs = await db.execute(`
    SELECT l.accessed_at, u.name as user_name, p.title as pres_title
    FROM access_logs l
    JOIN users u ON l.user_id = u.id
    JOIN presentations p ON l.presentation_id = p.id
    ORDER BY l.accessed_at DESC
    LIMIT 5
  `);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-gray-800" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total de Usuários</h3>
          <p className="text-4xl font-bold">{usersCount.rows[0].count as number}</p>
        </div>
        <div className="p-6 rounded-xl border border-gray-800" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Apresentações</h3>
          <p className="text-4xl font-bold">{presCount.rows[0].count as number}</p>
        </div>
        <div className="p-6 rounded-xl border border-gray-800" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total de Acessos</h3>
          <p className="text-4xl font-bold">{logsCount.rows[0].count as number}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Últimos Acessos</h2>
      <div className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-black/20">
              <th className="p-4 text-sm font-medium text-gray-400">Data/Hora</th>
              <th className="p-4 text-sm font-medium text-gray-400">Usuário</th>
              <th className="p-4 text-sm font-medium text-gray-400">Apresentação</th>
            </tr>
          </thead>
          <tbody>
            {logs.rows.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">Nenhum acesso registrado.</td></tr>
            ) : (
              logs.rows.map((log, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="p-4 text-sm">{new Date(log.accessed_at as string).toLocaleString('pt-BR')}</td>
                  <td className="p-4 text-sm">{log.user_name as string}</td>
                  <td className="p-4 text-sm text-[#F06520]">{log.pres_title as string}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
