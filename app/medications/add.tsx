import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Dimensions, Platform, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

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

    const [form, setForm] = useState({
        naem: "",
        dosage: "",
        frequency: "",
        duration: "",
        startDate: new Date(),
        times: ["09:00"],
        notes: "",
        reminderEnabled: true,
        refillReminder: false,
        refillAt: "",
    });

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
        <View>
            {/* */}
            <LinearGradient
                colors={["#1a8e2d", "146922"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <View>
                <View>
                    <TouchableOpacity>
                        <Ionicons name="chevron-back" size={28} color={'#1a8e2d'} />
                    </TouchableOpacity>
                    <Text>New Medication</Text>
                </View>

                {/*  */}
                <ScrollView showsHorizontalScrollIndicator={false}>
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
                        <View>
                            <Text>How often?</Text>
                            {renderFrequencyOptions()}
                            {/* render frequency options */}

                            <Text>For how long?</Text>
                            {renderDurationOptions()}
                            {/* rebder duration options */}

                            <TouchableOpacity>
                                <View>
                                    <Ionicons name="calendar" size={24} color={"#1a8e2d"} />
                                </View>
                                <Text>Starts: { }</Text>
                            </TouchableOpacity>

                            <DateTimePicker
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
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}
