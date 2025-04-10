import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Dimensions, Platform, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Link } from "expo-router";

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
        label: "Three times daily",
        icon: "time-outline" as const,
        times: ["09:00", "15:00", "21:00"],
    },
    {
        id: "4",
        label: "Four times daily",
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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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

    const renderFrequencyOptions = () => {
        return (
            <View>
                {FREQUENCIES.map((freq) => (
                    <TouchableOpacity
                        key={freq.id}
                    // onPrress={ }
                    >
                        <View>
                            <Ionicons
                                name={freq.icon}
                                size={14}
                            // color={ }
                            />
                            <Text>{freq.label}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )
    };

    const renderDurationOptions = () => {
        return (
            <View>
                {DURATIONS.map((dur) => (
                    <TouchableOpacity
                        key={dur.id}
                    // onPrress={ }
                    >
                        <View>
                            <Text>{dur.value > 0 ? dur.value : "∞"}</Text>
                            <Text>{dur.label}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )
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
                    <TouchableOpacity style={styles.backButton}>
                        <Link href={"/home"}>
                            <Ionicons name="chevron-back" size={28} color={'#1a8e2d'} />
                        </Link>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Medication</Text>
                </View>

                {/*  */}
                <ScrollView showsHorizontalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.formContentContainer}
                >
                    {/* basic informations to add medications */}
                    <View>
                        <View>
                            <TextInput
                                placeholder="Medication Name"
                                placeholderTextColor={'#999'}
                            />
                        </View>
                        <View>
                            <TextInput
                                placeholder="Dosage (e.g., 500mg)"
                                placeholderTextColor={'#999'}
                            />
                        </View>
                    </View>

                    {/* schedule */}
                    <View>
                        <Text>How often?</Text>
                        {renderFrequencyOptions()}
                        {/* render frequency options */}

                        <Text>For how long?</Text>
                        {renderDurationOptions()}
                        {/* rebder duration options */}

                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <View>
                                <Ionicons name="calendar" size={24} color={"#1a8e2d"} />
                            </View>
                            <Text>Starts: {form.startDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                            <View>
                                <Ionicons name="time" size={24} color={"#1a8e2d"} />
                            </View>
                            <Text>Time: {form.times[0]}</Text>
                        </TouchableOpacity>

                        {/* <DateTimePicker
                            value={form.startDate}
                            mode="date"
                        />
                        <DateTimePicker
                            mode="time"
                            value={(() => {
                                const [hours, mintues] = form.times[0].split(":").map(Number);
                                const date = new Date();
                                date.setHours(hours, mintues, 0, 0);
                                return date;
                            })()}
                        /> */}

                        {showDatePicker && (
                            <DateTimePicker
                                testID="datePicker"
                                value={form.startDate}
                                mode="date"
                                is24Hour={true}
                                onChange={onDateChange}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            />
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
                                onChange={onTimeChange}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            />
                        )}
                    </View>

                    {/* Reminder */}
                    <View>
                        <View>
                            <View>
                                <View>
                                    <View>
                                        <Ionicons name="notifications" ccolor={"#1a8e2d"} />
                                    </View>
                                    <View>
                                        <Text>Reminder</Text>
                                        <Text>
                                            Get notified when its time to take your medications
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    trackColor={{ false: "#ddd", true: "#1a8e2d" }}
                                    thumbColor={'white'}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Refill Tracking */}

                    {/* Notes */}
                    <View>
                        <View>
                            <TextInput
                                placeholder="Add notes or special instructions..."
                                placeholderTextColor='#999'
                            />
                        </View>
                    </View>


                </ScrollView>

                <View>
                    <TouchableOpacity>
                        <LinearGradient
                            colors={["#1a8e2d", "#146922"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text>
                                Add Medication
                                {/* {isSubmitting ? "Adding..." : "Add Medication"} */}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS == 'ios' ? 180 : 140,
    },
    content: {
        flex: 1,
        paddingTop: Platform.OS == 'ios' ? 50 : 30,
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

    }
})
