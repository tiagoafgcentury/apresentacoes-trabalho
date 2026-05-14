import { db } from '@/lib/db';

export default async function LogsPage() {
  const logs = await db.execute(`
    SELECT l.accessed_at, u.name as user_name, u.email as user_email, p.title as pres_title
    FROM access_logs l
    JOIN users u ON l.user_id = u.id
    JOIN presentations p ON l.presentation_id = p.id
    ORDER BY l.accessed_at DESC
  `);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Logs de Acesso</h1>
        <p className="text-sm text-gray-400">Histórico completo de visualizações.</p>
      </div>

      <div className="rounded-xl border border-gray-800 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-black/20">
              <th className="p-4 text-sm font-medium text-gray-400">Data e Hora</th>
              <th className="p-4 text-sm font-medium text-gray-400">Usuário</th>
              <th className="p-4 text-sm font-medium text-gray-400">Apresentação</th>
            </tr>
          </thead>
          <tbody>
            {logs.rows.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500 italic">Nenhum log encontrado.</td></tr>
            ) : (
              logs.rows.map((log, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="p-4 text-sm">
                    {new Date(log.accessed_at as string).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="p-4 text-sm">
                    <p className="font-medium">{log.user_name as string}</p>
                    <p className="text-xs text-gray-500">{log.user_email as string}</p>
                  </td>
                  <td className="p-4 text-sm text-[#F06520]">
                    {log.pres_title as string}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
