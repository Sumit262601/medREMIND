import { useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Platform, Dimensions, Animated, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link, useRouter } from "expo-router";
import { addMedication } from "@/utils/storage";
import { scheduleMedicationReminder } from "@/utils/notifications";

const { width } = Dimensions.get("window");

const FREQUENCIES = [
    {
        id: "1",
        label: "Once daily",
        icon: "sunny-outline" as const,
        times: ["09:00"],
    },
    {
        id: "2",
        label: "Twice daily",
        icon: "sync-outline" as const,
        times: ["09:00", "21:00"],
    },
    {
        id: "3",
        label: "Three times",
        icon: "time-outline" as const,
        times: ["09:00", "15:00", "21:00"],
    },
    {
        id: "4",
        label: "Four times",
        icon: "repeat-outline" as const,
        times: ["09:00", "13:00", "17:00", "21:00"],
    },
    {
        id: "5",
        label: "As needed",
        icon: "calendar-outline" as const,
        times: ["09:00", "12:00", "15:00", "18:00", "21:00"],
    },

]

const DURATIONS = [
    { id: "1", label: "7 day", value: 7 },
    { id: "2", label: "14 day", value: 14 },
    { id: "3", label: "30 day", value: 30 },
    { id: "4", label: "90 day", value: 90 },
    { id: "5", label: "Ongoing", value: -1 },
]

