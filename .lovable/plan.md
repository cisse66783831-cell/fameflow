
# Plan de correction : Synchronisation vidéo/audio et durée correcte

## Problèmes identifiés

| Problème | Cause | Impact |
|----------|-------|--------|
| Vidéo de 3 secondes | MediaRecorder démarre avant que la vidéo soit prête à jouer | Perte de contenu |
| Décalage audio/vidéo | Audio et vidéo démarrent de manière asynchrone | Désynchronisation perceptible |
| Frames manquantes | Premier rendu canvas arrive après le démarrage du recorder | Début de vidéo noir/corrompu |

## Solution technique

### Architecture de synchronisation

```text
AVANT (problématique):
┌─────────────────────────────────────────────────────────────────┐
│ T=0ms          T=50ms         T=100ms        T=150ms           │
│ ────────────────────────────────────────────────────────────── │
│ MediaRecorder  video.play()   audio.start()  1er frame canvas  │
│ start          (async)        (0)            (dessin)          │
│                                                                 │
│ Problème: Recorder capture avant que le contenu soit prêt     │
└─────────────────────────────────────────────────────────────────┘

APRÈS (corrigé):
┌─────────────────────────────────────────────────────────────────┐
│ T=0ms                T=Xms                                      │
│ ────────────────────────────────────────────────────────────── │
│ 1. video.play()      2. waitForFirstFrame                      │
│                      3. drawFirstFrame sur canvas               │
│                      4. MediaRecorder.start()                   │
│                      5. audioBufferSource.start(0)              │
│                      6. renderLoop démarre                      │
│                                                                 │
│ Solution: Tout démarre après que la vidéo ait sa première frame│
└─────────────────────────────────────────────────────────────────┘
```

## Modifications dans `src/components/VideoRecorder.tsx`

### 1. Attendre que la vidéo soit prête avant de démarrer l'enregistrement

Remplacer la logique actuelle (lignes ~768-827) par :

```typescript
// Attendre que la vidéo ait sa première frame prête
await new Promise<void>((resolve) => {
  const checkReady = () => {
    // readyState >= 2 = HAVE_CURRENT_DATA (au moins une frame disponible)
    if (video.readyState >= 2) {
      resolve();
    } else {
      video.addEventListener('canplay', () => resolve(), { once: true });
    }
  };
  checkReady();
});

// Dessiner la première frame AVANT de démarrer le recorder
const videoAspect = video.videoWidth / video.videoHeight;
const canvasAspect = canvasWidth / canvasHeight;
// ... calculs drawWidth, drawHeight, offsetX, offsetY ...
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvasWidth, canvasHeight);
ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
if (filterImg) {
  ctx.drawImage(filterImg, 0, 0, canvasWidth, canvasHeight);
}

// MAINTENANT démarrer le recorder (canvas a déjà du contenu)
mediaRecorder.start(100);

// Démarrer l'audio EXACTEMENT en même temps que la vidéo reprend
video.currentTime = 0;
await video.play();

if (audioBufferSource) {
  // Démarrer l'audio au même moment que la vidéo
  audioBufferSource.start(audioContext.currentTime);
}
```

### 2. Capturer la durée totale de la vidéo source

Ajouter une vérification que la vidéo source est bien lue jusqu'à la fin :

```typescript
// Stocker la durée attendue
const expectedDuration = video.duration;

// Vérifier à la fin que toute la vidéo a été capturée
video.onended = () => {
  const actualDuration = video.currentTime;
  if (actualDuration < expectedDuration * 0.95) {
    console.warn(`Video ended early: ${actualDuration}s vs expected ${expectedDuration}s`);
  }
  // ... reste du code
};
```

### 3. Améliorer la synchronisation avec AudioContext.currentTime

Utiliser le temps de l'AudioContext pour une synchronisation précise :

```typescript
// Au lieu de audioBufferSource.start(0)
const audioStartTime = audioContext.currentTime;
audioBufferSource.start(audioStartTime);

// Le "when" parameter de start() utilise le temps précis de l'AudioContext
// Cela garantit que l'audio démarre exactement quand prévu
```

### 4. Ajouter un délai de préchauffage du canvas stream

Le `captureStream()` peut avoir besoin d'un petit délai pour s'initialiser :

```typescript
const canvasStream = canvas.captureStream(30);

// Attendre que le stream soit actif
await new Promise(resolve => setTimeout(resolve, 50));
```

## Fichier à modifier

| Fichier | Modifications |
|---------|---------------|
| `src/components/VideoRecorder.tsx` | Réordonner la séquence de démarrage pour synchroniser video/audio/recorder |

## Changements clés

1. **Attendre `canplay`** avant de démarrer quoi que ce soit
2. **Dessiner une frame** sur le canvas avant de démarrer le MediaRecorder
3. **Démarrer le MediaRecorder** une fois le canvas initialisé
4. **Synchroniser audio et vidéo** en utilisant `audioContext.currentTime`
5. **Remettre `video.currentTime = 0`** avant de jouer pour garantir que tout part du début

## Résultat attendu

- Vidéo exportée avec la durée complète (pas seulement 3 secondes)
- Audio parfaitement synchronisé avec la vidéo
- Pas de frames noires au début
- Export fiable sur tous les navigateurs
