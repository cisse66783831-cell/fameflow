import { Campaign } from '@/types/campaign';

// Demo frame - a simple circular profile frame
const demoFrameBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMTgwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIwIiBmaWxsPSJub25lIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCIgeTE9IjAiIHgyPSI0MDAiIHkyPSI0MDAiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjM2NmYxIi8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2E4NTVmNyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAiIHk9IjM0MCIgZmlsbD0idXJsKCNncmFkaWVudCkiIHJ4PSI4Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzY4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+I0ZyYW1lRmxvdzwvdGV4dD4KPC9zdmc+';

// Demo certificate background
const demoCertBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjZmZmZmZmIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9Ijc2MCIgaGVpZ2h0PSI1NjAiIHN0cm9rZT0iIzYzNjZmMSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHg9IjMwIiB5PSIzMCIgd2lkdGg9Ijc0MCIgaGVpZ2h0PSI1NDAiIHN0cm9rZT0iI2E4NTVmNyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzYzNjZmMSIvPgo8cGF0aCBkPSJNMzg1IDgwTDM5NSA5MEw0MTUgNzAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==';

export const demoTemplates: Campaign[] = [
  {
    id: 'demo-photo-1',
    title: 'Cadre Photo - Style Dégradé',
    description: 'Un magnifique cadre dégradé pour vos photos de profil. Parfait pour les campagnes virales.',
    type: 'photo',
    frameImage: demoFrameBase64,
    textElements: [],
    hashtags: ['#Jyserai', '#PhotoProfil', '#Viral'],
    views: 1250,
    downloads: 340,
    createdAt: new Date('2024-01-15'),
    isDemo: true,
  },
  {
    id: 'demo-document-1',
    title: 'Certificat de Réussite',
    description: 'Template de certificat professionnel avec champs personnalisables pour le nom et la date.',
    type: 'document',
    frameImage: '',
    backgroundImage: demoCertBase64,
    textElements: [
      {
        id: 'cert-title',
        label: 'Titre',
        value: 'CERTIFICAT DE RÉUSSITE',
        x: 400,
        y: 160,
        fontSize: 32,
        fontFamily: 'Georgia',
        color: '#6366f1',
        fontWeight: 'bold',
        isDraggable: false,
      },
      {
        id: 'cert-name',
        label: 'Nom du destinataire',
        value: 'Jean Dupont',
        x: 400,
        y: 280,
        fontSize: 42,
        fontFamily: 'Georgia',
        color: '#1e1b4b',
        fontWeight: 'bold',
        isDraggable: true,
      },
      {
        id: 'cert-desc',
        label: 'Description',
        value: 'Pour contribution exceptionnelle et excellence',
        x: 400,
        y: 350,
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
      },
      {
        id: 'cert-date',
        label: 'Date',
        value: '15 Décembre 2024',
        x: 400,
        y: 480,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#64748b',
        fontWeight: 'normal',
        isDraggable: true,
      },
    ],
    hashtags: ['#Certificat', '#Réussite', '#Récompense'],
    views: 890,
    downloads: 215,
    createdAt: new Date('2024-02-10'),
    isDemo: true,
  },
];
