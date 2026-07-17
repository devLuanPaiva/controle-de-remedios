import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Plus, Sparkles } from "lucide-react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreatePrescriptionItemRequest, PrescriptionItemDraft } from "@/data/models/prescription-item.model";

import { PrescriptionItemCard } from "./PrescriptionItemCard";
import { PrescriptionItemForm } from "./PrescriptionItemForm";

interface PrescriptionItemsSectionProps {
    items: PrescriptionItemDraft[];
    onAdd: (item: CreatePrescriptionItemRequest) => void;
    onUpdate: (localId: string, item: CreatePrescriptionItemRequest) => void;
    onRemove: (localId: string) => void;
}

export function PrescriptionItemsSection({
    items,
    onAdd,
    onUpdate,
    onRemove,
}: Readonly<PrescriptionItemsSectionProps>) {
    const [editingItem, setEditingItem] = useState<PrescriptionItemDraft | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const isFormVisible = isCreating || Boolean(editingItem);
    const pendingDeleteItem = items.find((item) => item.localId === pendingDeleteId) ?? null;

    function closeForm(): void {
        setIsCreating(false);
        setEditingItem(null);
    }

    function handleSave(item: CreatePrescriptionItemRequest): void {
        if (editingItem) {
            onUpdate(editingItem.localId, item);
        } else {
            onAdd(item);
        }

        closeForm();
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Sparkles size={16} color={Colors.primary} />
                <Text style={styles.title}>Medicamentos da receita</Text>
            </View>

            <View style={styles.list}>
                {items.map((item) => (
                    <PrescriptionItemCard
                        key={item.localId}
                        item={item}
                        onEdit={() => setEditingItem(item)}
                        onDelete={() => setPendingDeleteId(item.localId)}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsCreating(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Adicionar medicamento"
            >
                <Plus size={16} color={Colors.primary} />
                <Text style={styles.addButtonText}>Adicionar medicamento</Text>
            </TouchableOpacity>

            <PrescriptionItemForm
                visible={isFormVisible}
                title={editingItem ? "Editar medicamento" : "Adicionar medicamento"}
                initialValue={editingItem}
                onSave={handleSave}
                onCancel={closeForm}
            />

            <ConfirmDialog
                visible={Boolean(pendingDeleteItem)}
                title="Remover medicamento"
                message={`Deseja remover "${pendingDeleteItem?.medicine.name}" desta receita?`}
                confirmLabel="Remover"
                destructive
                onConfirm={() => {
                    if (pendingDeleteItem) {
                        onRemove(pendingDeleteItem.localId);
                    }
                    setPendingDeleteId(null);
                }}
                onCancel={() => setPendingDeleteId(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.base,
        gap: Spacing.md,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },

    title: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.md,
        color: Colors.text,
    },

    list: {
        gap: Spacing.sm,
    },

    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.md,
    },

    addButtonText: {
        fontFamily: Typography.fonts.bodySemiBold,
        fontSize: Typography.sizes.sm,
        color: Colors.primary,
    },
});
