import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"checking" | "success" | "failed" | "pending">("checking");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const merchantReference = searchParams.get("pesapal_merchant_reference");
      const trackingId = searchParams.get("pesapal_transaction_tracking_id");

      if (!merchantReference || !trackingId) {
        setStatus("failed");
        return;
      }

      setTransactionId(trackingId);

      try {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: { merchantReference, trackingId }
        });

        if (error) throw error;

        switch (data?.status) {
          case "COMPLETED":
            setStatus("success");
            break;
          case "FAILED":
            setStatus("failed");
            break;
          case "PENDING":
            setStatus("pending");
            break;
          default:
            setStatus("failed");
        }
      } catch (error: any) {
        console.error("Status check error:", error);
        toast.error("Failed to check payment status");
        setStatus("failed");
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-success" />;
      case "pending":
        return <Clock className="h-16 w-16 text-warning" />;
      case "failed":
        return <XCircle className="h-16 w-16 text-destructive" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "checking":
        return "Checking Payment Status...";
      case "success":
        return "Payment Successful!";
      case "pending":
        return "Payment Pending";
      case "failed":
        return "Payment Failed";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "checking":
        return "Please wait while we verify your payment with PesaPal";
      case "success":
        return "Your payment has been processed successfully. Thank you for your transaction!";
      case "pending":
        return "Your payment is being processed. You will receive a notification once it's complete.";
      case "failed":
        return "We couldn't process your payment. Please try again or contact support.";
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-medium)]">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{getStatusIcon()}</div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
            <CardDescription className="text-base">
              {getStatusDescription()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactionId && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="text-sm font-mono break-all">{transactionId}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/payment">Make Another Payment</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatus;
