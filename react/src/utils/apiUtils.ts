import { toast } from "sonner";
import { AxiosError } from "axios";

export const handleApiError = (error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message,
            {
                duration: 5000,
                position: "top-right",
                style: {
                    background: "#4ade80",
                    color: "#fff",
                },
            }
        );
    } else if (error instanceof AxiosError && typeof error.response?.data === 'string') {
        toast.error(error.response.data,
            {
                duration: 5000,
                position: "top-right",
                style: {
                    background: "#4ade80",
                    color: "#fff",
                },
            }
        );
    } else {
        toast.error(defaultMessage,
            {
                duration: 5000,
                position: "top-right",
                style: {
                    background: "#4ade80",
                    color: "#fff",
                },
            }
        );
    }
};
