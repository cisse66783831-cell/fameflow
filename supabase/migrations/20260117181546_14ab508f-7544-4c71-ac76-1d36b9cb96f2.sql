-- =============================================
-- PHASE 1: Super Admin RLS Policies
-- Allow super_admin to see and manage ALL data
-- =============================================

-- PROFILES: Super admin can see all users
CREATE POLICY "Super admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- PROFILES: Super admin can delete users
CREATE POLICY "Super admin can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- EVENTS: Super admin can view all events
CREATE POLICY "Super admin can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- EVENTS: Super admin can delete any event
CREATE POLICY "Super admin can delete any event"
ON public.events
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- EVENTS: Super admin can update any event
CREATE POLICY "Super admin can update any event"
ON public.events
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- TICKETS: Super admin can view all tickets
CREATE POLICY "Super admin can view all tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- TICKETS: Super admin can delete any ticket
CREATE POLICY "Super admin can delete any ticket"
ON public.tickets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- TICKETS: Super admin can update any ticket
CREATE POLICY "Super admin can update any ticket"
ON public.tickets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- CAMPAIGNS: Super admin can view all campaigns
CREATE POLICY "Super admin can view all campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- CAMPAIGNS: Super admin can delete any campaign
CREATE POLICY "Super admin can delete any campaign"
ON public.campaigns
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- CAMPAIGNS: Super admin can update any campaign
CREATE POLICY "Super admin can update any campaign"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- TRANSACTIONS: Super admin can view all transactions
CREATE POLICY "Super admin can view all transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- PUBLIC_VISUALS: Super admin can view all visuals
CREATE POLICY "Super admin can view all public visuals"
ON public.public_visuals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- PUBLIC_VISUALS: Super admin can delete any visual
CREATE POLICY "Super admin can delete any public visual"
ON public.public_visuals
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- PUBLIC_VISUALS: Super admin can update any visual (for moderation)
CREATE POLICY "Super admin can update any public visual"
ON public.public_visuals
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- DOWNLOAD_STATS: Super admin can view all stats
CREATE POLICY "Super admin can view all download stats"
ON public.download_stats
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- PAGE_VIEWS: Super admin can view all page views
CREATE POLICY "Super admin can view all page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));