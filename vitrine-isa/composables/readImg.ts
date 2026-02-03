export const useReadImg = (event: Event): Promise<string> => {
  return new Promise((resolve, reject) => {
    const target = event.target as HTMLInputElement;
    
    if (!target.files || target.files.length === 0) {
      reject(new Error("Aucun fichier sélectionné"));
      return;
    }

    const file = target.files[0];
    if (!file.type.startsWith('image/')) {
      reject(new Error("Le fichier sélectionné n'est pas une image"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Échec de la lecture du fichier"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };

    reader.readAsDataURL(file);
  });
};