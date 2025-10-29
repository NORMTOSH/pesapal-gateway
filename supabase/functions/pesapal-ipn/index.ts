import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PESAPAL_CONSUMER_KEY = Deno.env.get('PESAPAL_CONSUMER_KEY');
const PESAPAL_CONSUMER_SECRET = Deno.env.get('PESAPAL_CONSUMER_SECRET');
const PESAPAL_API_URL = 'https://cybqa.pesapal.com/pesapalv3';

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
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderTrackingId = url.searchParams.get('OrderTrackingId');
    const merchantReference = url.searchParams.get('OrderMerchantReference');

    console.log('IPN received:', { orderTrackingId, merchantReference });

    if (!orderTrackingId) {
      return new Response('Missing OrderTrackingId', { status: 400 });
    }

    // Get access token
    const token = await getAccessToken();

    // Get transaction status
    const response = await fetch(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Payment status update:', {
      merchantReference,
      status: data.payment_status_description,
      amount: data.amount,
    });

    // Here you could store the payment status in your database
    // For now, just log it

    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error in pesapal-ipn function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
