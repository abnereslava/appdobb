/**
 * Lista de apoio ao autocomplete de medicamentos.
 *
 * NÃO é uma base farmacêutica nem orientação médica — é só uma conveniência
 * de digitação. Por isso é deliberadamente ENXUTA e conservadora: contém
 * apenas itens de alta confiança, porque um princípio ativo errado apareceria
 * ao usuário como se fosse verdade (ver specs/historico-medicamentos/spec.md).
 *
 * O autocomplete completa esta lista com os nomes que o próprio perfil já
 * cadastrou, então ela não precisa ser exaustiva — cresce com o uso.
 *
 * Ampliação futura deve partir de fonte verificável (bulário/ANVISA), nunca
 * de memória.
 *
 * Formato: { nome } para genérico/princípio ativo;
 *          { nome, ativo } para nome comercial.
 */
const MEDICAMENTOS_COMUNS = [
  // Analgésicos, antitérmicos e anti-inflamatórios
  { nome: 'Paracetamol' },
  { nome: 'Tylenol', ativo: 'Paracetamol' },
  { nome: 'Dipirona' },
  { nome: 'Novalgina', ativo: 'Dipirona' },
  { nome: 'Ibuprofeno' },
  { nome: 'Advil', ativo: 'Ibuprofeno' },
  { nome: 'Alivium', ativo: 'Ibuprofeno' },
  { nome: 'Buscofem', ativo: 'Ibuprofeno' },
  { nome: 'Ácido acetilsalicílico' },
  { nome: 'Aspirina', ativo: 'Ácido acetilsalicílico' },
  { nome: 'Diclofenaco' },
  { nome: 'Cataflam', ativo: 'Diclofenaco potássico' },
  { nome: 'Voltaren', ativo: 'Diclofenaco' },
  { nome: 'Nimesulida' },
  { nome: 'Naproxeno' },
  { nome: 'Dorflex', ativo: 'Dipirona + Orfenadrina + Cafeína' },
  { nome: 'Neosaldina', ativo: 'Dipirona + Isometepteno + Cafeína' },

  // Antibióticos e antimicrobianos
  { nome: 'Amoxicilina' },
  { nome: 'Amoxil', ativo: 'Amoxicilina' },
  { nome: 'Cefalexina' },
  { nome: 'Keflex', ativo: 'Cefalexina' },
  { nome: 'Azitromicina' },
  { nome: 'Zitromax', ativo: 'Azitromicina' },
  { nome: 'Ciprofloxacino' },
  { nome: 'Metronidazol' },
  { nome: 'Flagyl', ativo: 'Metronidazol' },
  { nome: 'Bactrim', ativo: 'Sulfametoxazol + Trimetoprima' },
  { nome: 'Nistatina' },
  { nome: 'Fluconazol' },
  { nome: 'Aciclovir' },
  { nome: 'Ivermectina' },
  { nome: 'Albendazol' },
  { nome: 'Oseltamivir' },
  { nome: 'Tamiflu', ativo: 'Oseltamivir' },

  // Estômago, intestino e náusea
  { nome: 'Omeprazol' },
  { nome: 'Pantoprazol' },
  { nome: 'Esomeprazol' },
  { nome: 'Simeticona' },
  { nome: 'Luftal', ativo: 'Simeticona' },
  { nome: 'Metoclopramida' },
  { nome: 'Plasil', ativo: 'Metoclopramida' },
  { nome: 'Domperidona' },
  { nome: 'Motilium', ativo: 'Domperidona' },
  { nome: 'Ondansetrona' },
  { nome: 'Vonau', ativo: 'Ondansetrona' },
  { nome: 'Dimenidrinato' },
  { nome: 'Dramin', ativo: 'Dimenidrinato' },
  { nome: 'Butilescopolamina' },
  { nome: 'Buscopan', ativo: 'Butilescopolamina' },

  // Alergia e antialérgicos
  { nome: 'Loratadina' },
  { nome: 'Claritin', ativo: 'Loratadina' },
  { nome: 'Cetirizina' },
  { nome: 'Fexofenadina' },
  { nome: 'Allegra', ativo: 'Fexofenadina' },
  { nome: 'Dexclorfeniramina' },
  { nome: 'Polaramine', ativo: 'Dexclorfeniramina' },

  // Corticoides
  { nome: 'Prednisona' },
  { nome: 'Meticorten', ativo: 'Prednisona' },
  { nome: 'Prednisolona' },
  { nome: 'Predsim', ativo: 'Prednisolona' },
  { nome: 'Dexametasona' },
  { nome: 'Betametasona' },

  // Respiratório
  { nome: 'Salbutamol' },
  { nome: 'Aerolin', ativo: 'Salbutamol' },
  { nome: 'Fenoterol' },
  { nome: 'Berotec', ativo: 'Fenoterol' },
  { nome: 'Beclometasona' },
  { nome: 'Budesonida' },

  // Cardiovascular e metabólico
  { nome: 'Losartana' },
  { nome: 'Enalapril' },
  { nome: 'Captopril' },
  { nome: 'Atenolol' },
  { nome: 'Propranolol' },
  { nome: 'Anlodipino' },
  { nome: 'Hidroclorotiazida' },
  { nome: 'Sinvastatina' },
  { nome: 'Atorvastatina' },
  { nome: 'Metformina' },
  { nome: 'Glifage', ativo: 'Metformina' },
  { nome: 'Glibenclamida' },
  { nome: 'Levotiroxina' },
  { nome: 'Puran T4', ativo: 'Levotiroxina' },

  // Sistema nervoso
  { nome: 'Fluoxetina' },
  { nome: 'Sertralina' },
  { nome: 'Escitalopram' },
  { nome: 'Amitriptilina' },
  { nome: 'Clonazepam' },
  { nome: 'Rivotril', ativo: 'Clonazepam' },
  { nome: 'Diazepam' },
  { nome: 'Melatonina' },

  // Vitaminas e suplementos
  { nome: 'Vitamina D (Colecalciferol)' },
  { nome: 'Vitamina C (Ácido ascórbico)' },
  { nome: 'Complexo B' },
  { nome: 'Ácido fólico' },
  { nome: 'Sulfato ferroso' },
  { nome: 'Carbonato de cálcio' },
  { nome: 'Ômega 3' },
  { nome: 'Zinco' },
];
