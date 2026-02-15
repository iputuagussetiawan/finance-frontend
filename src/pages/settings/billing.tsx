import { AppAlert } from '@/components/app-alert';
import { Separator } from '@/components/ui/separator';
import { PLANS, type PLAN_TYPE } from '@/constant/plan.constant';
import {
    useGetUserSubscriptionStatusQuery,
    useManageSubscriptionBillingPortalMutation,
    useSwitchToSubcriptionPlanMutation,
    useUpgradeToProSubscriptionMutation,
} from '@/features/billing/billingAPI';
import { PROTECTED_ROUTES } from '@/routes/common/routePath';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BillingPlanCard from './_components/billing-plan-card';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const BILLING_URL = `${window.location.origin}${PROTECTED_ROUTES.SETTINGS_BILLING}`;
const PLAN_LIST = Object.values(PLANS);

const Billing = () => {
    const [searchParams] = useSearchParams();
    const isSuccess = searchParams.get('success');
    const [isYearly, setIsYearly] = useState(false);

    const [upgradeToProSubscription, { isLoading: billingPortalLoading }] =
        useUpgradeToProSubscriptionMutation();
    const [manageSubscriptionBillingPortal, { isLoading: upgradeLoading }] =
        useManageSubscriptionBillingPortalMutation();
    const [switchToSubscriptionPlan, { isLoading: switchPlanLoading }] =
        useSwitchToSubcriptionPlanMutation();

    const { data, isFetching, refetch } = useGetUserSubscriptionStatusQuery(undefined, {
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const subscriptionData = data?.data;
    const currentPlan = subscriptionData?.currentPlan || '';
    const daysLeft = subscriptionData?.daysLeft || 0;
    const status = subscriptionData?.status || 'trialing';

    const isPro = PLAN_LIST.includes(currentPlan as PLAN_TYPE) && status === 'active';
    const planData = subscriptionData?.planData;

    const selectedPlanData = isYearly ? planData?.YEARLY : planData?.MONTHLY;

    const alertProps = useMemo(() => {
        if (isPro && status === 'active') {
            return {
                title: 'Pro Plan',
                variant: 'success' as const,
                message: `You are currently on a ${currentPlan} plan`,
            };
        }

        if (status === 'trialing') {
            if (daysLeft && daysLeft > 3) {
                return {
                    title: 'Free Trial Plan',
                    variant: 'info' as const,
                    message: `You are on a free trial plan ${daysLeft} days left`,
                };
            }

            if (daysLeft && daysLeft <= 3) {
                return {
                    title: 'Trial Expiring',
                    variant: 'warning' as const,
                    message: `Trial Expired in ${daysLeft} days ${daysLeft === 1 ? '' : 's'}.Please upgrade`,
                };
            }
        }

        if (status === 'trial_expired') {
            return {
                title: 'Trial Expired',
                variant: 'destructive' as const,
                message: `Youe trial has expired, please upgrade to continue.`,
            };
        }

        if (status === 'canceled') {
            return {
                title: 'Subscription Canceled',
                variant: 'destructive' as const,
                message: `Your subscription has beddn canceled,please upgrade to continue`,
            };
        }

        return {
            title: 'Subscription status unknow',
            variant: 'warning' as const,
            message: `We couldn't determine your subscription status`,
        };
    }, [currentPlan, isPro, status]);

    const handleSubscriptionAction = () => {
        if (!isPro) {
            upgradeToProSubscription({
                plan: isYearly ? PLANS.YEARLY : PLANS.MONTHLY,
                callbackUrl: BILLING_URL,
            })
                .unwrap()
                .then(res => {
                    window.location.href = res.url;
                })
                .catch((error: any) => {
                    toast.error(
                        error?.data?.message || 'Failed to upgrade subscription, try again'
                    );
                });
        } else if (currentPlan !== (isYearly ? PLANS.YEARLY : PLANS.MONTHLY)) {
            handleSwitchSubscription();
        } else {
            handleManageSubscription();
        }
    };

    const handleManageSubscription = () => {
        manageSubscriptionBillingPortal({
            callbackUrl: BILLING_URL,
        })
            .unwrap()
            .then(res => {
                window.location.href = res.url;
            })
            .catch((error: any) => {
                toast.error(error?.data?.message || 'Failed to manage subscription, try again');
            });
    };

    const handleSwitchSubscription = () => {
        const targetPlan = isYearly ? PLANS.YEARLY : PLANS.MONTHLY;

        if (currentPlan === targetPlan) {
            toast.info('You are already on this plan');
        }

        switchToSubscriptionPlan({
            newPlan: targetPlan,
        })
            .unwrap()
            .then(res => {
                setTimeout(() => {
                    refetch();
                }, 1500);
                toast.success(`${res.message} please reload the page`);
            })
            .catch((error: any) => {
                toast.error(error?.data?.message || 'Failed to switch subscription');
            });
    };

    useEffect(() => {
        setIsYearly(currentPlan === PLANS.YEARLY);
    }, [currentPlan]);

    useEffect(() => {
        if (isSuccess === 'true') {
            toast.success('You have successfully subscribe to Finance Pro Plan');
        }
        if (isSuccess === 'false') {
            toast.error('Failed to subscribe to Finance Pro');
        }
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Billing</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your subscription and billing information
                </p>
            </div>
            <Separator />

            <div className="w-full space-y-6">
                {isFetching ? (
                    <BillingSkeleton />
                ) : (
                    <>
                        <AppAlert
                            title={alertProps.title}
                            message={alertProps.message}
                            variant={alertProps.variant}
                            showDismissButton={false}
                        />
                        <BillingPlanCard
                            selectedPlan={selectedPlanData}
                            isYearly={isYearly}
                            isLoading={upgradeLoading || billingPortalLoading || switchPlanLoading}
                            isPro={isPro || false}
                            currentPlanType={currentPlan as PLAN_TYPE}
                            onPlanChange={setIsYearly}
                            onSubscriptionAction={handleSubscriptionAction}
                        />
                    </>
                )}
                {/* Current Plan */}
                {/* Upgrade Options */}
                {/* <div className="mt-0">
                    <h1 className="text-lg font-medium mb-2">Support Us</h1>
                    <p className="text-base mb-2">
                        The Billing feature is part of the <strong>extended version</strong> of this
                        project. It took <strong>weeks and months</strong> to design, build, and
                        refine.
                    </p>

                    <p className="text-base mb-2">
                        By supporting us, you’ll unlock premium billing features including:
                    </p>

                    <ul className="list-disc pl-5 text-base mb-2">
                        <li>
                            <strong>Free Trial + Stripe Subscriptions</strong>
                        </li>
                        <li>
                            <strong>Monthly & Yearly Plans</strong> built-in
                        </li>
                        <li>
                            <strong>Switch between plans</strong> (monthly ↔ yearly)
                        </li>
                        <li>
                            <strong>Manage & Cancel Subscriptions</strong> anytime
                        </li>
                        <li>
                            <strong>Step-by-step Setup Video</strong>
                        </li>
                        <li>
                            <strong>Full Source Code</strong>
                        </li>
                        <li>
                            <strong>Production-Ready Deployment</strong>
                        </li>
                    </ul>

                    <p className="text-base mb-2">
                        Your support helps us keep building free, high-quality projects for the
                        community.
                    </p>

                    <p className="text-base font-medium">
                        🔓 <span className="text-green-600">Get it here:</span>
                        <a
                            className="text-blue-500 underline ml-1"
                            href="https://tinyurl.com/extended-stripe-integration "
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Click Here
                        </a>
                    </p>
                    <br />
                    <br />
                </div> */}
            </div>
        </div>
    );
};

export default Billing;

const BillingSkeleton = () => (
    <div className="space-y-0">
        <Skeleton className="h-px w-full" />
        <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="w-full">
                {[1].map(i => (
                    <Skeleton key={i} className="h-60 w-full rounded-lg" />
                ))}
            </div>
        </div>
    </div>
);
