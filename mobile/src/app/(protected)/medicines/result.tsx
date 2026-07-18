import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Spacing } from "@/theme";
import { useMedicineResultForm } from "@/features/medicines/hooks/useMedicineResultForm";
import { MedicineResultDetails } from "@/features/medicines/components/MedicineResultDetails";
import { RetakePhotoModal } from "@/features/medicines/components/RetakePhotoModal";

export default function MedicineFoundResult() {
    const {
        lookup,
        permission,
        cameraRef,
        isEditing,
        setIsEditing,
        name,
        setName,
        isRetakingPhoto,
        setIsRetakingPhoto,
        retakenPhoto,
        capturing,
        isSaving,
        formError,
        finishAndGoHome,
        startEditingPhoto,
        handleRetakeCapture,
        handleSave,
    } = useMedicineResultForm();

    if (lookup.status !== "found") {
        return <View style={styles.container} />;
    }

    const { medicine } = lookup;
    const hasChanges = name.trim() !== medicine.name || Boolean(retakenPhoto);
    const previewUri = retakenPhoto?.localUri ?? medicine.imageUrl ?? undefined;

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <MedicineResultDetails
                    medicine={medicine}
                    eanCode={medicine.eanCode ?? lookup.eanCode}
                    isEditing={isEditing}
                    name={name}
                    onChangeName={setName}
                    previewUri={previewUri}
                    formError={formError}
                    hasChanges={hasChanges}
                    isSaving={isSaving}
                    onEditPhoto={startEditingPhoto}
                    onStartEdit={() => setIsEditing(true)}
                    onSave={handleSave}
                    onFinish={finishAndGoHome}
                />
            </ScrollView>

            <RetakePhotoModal
                visible={isRetakingPhoto}
                cameraRef={cameraRef}
                permissionGranted={Boolean(permission?.granted)}
                capturing={capturing}
                onClose={() => setIsRetakingPhoto(false)}
                onCapture={handleRetakeCapture}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    content: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxl,
        gap: Spacing.lg,
    },
});
