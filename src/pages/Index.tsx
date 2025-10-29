import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Zap, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="relative mx-auto max-w-6xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            PesaPal Payment Gateway
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, fast, and reliable payment processing for your business. Accept payments from customers across Africa and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 shadow-[var(--shadow-soft)]">
              <Link to="/payment">
                <CreditCard className="mr-2 h-5 w-5" />
                Make Payment
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/payment-status">Check Status</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PesaPal?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure & Safe</CardTitle>
                <CardDescription>
                  Bank-level encryption protects your payment information at every step
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <CardHeader>
                <Zap className="h-12 w-12 text-secondary mb-4" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Process payments in seconds with our optimized payment flow
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-success mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant notifications about your payment status via IPN
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="mx-auto max-w-6xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Supported Currencies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["KES", "USD", "GBP", "EUR", "TZS", "UGX"].map((currency) => (
              <div
                key={currency}
                className="px-6 py-3 bg-card rounded-lg shadow-[var(--shadow-soft)] font-semibold"
              >
                {currency}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
