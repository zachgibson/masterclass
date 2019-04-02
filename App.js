import React, { Component, Fragment } from 'react';
import { StyleSheet, View, Text, Dimensions, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import DATA from './data';

const { add, sub, abs, interpolate, Extrapolate } = Animated;

const windowWidth = Dimensions.get('window').width;
const halfWindowWidth = windowWidth / 2;
const windowHeight = Dimensions.get('window').height;
const halfWindowHeight = windowHeight / 2;

const numberOfColumns = 8;

const tileWidth = 120;
const tileHeight = 200;
const tileMargin = 8;

const chunk = (arr, len) => {
    var chunks = [],
        i = 0,
        n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, (i += len)));
    }

    return chunks;
};

const DebugCrossHairs = ({ isVisible }) =>
    isVisible && (
        <Fragment>
            <View pointerEvents="none" style={styles.verticalDebugLine} />
            <View pointerEvents="none" style={styles.horizontalDebugLine} />
        </Fragment>
    );

class Tile extends Component {
    state = { left: 0 };

    captureTileLayout = ({ nativeEvent: { layout } }) => {
        this.setState({ left: layout.x });
    };

    render() {
        const centerX = this.state.left + tileWidth / 2;
        const centerY = this.props.parentContainerTopVal + tileHeight / 2;
        const animXYVal = add(
            abs(sub(centerX - halfWindowWidth, this.props.animValX)),
            abs(sub(centerY - halfWindowHeight, this.props.animValY))
        );

        const scale = interpolate(animXYVal, {
            inputRange: [0, 160],
            outputRange: [1, 0.75],
            extrapolate: Extrapolate.CLAMP
        });
        const opacity = interpolate(animXYVal, {
            inputRange: [0, 200],
            outputRange: [1, 0.25],
            extrapolate: Extrapolate.CLAMP
        });
        const borderOpacity = interpolate(animXYVal, {
            inputRange: [0, 150],
            outputRange: [1, 0],
            extrapolate: Extrapolate.CLAMP
        });
        const textOpacity = interpolate(animXYVal, {
            inputRange: [0, 60, 75],
            outputRange: [1, 1, 0],
            extrapolate: Extrapolate.CLAMP
        });

        return (
            <Animated.View
                style={[
                    styles.tile,
                    {
                        opacity,
                        transform: [
                            {
                                scale
                            }
                        ]
                    }
                ]}
                onLayout={this.captureTileLayout}
            >
                <Image
                    style={StyleSheet.absoluteFill}
                    source={this.props.uri}
                />
                <LinearGradient
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.View
                    style={[
                        styles.tileBorder,
                        {
                            opacity: borderOpacity
                        }
                    ]}
                />
                <Animated.View
                    style={{
                        alignItems: 'center',
                        opacity: textOpacity
                    }}
                >
                    <Text style={styles.tileText}>{this.props.firstName}</Text>
                    <Text style={styles.tileText}>{this.props.lastName}</Text>
                </Animated.View>
            </Animated.View>
        );
    }
}

class TilesRow extends Component {
    state = { top: 0 };

    captureTileLayout = ({ nativeEvent: { layout } }) => {
        this.setState({ top: layout.y });
    };

    render() {
        return (
            <View style={styles.tilesRow} onLayout={this.captureTileLayout}>
                {this.props.chunkOfTiles.map(data => (
                    <Tile
                        key={data.firstName}
                        parentContainerTopVal={this.state.top}
                        animValX={this.props.animValX}
                        animValY={this.props.animValY}
                        {...data}
                    />
                ))}
            </View>
        );
    }
}

export default class App extends Component {
    animValX = new Animated.Value(0);
    animValY = new Animated.Value(0);
    _onScroll = Animated.event([
        {
            nativeEvent: {
                contentOffset: { x: this.animValX, y: this.animValY }
            }
        }
    ]);

    render() {
        return (
            <View style={styles.container}>
                <Animated.ScrollView
                    style={styles.scrollView}
                    scrollEventThrottle={1}
                    onScroll={this._onScroll}
                >
                    <View style={styles.scrollViewContent}>
                        {chunk(DATA, numberOfColumns).map(chunk => (
                            <TilesRow
                                key={chunk[0].firstName}
                                chunkOfTiles={chunk}
                                animValX={this.animValX}
                                animValY={this.animValY}
                            />
                        ))}
                    </View>
                </Animated.ScrollView>
                <DebugCrossHairs isVisible={false} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    scrollView: {},
    scrollViewContent: {
        paddingVertical: windowHeight / 2 - tileHeight / 2 - tileMargin
    },
    tilesRow: {
        flexDirection: 'row',
        paddingHorizontal: windowWidth / 2 - tileWidth / 2 - tileMargin
    },
    tile: {
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: tileWidth,
        height: tileHeight,
        margin: tileMargin,
        paddingBottom: 16,
        backgroundColor: '#000',
        borderRadius: 6
    },
    tileBorder: {
        ...StyleSheet.absoluteFillObject,
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 6
    },
    tileText: {
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        color: '#fff'
    },
    verticalDebugLine: {
        position: 'absolute',
        width: 1,
        height: windowHeight,
        backgroundColor: 'red'
    },
    horizontalDebugLine: {
        position: 'absolute',
        width: windowWidth,
        height: 1,
        backgroundColor: 'red'
    }
});
