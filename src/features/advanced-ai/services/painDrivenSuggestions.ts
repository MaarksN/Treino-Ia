export interface PainLog {
  bodyPart: string;
  intensity: number; // 1-10
}

export interface PainSuggestion {
  message: string;
  isActionable: boolean;
}

export function getPainDrivenSuggestions(painLog: PainLog): PainSuggestion {
  if (painLog.intensity >= 7) {
    return {
      message: `Cuidado: você registrou dor intensa (${painLog.intensity}/10) na região de ${painLog.bodyPart}. Considere evitar cargas elevadas neste grupo muscular hoje e focar em recuperação ativa.`,
      isActionable: true,
    };
  }

  if (painLog.intensity >= 4) {
    return {
      message: `Atenção: dor moderada detectada em ${painLog.bodyPart}. Diminua a amplitude e a carga se o desconforto persistir.`,
      isActionable: true,
    };
  }

  return {
    message: `Leve desconforto em ${painLog.bodyPart}. Faça um aquecimento adequado antes de iniciar.`,
    isActionable: false,
  };
}
