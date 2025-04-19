import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, StyleSheet, Modal } from "react-native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const QUICK_ACTIONS = [
    {
        icon: "add-circle-outline" as const,
        label: "Add\nMedication",
        route: "/medications/add" as const,
        color: "#2E7D32",
        gradient: ["#4CAF50", "#2E7D32"] as [string, string],
    },
    {
        icon: "calendar-outline" as const,
        label: "Calendar\nView",
        route: "/calendar" as const,
        color: "#1976D2",
        gradient: ["#2196F3", "#1976D2"] as [string, string],
    },
    {
        icon: "time-outline" as const,
        label: "History\nLog",
        route: "/history" as const,
        color: "#C2185B",
        gradient: ["#E91E63", "#C2185B"] as [string, string],
    },
    {
        icon: "medical-outline" as const,
        label: "Refill\nTracker",
        route: "/refills" as const,
        color: "#E64A19",
        gradient: ["#FF5722", "#E64A19"] as [string, string],
    },
];

interface CircularProgressProps {
    progress: number;
    total: number;
    completed: number;
}

function CircularProgress({
    progress,
    total,
    completed
}: CircularProgressProps) {
    const animationValue = useRef(new Animated.Value(0)).current;
    const size = width * 0.55;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animationValue, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: true,
        }).start();

    }, [progress]);

    const strokeDashffest = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0]
    });

    return (
        <View style={styles.progressContainer}>
            <View style={styles.progresTextContainer}>
                <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                <Text style={styles.progressLabel}>{completed} of {total} Done</Text>
            </View>
            <Svg width={size} height={size} style={styles.progressRing}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="white"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashffest}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
        </View>
    )
}

const HomeScreen = () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    // Calculate header background opacity based on scroll
    const headerBackground = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: ["#1a8e2d", "rgba(16, 107, 9, 0.96)"],
        extrapolate: 'clamp'
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.staticHeader,
                    {
                        backgroundColor: headerBackground,
                    }
                ]}
            >
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.greeting}>Daily Progress</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color="white" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationCount}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.ScrollView 
                showsVerticalScrollIndicator={true}
                style={[styles.container, { marginTop: 90 }]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
                    <View style={styles.headerContent}>
                        <CircularProgress progress={70} total={10} completed={5} />
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.quickActionContainer}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActionGrid}>
                            {
                                QUICK_ACTIONS.map((action, index) => (
                                    // as any
                                    <Link href={action.route as any} key={action.label} asChild>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <LinearGradient colors={action.gradient} style={styles.actionGradient}>
                                                <View style={styles.actionContent}>
                                                    <View style={styles.actionIcon}>
                                                        <Ionicons name={action.icon} size={24} color="white" />
                                                    </View>
                                                    <Text style={styles.actionLabel}>
                                                        {action.label}
                                                    </Text>
                                                </View>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </Link>
                                ))
                            }
                        </View>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 20 }}>
                    <View style={styles.seactionHeader}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        <Link href={"/calendar" as any} asChild>
                            <TouchableOpacity>
                                <Text style={styles.seeAllButton}>Sell All</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {true ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="medical-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyStateText}>No Medications Scheduled for today</Text>
                            <Link href={"/medications/add" as any} asChild>
                                <TouchableOpacity style={styles.addMedicationButton}>
                                    <Text style={styles.addMedicationButtonText}>Add Medication</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    ) : (
                        [].map((medications) => {
                            // const taken = 
                            return (
                                <View style={styles.doseCard}>
                                    <View style={[styles.doseBadge,
                                        // { 
                                        //     backgroundColor: "#4CAF50" 
                                        // }
                                    ]}>
                                        <Ionicons name="medical" size={24} />
                                    </View>
                                    <View style={styles.doseInfo}>
                                        <View>
                                            <Text style={styles.medicineName}>time</Text>
                                            <Text style={styles.doseInfo}>dosage</Text>
                                        </View>
                                        <View style={styles.doseTime}>
                                            <Ionicons name="time-outline" size={16} color="#ccc" />
                                            <Text style={styles.timeText}>time</Text>
                                        </View>
                                    </View>

                                    {true ? (
                                        <View style={styles.takeDoseButton}>
                                            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                                            <Text style={styles.takeDoseText}>Taken</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.takeDoseButton}>
                                            <Text style={styles.takeDoseText}>Take</Text>
                                        </TouchableOpacity>
                                    )};
                                </View>
                            );
                        })
                    )}
                </View>

                <Modal visible={false} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Notification</Text>
                            <TouchableOpacity style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {[].map((medication) => (
                            <View style={styles.notificationItem}>
                                <View style={styles.notificationIcon}>
                                    <Ionicons name="medical" size={24} />
                                </View>
                                <View style={styles.notoficationContent}>
                                    <Text style={styles.notificationTitle}>medication name</Text>
                                    <Text style={styles.notificationMessage}>medication dosage</Text>
                                    <Text style={styles.notificationTime}>medication time</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Modal>

            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    staticHeader: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 10,
        height: 90,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 20, // Reduced padding since we have static header
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 50,
    },
    headerTop: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginTop: 30, // Adjust for status bar
    },
    greeting: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        opacity: 0.9,
    },
    content: {
        flex: 1,
        paddingTop: 20,
    },
    notificationButton: {
        position: 'relative',
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 12,
        marginLeft: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: -6,
        right: -4,
        backgroundColor: "#ff5252",
        borderRadius: 100,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        minWidth: 20,
        borderColor: "transparent",
    },
    notificationCount: {
        fontSize: 11,
        color: "white",
        fontWeight: "bold",
    },
    progressContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    progresTextContainer: {
        position: "absolute",
        zIndex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    progressPercentage: {
        fontSize: 36,
        color: "white",
        fontWeight: "bold",
    },
    progressLabel: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "bold",
    },
    progressDetails: {
        fontSize: 11,
        color: "White",
        fontWeight: "bold",
    },
    progressRing: {
        transform: [{ rotate: "-90deg" }],
    },
    quickActionContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    quickActionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 15,
    },
    actionButton: {
        width: (width - 52) / 2,
        height: 110,
        borderRadius: 16,
        overflow: "hidden",
    },
    actionGradient: {
        flex: 1,
        padding: 15,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    actionLabel: {
        fontSize: 14,
        color: "white",
        fontWeight: "600",
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 15,
    },
    actionContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    seactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    seeAllButton: {
        color: "#2E7D32",
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        padding: 30,
        backgroundColor: "white",
        borderRadius: 16,
        marginTop: 10,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        marginTop: 10,
        marginBottom: 20,
    },
    addMedicationButton: {
        backgroundColor: "#1a8e2d",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    addMedicationButtonText: {
        color: "white",
        fontWeight: "600",
    },
    doseCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    doseBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    medicineName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    doseInfo: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    doseTime: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        marginLeft: 5,
        color: "#666",
        fontSize: 14,
    },
    takeDoseButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginLeft: 10,
    },
    takeDoseText: {
        fontSize: 14,
        color: "white",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        padding: 5,
    },
    notificationItem: {
        flexDirection: "row",
        padding: 15,
        borderRadius: 12,
        backgroundColor: "#f5f5f5",
        marginBottom: 10
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        marginRight: 15,
    },
    notoficationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4
    },
    notificationTime: {
        fontSize: 12,
        color: "#999",
    },

});
export default HomeScreen;