export const tajweedRulesMap = {
    h: { className: 'ham_wasl', type: 'hamza-wasl', description: 'Hamzat ul Wasl' },
    s: { className: 'slnt', type: 'silent', description: 'Silent' },
    l: { className: 'slnt', type: 'laam-shamsiyah', description: 'Lam Shamsiyyah' },
    n: { className: 'madda_normal', type: 'madda-normal', description: 'Normal Prolongation: 2 Vowels' },
    p: { className: 'madda_permissible', type: 'madda-permissible', description: 'Permissible Prolongation: 2, 4, 6 Vowels' },
    m: { className: 'madda_necessary', type: 'madda-necessary', description: 'Necessary Prolongation: 6 Vowels' },
    q: { className: 'qlq', type: 'qalaqah', description: 'Qalaqah' },
    o: { className: 'madda_obligatory', type: 'madda-obligatory', description: 'Obligatory Prolongation: 4-5 Vowels' },
    c: { className: 'ikhf_shfw', type: 'ikhafa-shafawi', description: 'Ikhafa\' Shafawi - With Meem' },
    f: { className: 'ikhf', type: 'ikhafa', description: 'Ikhafa\'' },
    w: { className: 'idghm_shfw', type: 'idgham-shafawi', description: 'Idgham Shafawi - With Meem' },
    i: { className: 'iqlb', type: 'iqlab', description: 'Iqlab' },
    a: { className: 'idgh_ghn', type: 'idgham-with-ghunnah', description: 'Idgham - With Ghunnah' },
    u: { className: 'idgh_w_ghn', type: 'idgham-without-ghunnah', description: 'Idgham - Without Ghunnah' },
    d: { className: 'idgh_mus', type: 'idgham-mutajanisayn', description: 'Idgham - Mutajanisayn' },
    b: { className: 'idgh_mut', type: 'idgham-mutaqaribayn', description: 'Idgham - Mutaqaribayn' },
    g: { className: 'ghn', type: 'ghunnah', description: 'Ghunnah: 2 Vowels' }
  };
  
  export function parseTajweed(text: string): string {
    if (!text) return '';
  
    // Regex to find patterns like [h:1[ٱ]] or [l[ل]].
    // It captures the rule identifier, an optional ID, and the content.
    // The content part (.*?) is non-greedy to handle nested or adjacent rules correctly.
    const regex = /\[([a-z])(?::(\d+))?\[(.*?)\]/g;
  
    return text.replace(regex, (match, identifier, id, content) => {
      const rule = tajweedRulesMap[identifier as keyof typeof tajweedRulesMap];
      if (rule) {
        // Conditionally add the data-tajweed attribute only if an ID is present.
        const idAttribute = id ? ` data-tajweed=":${id}"` : '';
        return `<tajweed class="${rule.className}" data-type="${rule.type}" data-description="${rule.description}"${idAttribute}>${content}</tajweed>`;
      }
      // If the rule identifier is not found, return the original matched string as a fallback.
      return match;
    });
  }

  export function stripTajweed(text: string): string {
    if (!text) return '';
    // This regex matches the tajweed tags and we replace the match with the content inside.
    // e.g., [h:1[ٱ]] becomes ٱ
    const regex = /\[([a-z])(?::(\d+))?\[(.*?)\]/g;
    return text.replace(regex, '$3');
  }