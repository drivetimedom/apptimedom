-- Remove leads column from commercial_tracking table
ALTER TABLE public.commercial_tracking DROP COLUMN IF EXISTS leads;

-- Create traffic tracking table
CREATE TABLE public.traffic_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    week_start DATE NOT NULL,
    investment NUMERIC NOT NULL DEFAULT 0,
    leads_generated INTEGER NOT NULL DEFAULT 0,
    appointments INTEGER NOT NULL DEFAULT 0,
    attendance INTEGER NOT NULL DEFAULT 0,
    deals INTEGER NOT NULL DEFAULT 0,
    average_ticket NUMERIC NOT NULL DEFAULT 0,
    revenue NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traffic_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tracking" 
ON public.traffic_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking" 
ON public.traffic_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking" 
ON public.traffic_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking" 
ON public.traffic_tracking 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin can view all tracking
CREATE POLICY "Admins can view all tracking" 
ON public.traffic_tracking 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_traffic_tracking_updated_at
BEFORE UPDATE ON public.traffic_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();