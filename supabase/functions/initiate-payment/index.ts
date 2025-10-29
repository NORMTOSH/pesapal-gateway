import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get('PESAPAL_CONSUMER_KEY');
const PESAPAL_CONSUMER_SECRET = Deno.env.get('PESAPAL_CONSUMER_SECRET');
const PESAPAL_API_URL = 'https://cybqa.pesapal.com/pesapalv3'; // Sandbox URL

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
  const response = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get access token:', errorText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  console.log('Access token obtained successfully');
  return data.token;
}

async function registerIPN(token: string) {
  const ipnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/pesapal-ipn`;
  
  const response = await fetch(`${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'GET',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to register IPN:', errorText);
  }

  const data = await response.json();
  console.log('IPN registration response:', data);
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, amount, currency } = await req.json();
    
    console.log('Payment request received:', { firstName, lastName, email, amount, currency });

    // Get access token
    const token = await getAccessToken();

    // Register IPN (if not already registered)
    await registerIPN(token);

    // Generate unique merchant reference
    const merchantReference = `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create payment request
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const callbackUrl = `${supabaseUrl.replace('supabase.co', 'lovableproject.com')}/payment-status`;
    
    const orderRequest = {
      id: merchantReference,
      currency: currency || 'KES',
      amount: amount,
      description: `Payment from ${firstName} ${lastName}`,
      callback_url: callbackUrl,
      notification_id: '', // Will be populated after IPN registration
      billing_address: {
        email_address: email,
        first_name: firstName,
        last_name: lastName,
      },
    };

    console.log('Submitting order request:', orderRequest);

    const response = await fetch(`${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to submit order:', errorText);
      throw new Error(`Failed to submit order: ${response.status}`);
    }

    const data = await response.json();
    console.log('Order submitted successfully:', data);

    return new Response(
      JSON.stringify({
        iframe_url: data.redirect_url,
        merchant_reference: merchantReference,
        order_tracking_id: data.order_tracking_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in initiate-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
