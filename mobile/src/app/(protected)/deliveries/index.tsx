import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing, Typography } from "@/theme";
import { useCompanies } from "@/data/contexts/CompanyContext";
import { useDebouncedValue } from "@/data/hooks/useDebouncedValue";
import { ApiRequestError } from "@/lib/apiFetch";
import { todayIso } from "@/lib/dateFormat";
import { DeliveryFilterParams, IPendingDeliveryItem } from "@/data/models/delivery.model";
import { useCompletedDeliveries } from "@/features/deliveries/hooks/useCompletedDeliveries";
import { usePendingDeliveryItems } from "@/features/deliveries/hooks/usePendingDeliveryItems";
import { useDeliverPrescriptionItem } from "@/features/deliveries/hooks/useDeliverPrescriptionItem";
import { DeliveryTab, DeliveryTabSwitcher } from "@/features/deliveries/components/DeliveryTabSwitcher";
import { DeliveryFilterBar } from "@/features/deliveries/components/DeliveryFilterBar";
import { CompletedDeliveryCard } from "@/features/deliveries/components/CompletedDeliveryCard";
import { PendingDeliveryItemCard } from "@/features/deliveries/components/PendingDeliveryItemCard";
import { DeliverItemModal } from "@/features/deliveries/components/DeliverItemModal";
import { PaginatedList } from "@/components/shared/PaginatedList";
import { BackButton } from "@/components/shared/BackButton";

const FILTER_DEBOUNCE_MS = 400;

export default function DeliveriesScreen() {
    const { selectedCompany } = useCompanies();

    const [activeTab, setActiveTab] = useState<DeliveryTab>("completed");
    const [name, setName] = useState("");
    const [cpf, setCpf] = useState("");
    const [deliveringItem, setDeliveringItem] = useState<IPendingDeliveryItem | null>(null);

    const debouncedName = useDebouncedValue(name, FILTER_DEBOUNCE_MS);
    const debouncedCpf = useDebouncedValue(cpf, FILTER_DEBOUNCE_MS);

    const filter = useMemo<DeliveryFilterParams>(
        () => ({ patientName: debouncedName, patientCpf: debouncedCpf }),
        [debouncedName, debouncedCpf],
    );

    const completedDeliveries = useCompletedDeliveries(selectedCompany?.id, filter);
    const pendingItems = usePendingDeliveryItems(selectedCompany?.id, filter);
    const { deliver, isSubmitting } = useDeliverPrescriptionItem();

    async function handleConfirmDelivery(quantity: number) {
        if (!deliveringItem) {
            return;
        }

        try {
            await deliver({
                prescriptionItemId: deliveringItem.prescriptionItemId,
                deliveryDate: todayIso(),
                deliveryQuantity: quantity,
            });

            setDeliveringItem(null);
            pendingItems.refresh();
            Alert.alert("Sucesso", "Entrega registrada com sucesso.");
        } catch (err) {
            Alert.alert(
                "Erro",
                err instanceof ApiRequestError ? err.message : "Não foi possível registrar a entrega.",
            );
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.title}>Entregas</Text>
            </View>

            <View style={styles.controls}>
                <DeliveryTabSwitcher value={activeTab} onChange={setActiveTab} />
                <DeliveryFilterBar name={name} cpf={cpf} onChangeName={setName} onChangeCpf={setCpf} />
            </View>

            {activeTab === "completed" ? (
                <PaginatedList
                    data={completedDeliveries.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CompletedDeliveryCard delivery={item} />}
                    isLoading={completedDeliveries.isLoading}
                    isLoadingMore={completedDeliveries.isLoadingMore}
                    error={completedDeliveries.error}
                    emptyMessage="Nenhuma entrega realizada encontrada."
                    onLoadMore={completedDeliveries.loadMore}
                    onRefresh={completedDeliveries.refresh}
                />
            ) : (
                <PaginatedList
                    data={pendingItems.items}
                    keyExtractor={(item) => item.prescriptionItemId}
                    renderItem={({ item }) => (
                        <PendingDeliveryItemCard item={item} onDeliver={() => setDeliveringItem(item)} />
                    )}
                    isLoading={pendingItems.isLoading}
                    isLoadingMore={pendingItems.isLoadingMore}
                    error={pendingItems.error}
                    emptyMessage="Nenhum item pendente de entrega encontrado."
                    onLoadMore={pendingItems.loadMore}
                    onRefresh={pendingItems.refresh}
                />
            )}

            <DeliverItemModal
                item={deliveringItem}
                isSubmitting={isSubmitting}
                onConfirm={handleConfirmDelivery}
                onCancel={() => setDeliveringItem(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
    },

    title: {
        fontFamily: Typography.fonts.heading,
        fontSize: Typography.sizes.xxl,
        color: Colors.text,
    },

    controls: {
        gap: Spacing.md,
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
});
