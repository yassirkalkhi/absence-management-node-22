import { toast } from "sonner";
import { AxiosError } from "axios";

export const handleApiError = (error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
    } else if (error instanceof AxiosError && typeof error.response?.data === 'string') {
        toast.error(error.response.data);
    } else {
        toast.error(defaultMessage);
    }
};
