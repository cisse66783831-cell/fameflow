-- Assigner le rôle super_admin à cisse66783831@gmail.com
INSERT INTO public.user_roles (user_id, role, event_id)
SELECT '404b041a-ffbc-4802-8eaa-40e712317e32', 'super_admin', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '404b041a-ffbc-4802-8eaa-40e712317e32' 
  AND role = 'super_admin'
);