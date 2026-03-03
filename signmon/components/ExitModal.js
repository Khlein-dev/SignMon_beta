import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

const ExitModal = ({ visible, onClose, onExit }) => {
    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <View style={{ backgroundColor: "#005BBB", padding: 20, borderRadius: 10 }}>
                    <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                        Oh, you are leaving me?
                    </Text>

                    <TouchableOpacity onPress={onExit}>
                        <Text>Abandon your pet</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose}>
                        <Text>STAY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ExitModal;