import { useState } from 'react';
import { clearSensitiveLocalData, exportLocalPrivacyData, getPrivacyLocalOnlyNotice, listLocalPrivacyCategories } from '../../services/privacy/privacyConsentService';

export function PrivacyDataPanel() {
  const [version, setVersion] = useState(0);
  const categories = listLocalPrivacyCategories();
  const notice = getPrivacyLocalOnlyNotice();

  const onExport = () => {
    const data = exportLocalPrivacyData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'treino-ia-local-privacy-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section className="bg-brand-dark border-2 border-brand-light/10 p-4 space-y-3">
    <h3 className="font-bold uppercase">Privacidade de dados locais</h3>
    <p className="text-xs text-brand-muted">{notice}</p>
    <ul className="text-xs space-y-1">{categories.map(item => <li key={item.key}>{item.key} — {item.sensitivity}</li>)}</ul>
    <div className="flex gap-2">
      <button type="button" onClick={onExport} className="px-3 py-2 border">Exportar JSON local</button>
      <button type="button" onClick={() => { clearSensitiveLocalData(); setVersion(v => v + 1); }} className="px-3 py-2 border">Limpar dados locais sensíveis</button>
    </div>
  </section>;
}
