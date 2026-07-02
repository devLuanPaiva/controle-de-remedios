export enum ToastType {

    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export const ToastTypeLabels: Record<ToastType, string> = {
    [ToastType.Success]: 'Success',
    [ToastType.Error]: 'Error',
    [ToastType.Warning]: 'Warning',
    [ToastType.Info]: 'Info'
}

export interface Toast {

    id: string;

    type: ToastType;

    message: string;
}