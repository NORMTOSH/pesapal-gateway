import { useState } from "react";
import { PaymentForm } from "@/components/PaymentForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePaymentSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('initiate-payment', {
        body: data
      });

      if (error) throw error;

      if (response?.iframe_url) {
        setIframeUrl(response.iframe_url);
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setIsLoading(false);
    }
  };

  if (iframeUrl) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground">Complete Your Payment</h2>
            <p className="text-muted-foreground">You will be redirected after completing the payment</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-[var(--shadow-medium)] bg-card">
            <iframe
              src={iframeUrl}
              title="PesaPal Payment"
              className="w-full h-[600px] border-0"
              allow="payment"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PesaPal Payment
          </h1>
          <p className="text-muted-foreground">
            Secure and easy payment processing
          </p>
        </div>
        <PaymentForm onSubmit={handlePaymentSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Payment;
