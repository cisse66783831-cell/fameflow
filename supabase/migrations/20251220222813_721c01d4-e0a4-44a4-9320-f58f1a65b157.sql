-- Create events table for promoters
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  cover_image TEXT,
  frame_image TEXT NOT NULL,
  qr_position_x INTEGER DEFAULT 50,
  qr_position_y INTEGER DEFAULT 50,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  max_tickets INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create public visuals table ("J'y serai" feature)
CREATE TABLE public.public_visuals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  creator_photo TEXT,
  visual_url TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_visuals ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view active events"
ON public.events
FOR SELECT
USING (is_active = true);

CREATE POLICY "Promoters can create events"
ON public.events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Promoters can update own events"
ON public.events
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Promoters can delete own events"
ON public.events
FOR DELETE
USING (auth.uid() = user_id);

-- Public visuals policies
CREATE POLICY "Anyone can view approved visuals"
ON public.public_visuals
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create visuals"
ON public.public_visuals
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own visuals"
ON public.public_visuals
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own visuals"
ON public.public_visuals
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at on events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for public_visuals (for the social wall)
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_visuals;