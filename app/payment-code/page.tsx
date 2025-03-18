import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

const PaymentPage = () => {
  const paymentDetails = {
    amount: 120.5,
    reference: "ABC123456789",
    due: "2025-03-20 17:00",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Over-the-Counter Payment
          </CardTitle>
          <CardDescription>
            Please show this to the cashier or scan to pay.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Amount */}
          <div className="flex flex-col items-center text-center">
            <div className="text-muted-foreground text-sm">Amount to Pay</div>
            <div className="text-4xl font-semibold">
              ₱{paymentDetails.amount.toFixed(2)}
            </div>
          </div>

          {/* Reference Number */}
          <div className="flex justify-between items-center bg-muted p-2 rounded-md">
            <span className="font-mono text-sm">
              {paymentDetails.reference}
            </span>
          </div>

          {/* Due Time */}
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Due by</span>
            </div>
            <span>{paymentDetails.due}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;
