
import { AuthContext } from "@/lib/authUserprovider";
import { useContext } from "react";
import { Button, StyleSheet, View } from "react-native";

export default function BookmarkRecipe(){
    const {userId} = useContext(AuthContext);
    console.log("Bookmark button pressed, userId:", userId);



    return (
    <View style={styles.container}>
        <Button title="bookmark" onPress={()=>{
            console.log("Bookmark button pressed, userId:", userId);
        }}></Button>
    </View>
)
} 

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
}

})

