-- Supprimer l'ancienne contrainte
ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_type_check;

-- Ajouter la nouvelle contrainte avec video_filter
ALTER TABLE public.campaigns 
ADD CONSTRAINT campaigns_type_check 
CHECK (type = ANY (ARRAY['photo'::text, 'document'::text, 'video_filter'::text]));