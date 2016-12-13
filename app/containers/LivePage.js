/**
 * 直播交互页
 *
 * @flow
 */
'use strict';
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import TimerMixin from 'react-timer-mixin';

import Colors from '../assets/Colors';
import styles from './Live.css';
import data from '../data/live.json';
import Button from '../components/Button';
import Icon from '../mixins/icons';
import BubbleEffect from '../modules/live/BubbleEffect';
import Avator from '../modules/live/Avator';
import ChatRoom from '../modules/live/ChatRoom';
import QuestionArea from '../modules/live/QuestionArea';
import Marquee from '../modules/live/Marquee';

const window = Dimensions.get('window');
export default class LivePage extends Component {
    constructor(props) {
        super(props);
        this.followed=false;
        this.state = {
            layout: {x:190, y:0, width:140},
        };
    }

    componentWillMount() {
        //进入时切到横屏
        Orientation.lockToLandscape();


    }

    componentDidMount() {

        this.marquee = this.refs['marquee'];
        this.question = this.refs['question'];
        this.chatRoom = this.refs['chatRoom'];
        this.bubbles = this.refs['bubbles'];

        //渲染页面后执行测试
        this._test();
    }

    componentWillUnmount() {

        //推出时切回竖屏
        Orientation.lockToPortrait();
    }

    render() {
        var {layout}=this.state;



        if(layout&&layout.width<100){
            layout.width= 300;
            layout.y = 50;
            layout.x = (window.height-300)*.5;
        }

        return (
            <View style={styles.container}>
                <Video source={{uri: 'http://10.10.103.21/videos/live.mp4'}}   // Can be a URL or a local file.
                       ref={(ref) => { this.player = ref }}                             // Store reference
                       rate={1.0}                     // 0 is paused, 1 is normal.
                       volume={1.0}                   // 0 is muted, 1 is normal.
                       muted={false}                  // Mutes the audio entirely.
                       paused={false}                 // Pauses playback entirely.
                       resizeMode="cover"             // Fill the whole screen at aspect ratio.
                       repeat={true}                  // Repeat forever.
                       playInBackground={false}       // Audio continues to play when app entering background.
                       playWhenInactive={false}       // [iOS] Video continues to play when control or notification center are shown.
                       progressUpdateInterval={250.0} // [iOS] Interval to fire onProgress (default to ~250ms)
                       onLoadStart={this._onLoadStart}   // Callback when video starts to load
                       onLoad={this._onLoad}      // Callback when video loads
                       onProgress={this._onProgress}      // Callback every ~250ms with currentTime
                       onEnd={this._onEnd}             // Callback when playback finishes
                       onError={this._onError}      // Callback when video cannot be loaded
                       style={styles.player} />

                <View style={styles.interactive}>

                    <View style={styles.top_area}>
                        <View //直播主信息
                            style={styles.author_info}>
                            <Avator {...data.author}/>
                            <View style={styles.author_info_text}>
                                <Text style={[styles.author_info_name, styles.font_size_14]}>丽都整形医院</Text>
                                <View style={styles.flex_row}>
                                    <Text style={[styles.color_pink, styles.font_size_12]}>2563</Text><Text style={[styles.color_white, styles.font_size_12]}>人在线</Text>
                                </View>
                            </View>
                            <Button onPress={this._onFollow} disabled={this.followed} style={styles.author_info_subscribe} elementId={'xihuan'}
                                    renderDisabled={()=>{
                                        return(
                                            <View style={styles.author_info_subscribe}>
                                                <Icon name={'hudong-xihuan-pressed'} size={22} color={'rgba(255,255,255,.5)'}/>
                                            </View>
                                        );
                                    }}>
                                <Icon name={'xihuan'} size={24} color={Colors.white}/>
                            </Button>
                        </View>
                        <View style={styles.flex_1} onLayout={this._setMarqueeWidth}/>
                        <View //收看者列表
                            style={styles.visitor_list}>
                            <ScrollView//mark:需要改成ListView支持分页加载和局部更新
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                showsVerticalScrollIndicator={false}
                                style={styles.flex_1}>
                                {this._getAvator()}
                            </ScrollView>
                        </View>
                    </View>

                    <Marquee //跑马灯
                        ref='marquee' style={[styles.marquee_area, {top: layout.y+20, left:layout.x+10, width:layout.width}]}/>

                    <QuestionArea //提问区
                        ref='question' style={styles.question_area}/>

                    <ChatRoom //聊天室
                        ref='chatRoom' style={styles.chat_area}/>

                    <BubbleEffect //气泡特效
                        ref='bubbles' style={styles.bubble_area}/>


                    <View style={styles.bottom_area}>
                        <View style={styles.flex_row}>
                            <TouchableOpacity activeOpacity={.75} style={styles.doctor_btn}>
                                <Icon name={'tools-yisheng'} size={20} color={Colors.white}/>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={.75} style={styles.input_btn}>
                                <Icon name={'common-dingbuxiaoxi'} size={20} color={Colors.white}/>
                                <Text style={[styles.font_size_14, styles.color_gray, styles.margin_left_5]}>说点什么...</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity activeOpacity={.75} style={styles.add_bubble_btn} onPress={this._addBubble}>
                            <View style={{width:50, height:50, backgroundColor:'rgba(255, 120, 150, .6)', borderRadius:25,}}/>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity activeOpacity={.75} style={styles.close_btn}>
                    <Icon name={'common-close'} size={16} color={Colors.white}/>
                </TouchableOpacity>
            </View>
        );
    }

    _getAvator=()=>{
        let list=[];
        for(var i=0;i<9;i++){
            list.push(<Avator key={'avator_list'+i} {...data.author}/>)
        }
        return list;
    }

    _onFollow=(evt)=>{
        var btn = evt.target;
        this.followed=true;
        btn.setState({disabled:this.followed});
    }

    //加泡泡
    _addBubble=()=>{
        this.bubbles&&this.bubbles.addBubble();
    }

    //加消息
    _addMessage=(info)=>{
        this.chatRoom&&this.chatRoom.addMessage(info);
    }

    //加提示
    _addNotice=(info)=>{
        this.marquee&&this.marquee.addNotice(info);
    }

    //加问题
    _addQuestion=(info)=>{
        this.question&&this.question.addQuestion(info);
    }

    _setMarqueeWidth=(evt)=>{
        if (evt.nativeEvent&&evt.nativeEvent.layout) {
            this.setState({layout:evt.nativeEvent.layout});
        }
    }



//----------------测试代码-----------------

    _test=()=>{
        this._testMarquee();
        this._testQuestion();
        this._testChatRoom();
        this._testBubbleEffect();
    }

    _testMarquee(){
        TimerMixin.setTimeout(()=>{
            this._addNotice(data.notice);
        }, 3000);
    }

    _testQuestion(){
        var test_question = {
            id: new Date()*1,
            notice_type:2,
            txt:'医院地址在哪?'+Math.random()*10,
            author:data.author,
        };

        this._addQuestion(test_question);
        TimerMixin.setTimeout(()=>{
            this._testQuestion();
        }, Math.random()*9800+200)
    }

    _testChatRoom(){
        this._addMessage(data.messages[parseInt(Math.random()*4)]);
        TimerMixin.setTimeout(()=>{
            this._testChatRoom();
        }, 1000)
    }

    _testBubbleEffect(){
        this._addBubble();
        TimerMixin.setTimeout(()=>{
            this._testBubbleEffect();
        }, Math.random()*1000)
    }

}