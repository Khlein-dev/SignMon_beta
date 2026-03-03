import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

const LockedModal = ({ visible, onClose }) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                }}
            >
                <View
                    style={{
                        width: 300,
                        padding: 20,
                        backgroundColor: "#005BBB",
                        borderRadius: 10,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                        Locked!
                    </Text>

                    <Text style={{ marginVertical: 10, textAlign: "center" }}>
                        Complete Lesson 1 to unlock this hat.
                    </Text>

                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: "#ffa600",
                            padding: 10,
                            borderRadius: 5,
                            width: "50%",
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ fontWeight: "bold" }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default LockedModal;