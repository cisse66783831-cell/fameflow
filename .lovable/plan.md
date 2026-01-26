
# Plan : Restreindre la génération IA au Super Administrateur

## Objectif
Limiter l'accès au bouton "Adapter avec l'IA" (AIFrameGenerator) uniquement au super administrateur. Les autres utilisateurs pourront toujours créer des événements et campagnes normalement, mais sans accès à cette fonctionnalité d'adaptation IA.

---

## Modifications à effectuer

### 1. CreateEventModal.tsx

**Ajouter l'import du hook useUserRoles :**
```typescript
import { useUserRoles } from '@/hooks/useUserRoles';
```

**Récupérer le rôle dans le composant :**
```typescript
const { isSuperAdmin } = useUserRoles();
```

**Modifier la condition d'affichage du bouton (ligne 359) :**
```typescript
// Avant
{formData.frame_image && (
  <Button ...>Adapter avec l'IA</Button>
)}

// Après
{formData.frame_image && isSuperAdmin() && (
  <Button ...>Adapter avec l'IA</Button>
)}
```

---

### 2. CreateCampaignModal.tsx

**Ajouter l'import du hook useUserRoles :**
```typescript
import { useUserRoles } from '@/hooks/useUserRoles';
```

**Récupérer le rôle dans le composant :**
```typescript
const { isSuperAdmin } = useUserRoles();
```

**Modifier la condition d'affichage du bouton (ligne 870) :**
```typescript
// Avant
{type === 'photo' && frameImage && (
  <div className="space-y-3">
    <Button ...>Adapter avec l'IA</Button>
    ...
  </div>
)}

// Après
{type === 'photo' && frameImage && isSuperAdmin() && (
  <div className="space-y-3">
    <Button ...>Adapter avec l'IA</Button>
    ...
  </div>
)}
```

---

## Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `src/components/CreateEventModal.tsx` | Import hook + condition `isSuperAdmin()` |
| `src/components/CreateCampaignModal.tsx` | Import hook + condition `isSuperAdmin()` |

---

## Résultat attendu

| Utilisateur | Peut créer événements/campagnes | Voit "Adapter avec l'IA" |
|-------------|--------------------------------|--------------------------|
| Super Admin (cisse66783831@gmail.com) | Oui | Oui |
| Admin / Promoteur | Oui | Non |
| Utilisateur standard | Oui | Non |

Les animations de la landing page restent inchangées.
