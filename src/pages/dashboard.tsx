import Dropzone from "@/components/dropzone";
import Layout from "@/components/layout";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-hot-toast";
import { ImSpinner8 } from "react-icons/im";

const Dashboard = () => {
  const router = useRouter();

  const paymentStatus = api.stripe.getPaymentStatus.useQuery(undefined, {
    onError: (err) => {
      if (err.data?.httpStatus === 401) {
        toast.error("please login first");
        router.push("/");
      }
    },
    onSuccess: (data) => {
      if (!data?.isPaymentSucceeded) {
        toast.error("please complete the payment first");
        router.push("/");
      }
    },
  });

  if (paymentStatus.isLoading || !paymentStatus.data?.isPaymentSucceeded) {
    return (
      <Layout>
        <div className="flex h-[80vh] w-full items-center justify-center">
          <ImSpinner8 className="h-10 w-10 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* this is protected page, only for the users who have done the payment */}
      <Dropzone />
    </Layout>
  );
};

export default Dashboard;
