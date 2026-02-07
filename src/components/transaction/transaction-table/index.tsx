import { DataTable } from '@/components/data-table';
import { transactionColumns } from './column';
import { _TRANSACTION_TYPE, _TransactionType } from '@/constant';
import { useState } from 'react';
import useDebouncedSearch from '@/hooks/use-debounce-search';
import { useGetAllTransactionsQuery } from '@/features/transaction/transactionAPI';

type FilterType = {
    type?: _TransactionType;
    recurringStatus?: 'RECURRING' | 'NON_RECURRING';
    pageNumber?: number;
    pageSize?: number;
};

type TransactionTableProps = {
    pageSize?: number;
    isShowPagination?: boolean;
};

const TransactionTable = ({ pageSize = 10, isShowPagination = true }: TransactionTableProps) => {
    const [filter, setFilter] = useState<FilterType>({
        type: undefined,
        recurringStatus: undefined,
        pageNumber: 1,
        pageSize: pageSize, // ✅ use destructured prop
    });

    const { debouncedTerm, setSearchTerm } = useDebouncedSearch('', {
        delay: 500,
    });

    const { data, isFetching } = useGetAllTransactionsQuery({
        keyword: debouncedTerm,
        type: filter.type,
        recurringStatus: filter.recurringStatus,
        pageNumber: filter.pageNumber,
        pageSize: filter.pageSize,
    });

    const transactions = data?.transactions ?? [];

    const pagination = {
        totalItems: data?.pagination?.totalCount ?? 0,
        totalPages: data?.pagination?.totalPages ?? 1,
        pageNumber: filter.pageNumber ?? 1,
        pageSize: filter.pageSize ?? 10,
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setFilter(prev => ({ ...prev, pageNumber: 1 }));
    };

    const handleFilterChange = (filters: Record<string, string>) => {
        const { type, frequently } = filters;
        setFilter(prev => ({
            ...prev,
            type: type as _TransactionType,
            recurringStatus: frequently as 'RECURRING' | 'NON_RECURRING',
            pageNumber: 1,
        }));
    };

    const handlePageChange = (pageNumber: number) => {
        setFilter(prev => ({ ...prev, pageNumber }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setFilter(prev => ({ ...prev, pageSize, pageNumber: 1 }));
    };

    const handleBulkDelete = (transactionIds: string[]) => {
        console.log(transactionIds);
    };

    return (
        <DataTable
            data={transactions}
            columns={transactionColumns}
            searchPlaceholder="Search transactions..."
            isLoading={isFetching} // ✅ fixed
            isBulkDeleting={false}
            isShowPagination={isShowPagination} // ✅ fixed
            pagination={pagination}
            filters={[
                {
                    key: 'type',
                    label: 'All Types',
                    options: [
                        { value: _TRANSACTION_TYPE.INCOME, label: 'Income' },
                        { value: _TRANSACTION_TYPE.EXPENSE, label: 'Expense' },
                    ],
                },
                {
                    key: 'frequently',
                    label: 'Frequently',
                    options: [
                        { value: 'RECURRING', label: 'Recurring' },
                        { value: 'NON_RECURRING', label: 'Non-Recurring' },
                    ],
                },
            ]}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onFilterChange={handleFilterChange}
            onBulkDelete={handleBulkDelete}
        />
    );
};

export default TransactionTable;
