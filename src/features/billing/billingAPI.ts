import { apiClient } from '@/app/api-client';
import { GetSubscriptionStatusResponse, type UpgradeToProSubscriptionPayload } from './billingType';
import type { PLAN_TYPE } from '@/constant/plan.constant';

export const billingApi = apiClient.injectEndpoints({
    endpoints: builder => ({
        upgradeToProSubscription: builder.mutation<
            { url: string },
            UpgradeToProSubscriptionPayload
        >({
            query: body => ({
                url: '/billing/subscription/upgrade',
                method: 'POST',
                body,
            }),
        }),

        manageSubscriptionBillingPortal: builder.mutation<{ url: string }, { callbackUrl: string }>(
            {
                query: body => ({
                    url: '/billing/subscription/billing-portal',
                    method: 'POST',
                    body,
                }),
            }
        ),

        getUserSubscriptionStatus: builder.query<GetSubscriptionStatusResponse, void>({
            query: () => ({
                url: '/billing/subscription/status',
                method: 'GET',
            }),
        }),

        switchToSubcriptionPlan: builder.mutation<
            { success: boolean; message: string },
            { newPlan: PLAN_TYPE },
            void
        >({
            query: body => ({
                url: '/billing/subscription/switch-plan',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useUpgradeToProSubscriptionMutation,
    useGetUserSubscriptionStatusQuery,
    useSwitchToSubcriptionPlanMutation,
    useManageSubscriptionBillingPortalMutation,
} = billingApi;
