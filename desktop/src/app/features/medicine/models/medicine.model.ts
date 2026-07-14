export interface IMedicine {
    id: string;
    name: string;
    eanCode: string | null;
    imageUrl: string | null;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