export default function AddMedicationScreen() {

    const [form, setForm] = useState({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        startDate: new Date(),
        times: ["09:00"],
        notes: "",
        reminderEnabled: true,
        refillReminder: false,
        currentSupply: "",
        refillAt: "",
    });

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setForm(prev => ({ ...prev, startDate: selectedDate }));
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setForm(prev => ({ ...prev, times: [`${hours}:${minutes}`] }));
        }
    };

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedFrequency, setSelectedFrequency] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const router = useRouter();

    const scrollY = useRef(new Animated.Value(0)).current;
    const footerTranslateY = scrollY.interpolate({
        inputRange: [-1, 0, 100],
        outputRange: [0, 0, 100],
        extrapolate: 'clamp'
    });

    const renderFrequencyOptions = () => {
        return (
            <View style={styles.optionsGrid}>
                {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                        key={freq.id}
                        style={[
                            styles.optionCard,
                            selectedFrequency === freq.label && styles.selectedOptionCard
                        ]}
                        onPress={() => {

                            setSelectedFrequency(freq.label);
                            setForm({ ...form, frequency: freq.label });
                        }}
                    >
                        <View style={[
                            styles.optionIcon,
                            selectedFrequency === freq.label && styles.selectedOptionIcon

                        ]}>
                            <Ionicons
                                name={freq.icon}
                                size={24}
                                color={selectedFrequency === freq.label ? "white" : "#666"}
                                style={{ alignSelf: "center" }}
                            />
                            <Text
                                style={[
                                    styles.optionLabel,
                                    selectedFrequency === freq.label && styles.selectedOptionLabel
                                ]}
                            >
                                {freq.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )
    };

    const renderDurationOptions = () => {
        return (
            <View style={styles.optionsGrid}>
                {DURATIONS.map((dur) => (
                    <TouchableOpacity
                        key={dur.id}
                        style={[
                            styles.optionCard,
                            selectedDuration === dur.label && styles.selectedOptionCard
                        ]}
                        onPress={() => {
                            setSelectedDuration(dur.label);
                            setForm({ ...form, duration: dur.label });
                        }}
                    >
                        <Text
                            style={[
                                styles.durationNumber,
                                selectedDuration === dur.label && styles.selectedDurationNumber
                            ]}
                        >{dur.value > 0 ? dur.value : "∞"}</Text>
                        <Text
                            style={[
                                styles.optionLabel,
                                selectedDuration === dur.label && styles.selectedOptionLabel
                            ]}
                        >{dur.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        )
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!form.name.trim()) {
            newErrors.name = "Medication name is required.";
        }

        if (!form.dosage.trim()) {
            newErrors.name = "Dosage is required.";
        }

        if (!form.frequency) {
            newErrors.frequency = "Frequency is required.";
        }

        if (!form.duration) {
            newErrors.duration = "Duration is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSave = async () => {
        try {

            // 
            if (!validateForm()) {
                Alert.alert("Error", "Please fill in all required fields.");
                return;
            }

            // Save the medication data to the database or API
            if (isSubmitting) return;
            setIsSubmitting(true);

            const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0", "#3F51B5", "#009688", "#FF5722"];
            const ramdomColor = colors[Math.floor(Math.random() * colors.length)];

            const medicationData = {
                id: Math.random().toString(36).substr(2, 9),
                ...form,
                currentSupply: form.currentSupply ? Number(form.currentSupply) : 0,

                totalSupply: form.currentSupply ? Number(form.currentSupply) : 0,
                refillAt: form.refillAt ? Number(form.refillAt) : 0,
                color: ramdomColor,
                startDate: form.startDate.toISOString(),
            }

            await addMedication(medicationData);

            if (medicationData.reminderEnabled) {
                await scheduleMedicationReminder(medicationData);
            }

            Alert.alert(
                "Success",
                "Medication added successfully.",
                [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ],
                { cancelable: false }
            );

        } catch (error) {
            console.log("Save error:", error);
            Alert.alert(
                "Error",
                "Falied to save medciation. Please try again.",
                [{ text: "OK" }],
                { cancelable: false }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Medication add */}
            <LinearGradient
                colors={["#1a8e2d", "#146922"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            />
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={28} color={'#1a8e2d'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Medication</Text>
                </View>

                {/*  */}
                <Animated.ScrollView
                    showsHorizontalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.formContentContainer}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* basic informations to add medications */}
                    <View style={styles.section}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.mainInput, errors.name && styles.inputError]}
                                placeholder="Medication Name"
                                placeholderTextColor={'#999'}
                                value={form.name}
                                onChangeText={(text) => {
                                    setForm({ ...form, name: text })
                                    if (errors.name) {
                                        setErrors({ ...errors, name: "" })
                                    }
                                }}
                            />
                            {
                                errors.name && (
                                    <Text style={styles.errorText}>{errors.name}</Text>)
                            }
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.mainInput, errors.name && styles.inputError]}
                                placeholder="Dosage (e.g., 500mg)"
                                placeholderTextColor={'#999'}
                                value={form.dosage}
                                onChangeText={(text) => {
                                    setForm({ ...form, dosage: text })
                                    if (errors.dosage) {
                                        setErrors({ ...errors, dosage: "" })
                                    }
                                }}
                            />
                            {errors.dosage &&
                                (<Text style={styles.errorText}>{errors.dosage}</Text>)
                            }
                        </View>
                    </View>

                    {/* schedule */}
                    <View style={styles.container}>

                        <Text style={styles.sectionTitle}>
                            How often?
                        </Text>
                        {errors.frequency && (<Text style={styles.errorText}>{errors.frequency}</Text>)}
                        {renderFrequencyOptions()}


                        <Text style={styles.sectionTitle}>
                            For how long?
                        </Text>
                        {errors.duration && (<Text style={styles.errorText}>{errors.duration}</Text>)}
                        {renderDurationOptions()}

                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={styles.dateButton}
                        >
                            <View style={styles.dateIconContainer}>
                                <Ionicons style={{ alignSelf: "center" }} name="calendar" size={24} color={"#1a8e2d"} />
                            </View>
                            <Text style={styles.dateButtonText}>
                                Starts {form.startDate.toLocaleDateString()}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={"#666"} />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={form.startDate}
                                mode="date"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) {
                                        setForm({ ...form, startDate: date });
                                    }
                                }}
                            />
                        )}

                        {form.frequency && form.frequency! == "As needed" && (

                            <View style={styles.timesContainer}>
                                <Text style={styles.timesTitle}>Medication Times</Text>

                                {form.times.map((time, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.timeButton}
                                        onPress={() => {
                                            setShowTimePicker(true)
                                        }}
                                    >
                                        <View style={styles.timeIconContainer}>
                                            <Ionicons
                                                style={{ alignSelf: "center" }}
                                                name="time"
                                                size={24}
                                                color={'#1a8e2d'}
                                            />
                                        </View>
                                        <Text style={styles.timeButtonText}>{time}</Text>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={'#666'}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {showTimePicker && (
                            <DateTimePicker
                                mode="time"
                                value={(() => {
                                    const [hours, minutes] = form.times[0].split(":").map(Number);
                                    const date = new Date();
                                    date.setHours(hours, minutes, 0, 0);
                                    return date;
                                })()}
                                onChange={(event, date) => {
                                    setShowTimePicker(false);
                                    if (date) {
                                        const newTime = date.toLocaleTimeString('default', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        });
                                        setForm((prev) => ({
                                            ...prev,
                                            time: prev.times.map((t, i) => (i === 0 ? newTime : t)),
                                        }))
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* Reminder */}
                    <View style={styles.section}>
                        <View style={styles.card}>
                            <View style={styles.switchRow}>
                                <View style={styles.switchlabelContainer}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons style={{ alignSelf: "center" }} size={16} name="notifications" ccolor={"#1a8e2d"} />
                                    </View>
                                    <View>
                                        <Text style={styles.switchLabel}>Reminder</Text>
                                        <Text style={styles.switchSubLabel}>
                                            Get notified when its time to take your medications
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={form.reminderEnabled}
                                    trackColor={{ false: "#ddd", true: "#1a8e2d" }}
                                    thumbColor={'white'}
                                    onValueChange={(value) =>
                                        setForm({ ...form, reminderEnabled: value })
                                    }
                                />
                            </View>
                        </View>
                    </View>

                    {/* Refill Tracking */}

                    {/* Notes */}
                    <View style={styles.section}>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Add notes or special instructions..."
                                placeholderTextColor='#999'
                                value={form.notes}
                                onChangeText={(text) => setForm({ ...form, notes: text })}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </Animated.ScrollView>

                <Animated.View
                    style={[
                        styles.footer,
                        {
                            transform: [{ translateY: footerTranslateY }],
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isSubmitting && styles.saveButtonDisabled,
                        ]}
                        onPress={() => handleSave()}
                    >
                        <LinearGradient
                            colors={["#1a8e2d", "#146922"]}
                            style={styles.saveButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSubmitting ? "Adding..." : "Add Medication"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </Animated.View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        marginBottom: 20,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS == 'ios' ? 180 : 160,
    },
    content: {
        flex: 1,
        paddingTop: Platform.OS == 'ios' ? 50 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        zIndex: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginLeft: 15,
    },
    formContentContainer: {
        padding: 20,
        paddingBottom: 45,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 15,
        marginTop: 10,
    },
    mainInput: {
        fontSize: 20,
        color: "#333",
        padding: 15,
    },
    inputContainer: {
        backgroundColor: "white",
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputError: {
        borderColor: "#FF5252",
    },
    errorText: {
        color: "#FF5252",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 12
    },
    optionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -5,
    },
    optionCard: {
        width: (width - 60) / 2,
        backgroundColor: "white",
        borderRadius: 16,
        padding: 15,
        margin: 5,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowRadius: 8,
        shadowOpacity: 0.05,
        shadowOffset: {
            width: 0,
            height: 2
        },
        elevation: 2,
    },
    selectedOptionCard: {
        backgroundColor: "#1a8e2d",
        borderColor: "#1a8e3d"
    },
    optionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignContent: "center",
        marginBottom: 10,
    },
    selectedOptionIcon: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        textAlign: "center"
    },
    selectedOptionLabel: {
        color: "white",
    },
    durationNumber: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1a8e2d",
        marginBottom: 5,
    },
    selectedDurationNumber: {
        color: "white",
    },
    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 15,
        marginTop: 15,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 8,
        shadowOpacity: 0.05,
        elevation: 2,
    },
    dateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignContent: "center",
        marginRight: 10,
    },
    dateButtonText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    timesContainer: {
        marginTop: 20
    },
    timesTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 10,
    },
    timeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 8,
        shadowOpacity: 0.05,
        elevation: 2,
    },
    timeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignContent: "center",
        marginRight: 10,
    },
    timeButtonText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    switchlabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignContent: "center",
        marginRight: 15,
    },
    switchLabel: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    switchSubLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    textAreaContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    textArea: {
        height: 130,
        padding: 15,
        fontSize: 16,
        color: "#333",
    },
    footer: {
        padding: 20,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    saveButton: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 12,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonGradient: {
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700"
    },
    cancelButton: {
        paddingVertical: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 16,
        fontWeight: "600",
    }
})
