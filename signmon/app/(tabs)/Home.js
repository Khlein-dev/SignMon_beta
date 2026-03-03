import React, { useState, useRef } from "react";
import { ImageBackground, Animated } from "react-native";
import Pet from "@/components/Pet";
import BottomPanel from "@/components/BottomPanel";
import RightPanel from "@/components/RightPanel";
import LeftPanel from "@/components/LeftPanel";
import LockedModal from "@/components/LockedModal";

const Dashboard = () => {
    const [showBottomPanel, setShowBottomPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [isLockedModalVisible, setIsLockedModalVisible] = useState(false);
    const [selectedHat, setSelectedHat] = useState(null);

    const bottomSlideAnim = useRef(new Animated.Value(0)).current;
    const rightSlideAnim = useRef(new Animated.Value(0)).current;
    const leftSlideAnim = useRef(new Animated.Value(0)).current;

    const handleHatPress = (hatType, isLocked) => {
        if (isLocked) {
            setIsLockedModalVisible(true);
        } else {
            setSelectedHat(hatType);
        }
    };

    return (
        <ImageBackground
            source={require("@/assets/images/background.jpg")}
            style={{ flex: 1 }}
        >
            <Pet selectedHat={selectedHat} />

            <BottomPanel visible={showBottomPanel} slideAnim={bottomSlideAnim} />
            <RightPanel
                visible={showRightPanel}
                slideAnim={rightSlideAnim}
                setSelectedHat={setSelectedHat}
                handleHatPress={handleHatPress}
            />
            <LeftPanel
                visible={showLeftPanel}
                slideAnim={leftSlideAnim}
            />

            <LockedModal
                visible={isLockedModalVisible}
                onClose={() => setIsLockedModalVisible(false)}
            />
        </ImageBackground>
    );
};

export default Dashboard;