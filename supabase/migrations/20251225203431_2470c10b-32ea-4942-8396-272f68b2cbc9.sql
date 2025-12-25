
-- Enum pour les rôles utilisateur
CREATE TYPE public.app_role AS ENUM ('admin', 'promoter', 'staff', 'scanner', 'user');

-- Enum pour le statut des tickets
CREATE TYPE public.ticket_status AS ENUM ('pending', 'paid', 'used', 'cancelled', 'expired');

-- Enum pour les méthodes de paiement
CREATE TYPE public.payment_method AS ENUM ('orange_money', 'mtn_money', 'moov_money', 'wave', 'card', 'free');

-- Table des rôles utilisateur
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, event_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Table des tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchaser_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  status ticket_status NOT NULL DEFAULT 'pending',
  is_gift BOOLEAN NOT NULL DEFAULT false,
  recipient_name TEXT,
  recipient_phone TEXT,
  recipient_email TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE,
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Table des transactions de paiement
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  payment_method payment_method NOT NULL,
  payment_reference TEXT,
  payment_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier les rôles (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role, _event_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (event_id = _event_id OR event_id IS NULL OR _event_id IS NULL)
  )
$$;

-- Fonction pour vérifier si admin ou promoteur
CREATE OR REPLACE FUNCTION public.is_admin_or_promoter(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'promoter')
  )
$$;

-- Fonction pour vérifier si staff ou scanner pour un événement
CREATE OR REPLACE FUNCTION public.is_event_staff(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('staff', 'scanner', 'admin', 'promoter')
      AND (event_id = _event_id OR event_id IS NULL)
  )
$$;

-- RLS Policies pour user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Promoters can manage event staff roles"
ON public.user_roles FOR ALL
USING (
  public.has_role(auth.uid(), 'promoter')
  AND role IN ('staff', 'scanner')
);

-- RLS Policies pour tickets
CREATE POLICY "Users can view their own tickets"
ON public.tickets FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = purchaser_id);

CREATE POLICY "Event staff can view event tickets"
ON public.tickets FOR SELECT
USING (public.is_event_staff(auth.uid(), event_id));

CREATE POLICY "Users can create tickets"
ON public.tickets FOR INSERT
WITH CHECK (auth.uid() = purchaser_id);

CREATE POLICY "Users can update their own pending tickets"
ON public.tickets FOR UPDATE
USING (auth.uid() = purchaser_id AND status = 'pending');

CREATE POLICY "Staff can update tickets for scanning"
ON public.tickets FOR UPDATE
USING (public.is_event_staff(auth.uid(), event_id));

-- RLS Policies pour transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers pour updated_at
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour générer un QR code unique
CREATE OR REPLACE FUNCTION public.generate_ticket_qr_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  LOOP
    new_code := encode(gen_random_bytes(16), 'hex');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.tickets WHERE qr_code = new_code);
  END LOOP;
  RETURN new_code;
END;
$$;
